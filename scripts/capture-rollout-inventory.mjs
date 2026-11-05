// Source-only inventory. Never reads environment files or configured databases.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const output = resolve(process.argv[2] ?? '/private/tmp/capture-4f-inventory.json'), baselineFile = process.argv[3];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const names = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).split('\0').filter(Boolean))].filter(path =>
  !/(^|\/)(node_modules|\.git|\.aws|\.agents|\.codex|\.vscode|\.local|\.next[^/]*|dist|coverage|storybook-static|test-results|playwright-report)(\/|$)/.test(path) &&
  (!/(^|\/)\.env[^/]*$/.test(path) || path === '.env.example') && resolve(path) !== output).sort();
const files = names.filter(path => { try { const stat = lstatSync(path); return stat.isFile() || stat.isSymbolicLink(); } catch { return false; } }).map(path => ({ path, sha256: digest(lstatSync(path).isSymbolicLink() ? readlinkSync(path) : readFileSync(path)) }));
const migrations = files.filter(file => /^packages\/data\/src\/migrations\/[^/]+\.ts$/.test(file.path));
let baseline = null;
if (baselineFile) {
  const previous = JSON.parse(readFileSync(baselineFile, 'utf8')), prior = new Map(previous.files.map(file => [file.path, file.sha256]));
  const known = previous.files.filter(file => /^packages\/data\/src\/migrations\/[^/]+\.ts$/.test(file.path));
  baseline = { source: resolve(baselineFile), migrationCount: known.length, addedMigrations: migrations.filter(file => !prior.has(file.path)), changedAppliedMigrationSource: migrations.filter(file => prior.has(file.path) && prior.get(file.path) !== file.sha256), note: 'Compares a local release manifest, not the live database ledger. Re-read the actual ledger before migration approval.' };
}
const result = { createdAt: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), digest: digest(JSON.stringify(files)), fileCount: files.length, migrationCount: migrations.length, baseline, files, note: 'Inventory of the current working source, not deployment authorization or a frozen upload. Includes pending work from other feature areas; review the full migration/source scope before packaging an application release.' };
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify({ fileCount: result.fileCount, migrationCount: result.migrationCount, addedSinceBaseline: baseline?.addedMigrations.length, changedAppliedMigrationSource: baseline?.changedAppliedMigrationSource.length, digest: result.digest }));
