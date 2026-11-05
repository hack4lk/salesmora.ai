import { createDatabase } from '@salesmora/data/database';
import { completeAdminEmailChange, EmailChangeCompletionError } from '@salesmora/data/accounts/email-change';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const responseHeaders = {
  'cache-control': 'no-store, max-age=0',
  'content-type': 'text/html; charset=utf-8',
  'content-security-policy': "default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

const databaseURL = process.env.DATABASE_URL;
if (!databaseURL) throw new Error('Missing DATABASE_URL; email-change confirmation cannot start.');
type GlobalDatabase = typeof globalThis & { salesmoraEmailChangeDb?: ReturnType<typeof createDatabase> };
const globalDatabase = globalThis as GlobalDatabase;
const database = globalDatabase.salesmoraEmailChangeDb ?? createDatabase(databaseURL);
if (process.env.NODE_ENV !== 'production') globalDatabase.salesmoraEmailChangeDb = database;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function page(title: string, content: string, status = 200) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head><body><main><h1>${escapeHtml(title)}</h1>${content}</main></body></html>`,
    { status, headers: responseHeaders });
}

function validToken(value: string | null): value is string {
  return value !== null && /^[\w-]{43}$/.test(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (url.searchParams.size !== 1 || !validToken(token)) {
    return page('Email-change link unavailable', '<p>This link is invalid or no longer active. Ask an administrator to send a new one.</p>', 400);
  }
  return page('Confirm your new email address',
    `<p>Confirming this change will update your email address and sign you out of all devices. You will need to sign in again.</p><form method="post" action="/change-email/confirm"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit">Confirm email address</button></form>`);
}

async function readForm(request: Request) {
  if (request.headers.get('content-type')?.split(';', 1)[0]?.trim() !== 'application/x-www-form-urlencoded') {
    throw new EmailChangeCompletionError('Submit the confirmation form to continue.', 400);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new EmailChangeCompletionError('Submit the confirmation form to continue.', 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2_048) {
      await reader.cancel();
      throw new EmailChangeCompletionError('The confirmation request is too large.', 400);
    }
    chunks.push(value);
  }
  const form = new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
  if ([...form.keys()].some(key => key !== 'token') || form.getAll('token').length !== 1) {
    throw new EmailChangeCompletionError('Submit the confirmation form to continue.', 400);
  }
  const token = form.get('token');
  if (!validToken(token)) throw new EmailChangeCompletionError('This email-change link is invalid or no longer active.', 400);
  return token;
}

export async function POST(request: Request) {
  const origin = process.env.BETTER_AUTH_URL;
  if (!origin || request.headers.get('origin') !== new URL(origin).origin) {
    return page('Email change not confirmed', '<p>Submit the confirmation from the SalesMora.ai email page.</p>', 403);
  }
  try {
    const token = await readForm(request);
    await completeAdminEmailChange(database, token);
    return page('Email address updated',
      '<p>Your email address is verified. All customer sessions have been revoked; sign in again to continue.</p><p><a href="/login">Sign in</a></p>');
  } catch (error) {
    if (error instanceof EmailChangeCompletionError) {
      return page('Email change not confirmed', `<p>${escapeHtml(error.message)}</p>`, error.status);
    }
    console.error('Customer email-change confirmation could not be completed.');
    return page('Email change temporarily unavailable', '<p>We could not confirm this email change right now. Please try again later.</p>', 503);
  }
}
