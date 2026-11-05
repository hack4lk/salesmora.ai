export type AdminEnvironment = 'local' | 'staging' | 'production';

export function getAdminEnvironment(
  configuredEnvironment = process.env.ADMIN_ENVIRONMENT,
  nodeEnvironment = process.env.NODE_ENV,
): AdminEnvironment {
  if (configuredEnvironment === undefined && nodeEnvironment !== 'production') return 'local';
  if (configuredEnvironment === 'staging' || configuredEnvironment === 'production') return configuredEnvironment;
  if (configuredEnvironment === 'local' && nodeEnvironment !== 'production') return configuredEnvironment;
  throw new Error('Set ADMIN_ENVIRONMENT to "staging" or "production" before starting the production admin app.');
}
