import { AsyncLocalStorage } from 'node:async_hooks';
import { EventEmitter, errorMonitor } from 'node:events';

type DatabaseSource = 'application' | 'authentication' | 'graph' | 'cancellation';
export type DatabasePhase = 'request' | 'accept' | 'runtime' | 'tools' | 'delivery' | 'checkpoint' | 'finalize' | 'cancellation';
type DatabaseOperation = 'session' | 'turn-evidence' | 'history' | 'page-context' | 'calendar-clock'
  | 'usage-reserve' | 'usage-finalize' | 'tool-admission' | 'tool-execution' | 'unattributed';
type Operation = 'read' | 'write' | 'transaction' | 'other';
interface Counts {
  calls: number;
  statements: number;
  authorityReads: number;
  fingerprintQueries: number;
  read: number;
  write: number;
  transaction: number;
  other: number;
  failed: number;
  pending: number;
  unobserved: number;
  durationMs: number;
}
interface Measurement {
  totals: Counts;
  sources: Partial<Record<DatabaseSource, Counts>>;
  phases: Partial<Record<DatabasePhase, Counts>>;
  operations: Partial<Record<`${DatabasePhase}:${DatabaseOperation}`, Counts>>;
}
type Context = { measurement: Measurement; phase: DatabasePhase; operation: DatabaseOperation };
const globals = globalThis as typeof globalThis & { salesmoraDatabaseMetrics?: AsyncLocalStorage<Context> };
const context = globals.salesmoraDatabaseMetrics ??= new AsyncLocalStorage<Context>();
const emptyCounts = (): Counts => ({
  calls: 0, statements: 0, authorityReads: 0, fingerprintQueries: 0,
  read: 0, write: 0, transaction: 0, other: 0, failed: 0, pending: 0, unobserved: 0, durationMs: 0,
});

export function createDatabaseMeasurement() {
  const measurement: Measurement = { totals: emptyCounts(), sources: {}, phases: {}, operations: {} };
  return {
    run<T>(work: () => T): T {
      return context.run({ measurement, phase: 'request', operation: 'unattributed' }, work);
    },
    snapshot() {
      return structuredClone(measurement);
    },
  };
}

export function withDatabasePhase<T>(phase: DatabasePhase, work: () => T): T {
  const current = context.getStore();
  return current ? context.run({ ...current, phase }, work) : work();
}

export function withDatabaseOperation<T>(operation: DatabaseOperation, work: () => T): T {
  const current = context.getStore();
  return current ? context.run({ ...current, operation }, work) : work();
}

function commandOf(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const commands = value.map(commandOf);
    return commands.find(command => command && ['INSERT', 'UPDATE', 'DELETE', 'MERGE'].includes(command)) ??
      commands.find(command => command && ['SELECT', 'SHOW', 'FETCH'].includes(command)) ?? commands[0];
  }
  if (value && typeof value === 'object' && 'command' in value && typeof value.command === 'string') {
    return value.command;
  }
}
function queryText(query: unknown) {
  return typeof query === 'string' ? query
    : query && typeof query === 'object' && 'text' in query && typeof query.text === 'string' ? query.text : '';
}
function operationOf(command: string | undefined, query: unknown): Operation {
  const text = queryText(query);
  const keyword = (command ?? text.trimStart().split(/\s/, 1)[0]).toUpperCase();
  if (['SELECT', 'SHOW', 'FETCH'].includes(keyword)) return 'read';
  if (['INSERT', 'UPDATE', 'DELETE', 'MERGE'].includes(keyword)) return 'write';
  if (/^(BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)\b/.test(keyword)) return 'transaction';
  return 'other';
}

/** Observe driver calls without retaining SQL, bindings, results, errors or identities. */
export function instrumentDatabaseClient<T extends (...args: never[]) => unknown>(
  client: { query: T }, source: DatabaseSource,
) {
  client.query = new Proxy(client.query, {
    apply(target, receiver, args: unknown[]) {
      const current = context.getStore();
      if (!current) return Reflect.apply(target, receiver, args);
      const { measurement, phase, operation: operationName } = current;
      const buckets = [
        measurement.totals,
        measurement.sources[source] ??= emptyCounts(),
        measurement.phases[phase] ??= emptyCounts(),
        measurement.operations[`${phase}:${operationName}`] ??= emptyCounts(),
      ];
      const initialOperation = operationOf(undefined, args[0]);
      const text = queryText(args[0]);
      const authorityReads = Number(/\bjoin\s+"workspaceRolePolicies"/i.test(text));
      const fingerprintQueries = Number(/\bmd5\s*\(/i.test(text));
      const started = performance.now();
      for (const bucket of buckets) {
        bucket.calls++; bucket.pending++;
        bucket.authorityReads += authorityReads;
        bucket.fingerprintQueries += fingerprintQueries;
      }
      let completed = false;
      const finish = (failed: boolean, result?: unknown) => {
        if (completed) return;
        completed = true;
        const operation = operationOf(commandOf(result), args[0]);
        const statements = Array.isArray(result) ? result.length : 1;
        const durationMs = performance.now() - started;
        for (const bucket of buckets) {
          bucket.pending--;
          bucket.statements += statements;
          bucket[operation]++;
          bucket.failed += Number(failed);
          bucket.durationMs += durationMs;
        }
      };
      const last = args.at(-1);
      const hasCallback = typeof last === 'function';
      if (hasCallback) args[args.length - 1] = new Proxy(last, {
        apply(callback, callbackReceiver, callbackArgs: unknown[]) {
          finish(!!callbackArgs[0], callbackArgs[1]);
          return Reflect.apply(callback, callbackReceiver, callbackArgs);
        },
      });
      try {
        const result: unknown = Reflect.apply(target, receiver, args);
        if (!hasCallback) {
          if (result instanceof Promise) void result.then(value => finish(false, value), () => finish(true));
          else if (result instanceof EventEmitter) {
            result.once('end', value => finish(false, value));
            result.once(errorMonitor, () => finish(true));
          } else {
            // Unsupported synchronous query APIs cannot provide completion timings.
            for (const bucket of buckets) { bucket.pending--; bucket.statements++; bucket[initialOperation]++; bucket.unobserved++; }
            completed = true;
          }
        }
        return result;
      } catch (error) {
        finish(true);
        throw error;
      }
    },
  });
}
