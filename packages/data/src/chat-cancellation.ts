import pg, { type Notification, type PoolClient } from 'pg';
import type { Knex } from 'knex';
import { instrumentDatabaseClient } from './database-metrics';

const channel = 'salesmora_chat_cancel';
const turnIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
interface CancellationHub {
  pool: pg.Pool;
  client?: PoolClient;
  connecting?: Promise<boolean>;
  listeners: Map<string, Set<{ notify: () => void; unavailable: () => void }>>;
  lastWarningAt: number;
}
const globals = globalThis as typeof globalThis & { salesmoraChatCancellation?: CancellationHub };

function warnUnavailable(error: unknown, hub: CancellationHub) {
  if (Date.now() - hub.lastWarningAt < 60_000) return;
  hub.lastWarningAt = Date.now();
  const code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
    ? error.code : 'unknown';
  console.warn('chat_cancellation_listener_unavailable', { code });
}

function hub(): CancellationHub | undefined {
  if (globals.salesmoraChatCancellation) return globals.salesmoraChatCancellation;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;
  const pool = new pg.Pool({
    connectionString, max: 1, connectionTimeoutMillis: 5_000, query_timeout: 5_000,
  });
  pool.on('connect', client => instrumentDatabaseClient(client, 'cancellation'));
  const state: CancellationHub = { pool, listeners: new Map(), lastWarningAt: 0 };
  globals.salesmoraChatCancellation = state;
  return state;
}

async function ensureListener(state: CancellationHub): Promise<boolean> {
  if (state.client) return true;
  if (state.connecting) return state.connecting;
  state.connecting = (async () => {
    let client: PoolClient | undefined;
    try {
      client = await state.pool.connect();
      const onNotification = (notification: Notification) => {
        const id = notification.payload;
        if (notification.channel !== channel || !id || !turnIdPattern.test(id)) return;
        for (const listener of state.listeners.get(id) ?? []) listener.notify();
      };
      let released = false;
      const disconnected = (error: unknown) => {
        if (released) return;
        released = true;
        if (state.client === client) state.client = undefined;
        warnUnavailable(error, state);
        for (const listeners of state.listeners.values())
          for (const listener of listeners) listener.unavailable();
        client?.release(error instanceof Error ? error : true);
      };
      client.on('notification', onNotification);
      client.on('error', disconnected);
      client.on('end', () => disconnected(new Error('Cancellation listener ended.')));
      try {
        await client.query(`LISTEN ${channel}`);
      } catch (error) {
        disconnected(error);
        return false;
      }
      if (released) return false;
      state.client = client;
      return true;
    } catch (error) {
      if (client) client.release(error instanceof Error ? error : true);
      warnUnavailable(error, state);
      return false;
    }
  })().finally(() => { state.connecting = undefined; });
  return state.connecting;
}

/** Publish only after a state transition; PostgreSQL delivers it after the transaction commits. */
export async function notifyChatCancellation(trx: Knex.Transaction, turnId: string) {
  if (!turnIdPattern.test(turnId)) throw new Error('Invalid chat turn identifier.');
  await trx.raw('SELECT pg_notify(?, ?)', [channel, turnId]);
}

/** Notifications are hints; subscribers must reload authoritative turn state before aborting. */
export function subscribeChatCancellation(
  turnId: string, notify: () => void, unavailable: () => void,
) {
  if (!turnIdPattern.test(turnId)) throw new Error('Invalid chat turn identifier.');
  const state = hub();
  if (!state) return { ready: Promise.resolve(false), unsubscribe() {} };
  const listener = { notify, unavailable };
  const listeners = state.listeners.get(turnId) ?? new Set();
  listeners.add(listener);
  state.listeners.set(turnId, listeners);
  let subscribed = true;
  return {
    ready: ensureListener(state),
    unsubscribe() {
      if (!subscribed) return;
      subscribed = false;
      listeners.delete(listener);
      if (!listeners.size) state.listeners.delete(turnId);
    },
  };
}
