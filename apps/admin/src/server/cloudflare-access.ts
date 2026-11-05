import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTVerifyGetKey,
} from 'jose';
import { staffEmailSchema } from '@salesmora/contracts';

export interface CloudflareAccessConfiguration {
  issuer: string;
  audience: string;
  jwksURL: URL;
}

type AccessEnvironment = Readonly<Record<string, string | undefined>>;

export class AccessConfigurationError extends Error {}
export class AccessTokenError extends Error {}

function staffEmail(value: unknown) {
  const parsed = staffEmailSchema.safeParse(value);
  if (!parsed.success) throw new AccessTokenError();
  return parsed.data;
}

export function getCloudflareAccessConfiguration(
  environment: AccessEnvironment = process.env,
): CloudflareAccessConfiguration {
  const teamDomain = environment.ADMIN_ACCESS_TEAM_DOMAIN?.trim();
  const audience = environment.ADMIN_ACCESS_AUD?.trim();
  if (!teamDomain || !audience) throw new AccessConfigurationError();

  let url: URL;
  try {
    url = new URL(`https://${teamDomain}`);
  } catch {
    throw new AccessConfigurationError();
  }
  if (url.hostname !== teamDomain.toLowerCase() || url.port || url.username || url.password ||
    url.pathname !== '/' || url.search || url.hash) {
    throw new AccessConfigurationError();
  }

  return {
    issuer: url.origin,
    audience,
    jwksURL: new URL('/cdn-cgi/access/certs', url),
  };
}

export function createVerifiedAccessHeaders(headers: Headers, email: string) {
  const requestHeaders = new Headers(headers);
  requestHeaders.delete('cf-access-jwt-assertion');
  requestHeaders.delete('x-admin-access-email');
  requestHeaders.set('x-admin-access-email', email);
  return requestHeaders;
}

export async function verifyCloudflareAccessJwt(
  token: string,
  configuration: CloudflareAccessConfiguration,
  getKey: JWTVerifyGetKey,
) {
  if (!token || token.length > 16_384) throw new AccessTokenError();
  try {
    const { payload } = await jwtVerify(token, getKey, {
      algorithms: ['RS256'],
      issuer: configuration.issuer,
      audience: configuration.audience,
    });
    return staffEmail(payload.email);
  } catch {
    throw new AccessTokenError();
  }
}

const remoteKeys = new Map<string, JWTVerifyGetKey>();

export async function getAdminAccessEmail(
  requestHeaders: Headers,
  environment: AccessEnvironment = process.env,
) {
  if (environment.NODE_ENV !== 'production' && environment.ADMIN_ACCESS_DEV_EMAIL !== undefined) {
    return staffEmail(environment.ADMIN_ACCESS_DEV_EMAIL);
  }

  const configuration = getCloudflareAccessConfiguration(environment);
  const token = requestHeaders.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 16_384) throw new AccessTokenError();

  let getKey = remoteKeys.get(configuration.jwksURL.href);
  if (!getKey) {
    getKey = createRemoteJWKSet(configuration.jwksURL);
    remoteKeys.set(configuration.jwksURL.href, getKey);
  }
  return verifyCloudflareAccessJwt(token, configuration, getKey);
}
