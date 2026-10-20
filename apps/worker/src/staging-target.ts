/** This operator command is intentionally locked to the approved staging worker. */
export function stagingTarget(env: NodeJS.ProcessEnv) {
  if (env.NODE_ENV !== 'production'
    || env.RAILWAY_PROJECT_ID !== 'e0865ab2-d136-4e6c-a1bd-e96af3e52e74'
    || env.RAILWAY_ENVIRONMENT_ID !== '41e4f7c2-f517-49ed-9c8e-6b654b926982'
    || env.RAILWAY_SERVICE_ID !== '6a92c5f4-6cad-4a68-9059-f3dc1297c4b0'
    || env.RAILWAY_ENVIRONMENT_NAME !== 'staging'
    || ['SALESMORA_TEST_SERVER', 'CHAT_TEST_PROVIDER', 'SALESMORA_PROXY_TEST', 'SALESMORA_LIVE_EVAL', 'TEST_DATABASE_URL'].some(key => Boolean(env[key]))) {
    throw Error('Publisher requires the approved Railway staging worker.');
  }
  try {
    const database = new URL(env.DATABASE_URL ?? '');
    if (!['postgres:', 'postgresql:'].includes(database.protocol)
      || database.hostname !== 'postgres.railway.internal'
      || database.pathname !== '/salesmora_staging' || database.hash
      || (database.port && database.port !== '5432')) throw Error();
  } catch { throw Error('Publisher requires the private staging database.'); }
  return env.DATABASE_URL!;
}
