import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { sendEmail, verifyEmailDelivery } from './transport';
import { renderEmailVerificationEmail } from './templates/email-verification/email-verification';
export async function sendVerificationEmail(to: string, url: string, baseURL: string) {
  await verifyEmailDelivery(baseURL);
  const link = new URL(url);
  // Use a fixed result page for both automatic registration and explicit resend.
  link.searchParams.set('callbackURL', new URL('/verify-email', baseURL).href);
  await sendEmail({
    to,
    ...renderEmailVerificationEmail(link.href),
    attachments: [{ filename: 'salesmora-logo.png', content: await readFile(path.join(process.cwd(), 'public/branding/salesmora-email-logo.png')), contentType: 'image/png', cid: 'salesmora-logo', contentDisposition: 'inline' }],
  }, baseURL);
}
