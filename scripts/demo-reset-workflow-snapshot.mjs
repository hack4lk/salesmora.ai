import { constants, closeSync, fstatSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, '.local', 'backups', 'demo-workflows');
const snapshotName = /^demo-workflows-[0-9a-f-]{36}\.json$/;
const arrays = ['workflows', 'services', 'sources', 'versions', 'drafts', 'publications',
  'templates', 'outreach', 'qualifiedWorkers', 'coverage', 'postalCodes', 'assignmentSettings'];

function assertSnapshot(snapshot) {
  if (!snapshot || snapshot.version !== 1 ||
      !['users', 'workspaces', 'timezones'].every(key => snapshot[key] && typeof snapshot[key] === 'object' && !Array.isArray(snapshot[key])) ||
      !arrays.every(key => Array.isArray(snapshot[key]))) {
    throw new Error('Invalid demo workflow snapshot.');
  }
}

function prepareDirectory() {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stat = lstatSync(directory);
  const resolvedRoot = realpathSync(root);
  const resolvedDirectory = realpathSync(directory);
  const location = relative(resolvedRoot, resolvedDirectory);
  if (!stat.isDirectory() || stat.isSymbolicLink() || (process.getuid && stat.uid !== process.getuid()) ||
      (stat.mode & 0o077) !== 0 || !location || location.startsWith('..') || isAbsolute(location) ||
      resolvedDirectory !== join(resolvedRoot, '.local', 'backups', 'demo-workflows')) {
    throw new Error('The workflow snapshot directory must be private, owned by this user, and inside the repository.');
  }
}

export function writeWorkflowSnapshot(snapshot) {
  assertSnapshot(snapshot);
  prepareDirectory();
  const filename = `demo-workflows-${randomUUID()}.json`;
  const path = join(directory, filename);
  const fd = openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try {
    writeFileSync(fd, JSON.stringify(snapshot));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  return path;
}

export function readWorkflowSnapshot(path) {
  prepareDirectory();
  const absolute = resolve(path);
  if (absolute !== join(directory, basename(absolute)) || !snapshotName.test(basename(absolute))) {
    throw new Error('Workflow snapshots must be read from the private demo workflow backup directory.');
  }
  const fd = openSync(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || (process.getuid && stat.uid !== process.getuid()) || (stat.mode & 0o077) !== 0) {
      throw new Error('The workflow snapshot must be a private regular file owned by this user.');
    }
    const snapshot = JSON.parse(readFileSync(fd, 'utf8'));
    assertSnapshot(snapshot);
    return snapshot;
  } finally {
    closeSync(fd);
  }
}
