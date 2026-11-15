import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';

const directory = fileURLToPath(new URL('./baseline-migrations', import.meta.url));
const baseline = '202611150001_fresh_baseline.ts';

export async function migrateFreshBaseline(db: Knex) {
  return db.transaction(async trx => {
    await trx.raw('SET LOCAL search_path TO public, pg_catalog');
    await trx.raw("SELECT pg_advisory_xact_lock(hashtext('salesmora.fresh-baseline'))");
    const { rows: [{ ledger }] } = await trx.raw<{
      rows: { ledger: string | null }[];
    }>(`SELECT to_regclass('public.knex_migrations')::text AS ledger`);
    const known = new Set(readdirSync(directory).filter(name => name.endsWith('.ts')));
    let hasBaseline = false;
    if (ledger) {
      const applied = await trx('knex_migrations').withSchema('public').select<{ name: string }[]>('name');
      if (applied.some(row => !known.has(row.name))) {
        throw new Error('This database has a legacy or unknown migration ledger. The fresh baseline cannot upgrade it; rebuild or use the historical migration release.');
      }
      hasBaseline = applied.some(row => row.name === baseline);
      if (applied.length > 0 && !hasBaseline) throw new Error('Migration ledger does not contain the fresh baseline.');
    }
    if (!hasBaseline) {
      const { rows: [{ occupied }] } = await trx.raw<{ rows: { occupied: boolean }[] }>(`
        SELECT EXISTS (
          SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind IN ('r','p','v','m','S','f','c')
            AND c.relname NOT IN ('knex_migrations', 'knex_migrations_lock')
            AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_class'::regclass
              AND d.objid = c.oid AND d.deptype = 'e')
        ) OR EXISTS (
          SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'public' AND NOT EXISTS (
            SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_proc'::regclass AND d.objid = p.oid AND d.deptype = 'e')
        ) OR EXISTS (
          SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public' AND t.typrelid = 0 AND t.typelem = 0 AND t.typisdefined
            AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_type'::regclass
              AND d.objid = t.oid AND d.deptype = 'e')
        ) OR EXISTS (
          SELECT 1 FROM pg_namespace n WHERE n.nspname NOT IN ('public', 'information_schema')
            AND n.nspname NOT LIKE 'pg\\_%' ESCAPE '\\'
        ) AS occupied`);
      if (occupied) throw new Error('The fresh baseline requires an empty database; existing schema objects were found.');
    }
    return trx.migrate.latest({ directory, loadExtensions: ['.ts'], schemaName: 'public' });
  });
}
