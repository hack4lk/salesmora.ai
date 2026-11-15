import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runDemoReset } from './demo-reset-orchestration.mjs';

const env = {
  MIGRATION_DATABASE_URL: 'postgresql://salesmora:example@127.0.0.1:55432/salesmora',
  DATABASE_URL: 'postgresql://salesmora_web:example@127.0.0.1:55432/salesmora',
  TEST_DATABASE_URL: 'postgresql://salesmora:example@127.0.0.1:55432/salesmora_test',
};

function actionsWithLog() {
  const calls = [];
  const actions = Object.fromEntries([
    'preflight', 'confirm', 'prepareCredentials', 'assertNoConnections', 'dropDatabase',
    'createDatabase', 'migrate', 'provisionRoles', 'seed', 'verify',
  ].map(name => [name, async () => {
    calls.push(name);
    if (name === 'confirm') return true;
    if (name === 'prepareCredentials') return { prepared: true };
  }]));
  return { calls, actions };
}

test('runs the complete reset in order and verifies before success', async () => {
  const { calls, actions } = actionsWithLog();
  const result = await runDemoReset(env, actions);
  assert.deepEqual(calls, [
    'preflight', 'confirm', 'prepareCredentials', 'assertNoConnections', 'dropDatabase',
    'createDatabase', 'migrate', 'provisionRoles', 'seed', 'verify',
  ]);
  assert.equal(result.status, 'complete');
  assert.equal(result.state, 'seeded');
});

test('cancellation and invalid targets cannot drop a database', async () => {
  const { calls, actions } = actionsWithLog();
  actions.confirm = async () => { calls.push('confirm'); return false; };
  assert.deepEqual(await runDemoReset(env, actions), { status: 'cancelled', state: 'unchanged' });
  assert.deepEqual(calls, ['preflight', 'confirm']);
  await assert.rejects(runDemoReset({ ...env, NODE_ENV: 'production' }, actions), /production/);
  assert.deepEqual(calls, ['preflight', 'confirm']);
});

test('preflight, credential and connection failures leave the database unchanged', async () => {
  for (const phase of ['preflight', 'prepareCredentials', 'assertNoConnections']) {
    const { calls, actions } = actionsWithLog();
    actions[phase] = async () => { throw new Error('test failure'); };
    await assert.rejects(runDemoReset(env, actions), /last confirmed state: unchanged/);
    assert.equal(calls.includes('dropDatabase'), false);
  }
});

test('reports the last completed state and does not report success on failure', async () => {
  for (const [phase, expected] of [
    ['dropDatabase', 'unchanged'], ['createDatabase', 'dropped'], ['migrate', 'empty'],
    ['provisionRoles', 'migrated'], ['seed', 'migrated'], ['verify', 'seeded'],
  ]) {
    const { actions } = actionsWithLog();
    actions[phase] = async () => { throw new Error('test failure'); };
    await assert.rejects(runDemoReset(env, actions), error => {
      assert.match(error.message, new RegExp(`last confirmed state: ${expected}`));
      assert.equal(error.cause.message, 'test failure');
      return true;
    });
  }
});
