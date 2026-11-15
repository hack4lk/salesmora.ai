const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

function localDatabaseURL(value, variable, database) {
  if (!value) throw new Error(`${variable} is required.`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variable} must be a valid PostgreSQL URL.`);
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
      !LOCAL_HOSTS.has(url.hostname) || url.port !== '55432' ||
      url.pathname !== `/${database}` || !url.username || !url.password ||
      url.search || url.hash) {
    throw new Error(`${variable} must point directly to the standard local ${database} database on port 55432, with credentials and no URL options.`);
  }
  return url;
}

export function validateDemoResetTarget(env) {
  if (env.NODE_ENV === 'production') {
    throw new Error('Demo reset is not available in production.');
  }
  const owner = localDatabaseURL(env.MIGRATION_DATABASE_URL, 'MIGRATION_DATABASE_URL', 'salesmora');
  const application = localDatabaseURL(env.DATABASE_URL, 'DATABASE_URL', 'salesmora');
  const test = localDatabaseURL(env.TEST_DATABASE_URL, 'TEST_DATABASE_URL', 'salesmora_test');
  if (decodeURIComponent(owner.username) !== 'salesmora') {
    throw new Error('MIGRATION_DATABASE_URL must use the local salesmora schema owner.');
  }
  if (owner.hostname !== application.hostname || owner.hostname !== test.hostname) {
    throw new Error('Development and test database URLs must use the same local host.');
  }
  return { host: owner.hostname, port: owner.port, database: 'salesmora' };
}
