import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Knex } from 'knex';

const directory = fileURLToPath(new URL('./migrations', import.meta.url));

/**
 * Rehearsal-only: runs the real migration files in name order, each in its own transaction like
 * `migrate.latest`, so a rehearsal can seed legacy data before one migration and still end on the
 * current schema. Bounds are file names without the extension; `after` is exclusive, `through` inclusive.
 * Run it on a connection whose search_path starts with a scratch schema.
 */
export async function replayMigrations(db: Knex, range: { after?: string; through?: string } = {}) {
  const names = readdirSync(directory).filter(file => file.endsWith('.ts')).map(file => file.slice(0, -3)).sort()
    .filter(name => (!range.after || name > range.after) && (!range.through || name <= range.through));
  if (range.through && !names.includes(range.through)) throw new Error(`Unknown migration ${range.through}.`);
  for (const name of names) {
    const migration = await import(pathToFileURL(`${directory}/${name}.ts`).href) as { up: (db: Knex) => Promise<void> };
    await db.transaction(trx => migration.up(trx));
  }
  return names;
}
