function configuration(
  env: NodeJS.ProcessEnv, args: readonly string[],
  role: 'salesmora_audit_worker' | 'salesmora_audit_verifier', variable: string,
) {
  if (args.length !== 0) throw new Error('Audit preparation accepts no command-line arguments.');
  const value = env[variable];
  if (!value) throw new Error(`${variable} is required; no customer database fallback is allowed.`);
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('Invalid audit worker database configuration.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.username !== role || !url.password ||
    !url.hostname || !url.pathname || url.pathname === '/' || url.hash ||
    [...url.searchParams.keys()].some(key => key !== 'sslmode') ||
    url.searchParams.getAll('sslmode').length > 1) {
    throw new Error('Audit worker requires a dedicated role URL with no connection overrides.');
  }

  if (env.NODE_ENV === 'production' || !['localhost', '127.0.0.1'].includes(url.hostname) ||
    !url.pathname.endsWith('_test')) {
    throw new Error('Preparation-only worker is restricted to the isolated local test database.');
  }
  const ledgerId = env.ADMIN_AUDIT_LEDGER_ID;
  if (!ledgerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ledgerId)) {
    throw new Error('Configure one stable ADMIN_AUDIT_LEDGER_ID UUID for this database.');
  }
  return { databaseURL: value, ledgerId: ledgerId.toLowerCase() };
}

export function auditWorkerConfiguration(env: NodeJS.ProcessEnv, args: readonly string[]) {
  return configuration(env, args, 'salesmora_audit_worker', 'ADMIN_AUDIT_DATABASE_URL');
}

export function auditVerifierConfiguration(env: NodeJS.ProcessEnv) {
  const config = configuration(env, [], 'salesmora_audit_verifier', 'ADMIN_AUDIT_VERIFIER_DATABASE_URL');
  const directory = env.ADMIN_AUDIT_VERIFIER_STATE_DIRECTORY;
  if (!directory) throw new Error('Private verifier checkpoint directory is required.');
  return { ...config, directory };
}
