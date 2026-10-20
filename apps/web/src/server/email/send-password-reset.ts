import 'server-only';
import { sendEmail } from './transport';
import { renderPasswordResetEmail } from './templates/password-reset/password-reset';

export async function sendPasswordResetEmail(to: string, url: string, baseURL: string) {
  try {
    await sendEmail({ to, ...renderPasswordResetEmail(url) }, baseURL);
  } catch {
    // Keep acknowledgement independent of account existence; never log reset links.
    console.error('Password reset email delivery failed. Check the configured email service.');
  }
}
