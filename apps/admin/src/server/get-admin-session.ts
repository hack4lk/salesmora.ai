import 'server-only';
import { APIError } from 'better-auth/api';
import { auth } from './auth';

export async function getAdminSession(requestHeaders: Headers) {
  try {
    return await auth.api.getSession({
      headers: requestHeaders,
      query: { disableCookieCache: true },
    });
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 401) return null;
    throw error;
  }
}
