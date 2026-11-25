export async function dropVerifiedDatabase(maintenance, owner, database, verify) {
  let gated = false;
  let closed = false;
  try {
    await owner.transaction(async trx => {
      await trx.raw('SET TRANSACTION ISOLATION LEVEL READ COMMITTED READ ONLY');
      const { rows: [{ pid }] } = await trx.raw('SELECT pg_backend_pid() AS pid');
      await maintenance.raw('ALTER DATABASE ?? WITH ALLOW_CONNECTIONS false', [database]);
      gated = true;
      const { rows } = await maintenance.raw(
        'SELECT pid, usename, application_name, state FROM pg_stat_activity WHERE datname = ? AND pid <> ? ORDER BY pid',
        [database, pid],
      );
      if (rows.length) {
        console.error('Stop these database clients before resetting:', rows);
        throw new Error('The development database has active connections.');
      }
      await verify(trx);
    });
    await owner.destroy();
    closed = true;
    await maintenance.raw('DROP DATABASE ??', [database]);
    gated = false;
  } finally {
    try {
      if (!closed) await owner.destroy();
    } finally {
      if (gated) await maintenance.raw('ALTER DATABASE ?? WITH ALLOW_CONNECTIONS true', [database]);
    }
  }
}
