import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { demoPasswordKeys, prepareDemoCredentials } from './demo-reset-credentials.mjs';

function withEnv(content, run) {
  const directory = mkdtempSync(join(tmpdir(), 'salesmora-demo-credentials-'));
  const path = join(directory, '.env.local');
  try {
    writeFileSync(path, content);
    run(path, directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('generates and retains credentials while preserving configuration', () => {
  withEnv('EXISTING_SETTING=keep', path => {
    chmodSync(path, 0o644);
    const first = prepareDemoCredentials(path);
    assert.equal(statSync(path).mode & 0o777, 0o600);
    assert.ok(readFileSync(path, 'utf8').startsWith('EXISTING_SETTING=keep\n'));
    for (const key of demoPasswordKeys) assert.match(first[key], /^[A-Za-z0-9_-]{43}$/);
    assert.equal(new Set(Object.values(first)).size, demoPasswordKeys.length);
    assert.deepEqual(prepareDemoCredentials(path), first);
  });
});

test('preserves a supplied password and creates only missing ones', () => {
  withEnv('DEMO_OWNER_PASSWORD="valid-password"\nOTHER=value\n', path => {
    const credentials = prepareDemoCredentials(path);
    assert.equal(credentials.DEMO_OWNER_PASSWORD, 'valid-password');
    assert.equal((readFileSync(path, 'utf8').match(/^DEMO_OWNER_PASSWORD=/gm) ?? []).length, 1);
    assert.match(readFileSync(path, 'utf8'), /^OTHER=value$/m);
  });
});

test('rejects invalid and duplicate passwords without writing new credentials', () => {
  for (const content of [
    'DEMO_OWNER_PASSWORD=short\n',
    'DEMO_OWNER_PASSWORD=valid-password\nDEMO_OWNER_PASSWORD=other-password\n',
  ]) {
    withEnv(content, path => {
      assert.throws(() => prepareDemoCredentials(path));
      assert.equal(readFileSync(path, 'utf8'), content);
    });
  }
});

test('rejects symbolic links', () => {
  withEnv('EXISTING=1\n', (path, directory) => {
    const link = join(directory, 'env-link');
    symlinkSync(path, link);
    assert.throws(() => prepareDemoCredentials(link));
  });
});
