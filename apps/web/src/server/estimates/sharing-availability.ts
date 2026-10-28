import { estimateSharingAvailable } from '@salesmora/domain';

export function configuredEstimateSharingAvailable(origin = process.env.BETTER_AUTH_URL) {
  return estimateSharingAvailable(origin, {
    environment: process.env.RAILWAY_ENVIRONMENT_NAME,
    enabled: process.env.ESTIMATE_EMAIL_ENABLED === 'true',
  });
}
