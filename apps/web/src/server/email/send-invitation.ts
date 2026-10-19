import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { sendEmail, verifyEmailDelivery } from './transport';
import { renderTeamInvitationEmail, type TeamInvitationEmailInput } from './templates/team-invitation/team-invitation';
export async function sendInvitationEmail(to: string, input: TeamInvitationEmailInput, baseURL: string) {
  await verifyEmailDelivery(baseURL);
  await sendEmail({ to, ...renderTeamInvitationEmail(input),
    attachments: [{ filename: 'salesmora-logo.png', content: await readFile(path.join(process.cwd(), 'public/branding/salesmora-email-logo.png')), contentType: 'image/png', cid: 'salesmora-logo', contentDisposition: 'inline' }],
  }, baseURL);
}
