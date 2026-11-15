import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateDemoResetTarget } from './demo-reset-safety.mjs';

const valid = {
  MIGRATION_DATABASE_URL: 'postgresql://salesmora:example@127.0.0.1:55432/salesmora',
  DATABASE_URL: 'postgresql://salesmora_web:example@127.0.0.1:55432/salesmora',
  TEST_DATABASE_URL: 'postgresql://salesmora:example@127.0.0.1:55432/salesmora_test',
};

test('accepts only the configured local development target', () => {
  assert.deepEqual(validateDemoResetTarget(valid), {
    host: '127.0.0.1', port: '55432', database: 'salesmora',
  });
  const localhost = Object.fromEntries(
    Object.entries(valid).map(([key, value]) => [key, value.replace('127.0.0.1', 'localhost')]),
  );
  assert.equal(validateDemoResetTarget(localhost).host, 'localhost');
});

test('rejects production, missing configuration, and an incorrect owner', () => {
  assert.throws(() => validateDemoResetTarget({ ...valid, NODE_ENV: 'production' }), /production/);
  assert.throws(() => validateDemoResetTarget({ ...valid, MIGRATION_DATABASE_URL: '' }), /required/);
  assert.throws(() => validateDemoResetTarget({
    ...valid, MIGRATION_DATABASE_URL: valid.MIGRATION_DATABASE_URL.replace('salesmora:example', 'other:example'),
  }), /schema owner/);
});

test('rejects remote hosts, incorrect ports, test targets, and URL options', () => {
  for (const replacement of [
    'postgresql://salesmora:example@remote.example:55432/salesmora',
    'postgresql://salesmora:example@127.0.0.1:5432/salesmora',
    'postgresql://salesmora:example@127.0.0.1:55432/salesmora_test',
    'postgresql://salesmora:example@127.0.0.1:55432/salesmora?host=remote.example',
    'postgresql://salesmora:example@127.0.0.1:55432/salesmora#fragment',
    'https://salesmora:example@127.0.0.1:55432/salesmora',
    'not a URL',
  ]) {
    assert.throws(() => validateDemoResetTarget({ ...valid, MIGRATION_DATABASE_URL: replacement }));
  }
});

test('rejects mismatched application or test database configuration', () => {
  assert.throws(() => validateDemoResetTarget({
    ...valid, DATABASE_URL: valid.DATABASE_URL.replace(':55432/salesmora', ':55432/salesmora_test'),
  }), /DATABASE_URL/);
  assert.throws(() => validateDemoResetTarget({
    ...valid, TEST_DATABASE_URL: valid.TEST_DATABASE_URL.replace('/salesmora_test', '/salesmora'),
  }), /TEST_DATABASE_URL/);
  assert.throws(() => validateDemoResetTarget({
    ...valid, TEST_DATABASE_URL: valid.TEST_DATABASE_URL.replace('127.0.0.1', 'localhost'),
  }), /same local host/);
});

test('does not expose malformed URL input in error messages', () => {
  assert.throws(
    () => validateDemoResetTarget({ ...valid, MIGRATION_DATABASE_URL: 'private-value' }),
    error => !error.message.includes('private-value'),
  );
});
