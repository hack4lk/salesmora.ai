import { readFile } from 'node:fs/promises';
import { processAssignmentEmails, type Knex } from '@salesmora/data';
import { sendEmail } from '@salesmora/data/email/transport';
import { renderLeadAssignedEmail } from '@salesmora/data/email/lead-assigned';
export async function startAssignmentEmails(db: Knex) {
  for (const table of ['assignmentEmailOutbox','assignmentNotifications','notificationPreferences']) if (!await db.schema.hasTable(table)) throw Error('Apply assignment notification migrations before starting worker.');
  const baseURL = process.env.BETTER_AUTH_URL ?? '';
  if (!baseURL) throw Error('Configure the app origin for assignment emails.');
  const logo = await readFile(new URL('../../../packages/data/src/email/salesmora-email-logo.png',import.meta.url));
  let stopped = false, running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = processAssignmentEmails(db,['leads.read'], async mail => {
      const { id, to, ...input } = mail;
      await sendEmail({ to, ...renderLeadAssignedEmail({ ...input, baseURL }), idempotencyKey: `lead-assigned-${id}`, attachments: [{filename:'salesmora-logo.png',content:logo,contentType:'image/png',cid:'salesmora-logo',contentDisposition:'inline'}] },baseURL);
    }).then(summary => { if (summary.failed || summary.retryPending) console.error(JSON.stringify({event:'worker.assignment_delivery_status',failed:summary.failed,retryPending:summary.retryPending})); }).catch(() => console.error(JSON.stringify({event:'worker.assignment_delivery_retry_pending'}))).finally(() => {running=undefined;});
  }
  const timer = setInterval(tick,5000); tick();
  return async () => {stopped=true;clearInterval(timer);await running;};
}
