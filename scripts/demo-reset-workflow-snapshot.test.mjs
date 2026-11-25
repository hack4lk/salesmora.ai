import assert from 'node:assert/strict';
import { chmodSync, statSync, symlinkSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { readWorkflowSnapshot, writeWorkflowSnapshot } from './demo-reset-workflow-snapshot.mjs';

const emptySnapshot = () => ({
  version: 1, users: {}, workspaces: {}, timezones: {}, workflows: [], services: [], sources: [],
  versions: [], drafts: [], publications: [], templates: [], outreach: [],
  qualifiedWorkers: [], coverage: [], postalCodes: [], assignmentSettings: [],
});

test('writes a private, readable workflow recovery snapshot', () => {
  const expected = emptySnapshot();
  const path = writeWorkflowSnapshot(expected);
  try {
    assert.equal(statSync(path).mode & 0o777, 0o600);
    assert.deepEqual(readWorkflowSnapshot(path), expected);
    chmodSync(path, 0o644);
    assert.throws(() => readWorkflowSnapshot(path), /private regular file/);
  } finally {
    unlinkSync(path);
  }
});

test('rejects invalid snapshots, external paths and symbolic links', () => {
  assert.throws(() => writeWorkflowSnapshot({ version: 1 }), /Invalid demo workflow snapshot/);
  assert.throws(() => readWorkflowSnapshot('/tmp/not-a-snapshot.json'), /private demo workflow backup directory/);
  const path = writeWorkflowSnapshot(emptySnapshot());
  const link = join(dirname(path), `demo-workflows-${randomUUID()}.json`);
  try {
    symlinkSync(path, link);
    assert.throws(() => readWorkflowSnapshot(link));
  } finally {
    unlinkSync(link);
    unlinkSync(path);
  }
});
