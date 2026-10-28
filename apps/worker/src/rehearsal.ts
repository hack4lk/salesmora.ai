/** Local Docker integration, isolated test database/queue, no provider calls. */
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Queue, QueueEvents } from 'bullmq';
import { localConfiguration } from './config.js';
if (!process.argv.includes('--test') || process.env.NODE_ENV === 'production') throw Error('Worker rehearsal requires local --test');
const config = localConfiguration();
const queue = new Queue(`${config.queueName}-chat-retention`, { connection: config.connection });
const events = new QueueEvents(queue.name, { connection: config.connection });
const children: ChildProcess[] = [];
const env = { ...process.env, NODE_ENV: 'test', WORKER_TASKS: 'retention', OPENAI_API_KEY: '' };
function start() {
  const child = spawn(process.execPath, ['--import', 'tsx', fileURLToPath(new URL('./index.ts', import.meta.url)), '--test'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  return new Promise<ChildProcess>((resolve, reject) => {
    const timeout = setTimeout(() => reject(Error('Worker did not become ready')), 15_000);
    let output = '';
    child.stdout!.on('data', chunk => {
      output += String(chunk);
      if (output.includes('"event":"worker.ready"')) {
        clearTimeout(timeout);
        if (!output.includes('"event":"worker.estimate_expiry_started","intervalMs":60000')) {
          reject(Error('Scheduled estimate expiry did not start'));
        } else resolve(child);
      }
    });
    // Drain generic diagnostic output without echoing connection/provider details.
    child.stderr!.on('data', () => {});
    child.once('exit', () => { clearTimeout(timeout); reject(Error('Worker exited before ready')); });
    child.once('error', () => { clearTimeout(timeout); reject(Error('Worker could not start')); });
  });
}
async function stop(child: ChildProcess) {
  const exited = once(child, 'exit'); child.kill('SIGTERM');
  const [code] = await exited; assert.equal(code, 0);
}
const jobs: string[] = [];
const deadline = setTimeout(() => { for (const child of children) child.kill('SIGKILL'); process.exit(1); }, 45_000);
try {
  await events.waitUntilReady();
  assert.equal(await queue.getWorkersCount(), 0, 'Rehearsal requires no other isolated test retention worker');
  let child = await start();
  const scheduler = await queue.getJobScheduler('daily-chat-retention');
  assert(scheduler); assert.equal(scheduler.pattern, '0 3 * * *');
  const first = await queue.add('expire-chat', {}, { jobId: randomUUID() }); jobs.push(first.id!);
  const result = await first.waitUntilFinished(events, 10_000); assert(Number.isInteger(result.deletedThreads));
  const failed = await queue.add('fictional-unknown-job', {}, { jobId: randomUUID(), attempts: 2, backoff: { type: 'fixed', delay: 100 } }); jobs.push(failed.id!);
  await assert.rejects(failed.waitUntilFinished(events, 10_000), /Unknown chat maintenance job/);
  assert.equal((await queue.getJob(failed.id!))?.attemptsMade, 2);
  const statusChild = spawn(process.execPath, ['--import', 'tsx', fileURLToPath(new URL('./status.ts', import.meta.url)), '--test'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(statusChild); let statusOutput = '';
  statusChild.stdout!.on('data', chunk => { statusOutput += String(chunk); }); statusChild.stderr!.on('data', () => {});
  assert.equal((await once(statusChild, 'exit'))[0], 0); assert.equal(JSON.parse(statusOutput.trim()).ready, true);
  const schedulers = await queue.getJobSchedulersCount();
  await stop(child); assert.equal(await queue.getWorkersCount(), 0);
  child = await start(); assert.equal(await queue.getJobSchedulersCount(), schedulers);
  const resumed = await queue.add('expire-chat', {}, { jobId: randomUUID() }); jobs.push(resumed.id!);
  assert(Number.isInteger((await resumed.waitUntilFinished(events, 10_000)).deletedThreads));
  await stop(child); assert.equal(await queue.getWorkersCount(), 0);
  console.log('PASS local Docker worker startup with scheduled estimate expiry, retention execution, retries/failure visibility, status, graceful shutdown, restart and stable scheduler; no provider calls.');
} finally {
  for (const child of children) if (child.exitCode === null) child.kill('SIGKILL');
  for (const id of jobs) await (await queue.getJob(id))?.remove();
  await events.close(); await queue.close(); clearTimeout(deadline);
}
