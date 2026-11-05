export const ADMIN_AUTH_COOKIE_PREFIX = 'sm_admin';
export const ADMIN_AUTH_ROLE = 'salesmora_admin_app';
export const ADMIN_AUTH_FACTOR_CHALLENGE_SECONDS = 300;

export interface AdminAuthConfiguration {
  databaseUrl: string;
  secret: string;
  baseURL: string;
  trustedOrigin: string;
  rpID: string;
  secureCookies: boolean;
}

type AdminAuthEnvironment = Readonly<Record<string, string | undefined>>;

function required(environment: AdminAuthEnvironment, key: string) {
  const value = environment[key];
  if (!value) throw new Error(`Missing ${key}; admin authentication cannot start.`);
  return value;
}

export function getAdminAuthConfiguration(
  environment: AdminAuthEnvironment = process.env,
): AdminAuthConfiguration {
  const databaseUrl = required(environment, 'ADMIN_DATABASE_URL');
  const secret = required(environment, 'ADMIN_AUTH_SECRET');
  const configuredURL = required(environment, 'ADMIN_AUTH_URL');
  if (secret.length < 32) throw new Error('ADMIN_AUTH_SECRET must contain at least 32 characters.');

  const database = new URL(databaseUrl);
  if (!['postgres:', 'postgresql:'].includes(database.protocol)) {
    throw new Error('ADMIN_DATABASE_URL must use PostgreSQL.');
  }
  if (decodeURIComponent(database.username) !== ADMIN_AUTH_ROLE) {
    throw new Error(`ADMIN_DATABASE_URL must use the ${ADMIN_AUTH_ROLE} database role.`);
  }

  const authURL = new URL(configuredURL);
  if (authURL.username || authURL.password || authURL.pathname !== '/' || authURL.search || authURL.hash) {
    throw new Error('ADMIN_AUTH_URL must be an origin without credentials, path, query, or fragment.');
  }
  const localHTTP = authURL.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(authURL.hostname);
  if (authURL.protocol !== 'https:' && !localHTTP) {
    throw new Error('ADMIN_AUTH_URL must use HTTPS except for localhost development.');
  }

  const rpID = environment.ADMIN_WEBAUTHN_RP_ID || authURL.hostname;
  if (rpID !== authURL.hostname) {
    throw new Error('ADMIN_WEBAUTHN_RP_ID must exactly match the admin authentication hostname.');
  }

  return {
    databaseUrl,
    secret,
    baseURL: authURL.origin,
    trustedOrigin: authURL.origin,
    rpID,
    secureCookies: authURL.protocol === 'https:',
  };
}

export function getAdminCustomerAppURL(
  environment: AdminAuthEnvironment = process.env,
) {
  const configuredURL = environment.CUSTOMER_APP_URL;
  if (!configuredURL) throw new Error('Missing CUSTOMER_APP_URL; workspace invitations cannot be sent.');
  const appURL = new URL(configuredURL);
  if (appURL.username || appURL.password || appURL.pathname !== '/' || appURL.search || appURL.hash) {
    throw new Error('CUSTOMER_APP_URL must be an origin without credentials, path, query, or fragment.');
  }
  const localHTTP = appURL.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(appURL.hostname);
  if (appURL.protocol !== 'https:' && !localHTTP) {
    throw new Error('CUSTOMER_APP_URL must use HTTPS except for localhost development.');
  }
  return appURL.origin;
}
