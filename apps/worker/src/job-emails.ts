import { renderJobDeadlineChangedEmail } from '@salesmora/data/email/job-deadline-changed';
import { renderJobAssignmentChangedEmail } from '@salesmora/data/email/job-assignment-changed';
import { renderJobStatusChangedEmail } from '@salesmora/data/email/job-status-changed';
import { readFile } from 'node:fs/promises';
import { permissionIds } from '@salesmora/contracts';
import { processJobEmails, type Knex } from '@salesmora/data';
import { sendEmail } from '@salesmora/data/email/transport';
import { renderJobCreatedEmail } from '@salesmora/data/email/job-created';

export async function startJobEmails(db: Knex) {
  if (!await db.schema.hasTable('jobNotifications') || !await db.schema.hasColumn('notificationPreferences', 'jobActivityEmail') || !await db.schema.hasColumn('jobNotifications', 'deadlineTimezone'))
    throw new Error('Apply Job notification migrations before starting the worker.');
  const baseURL = process.env.BETTER_AUTH_URL ?? '';
  if (!baseURL) throw new Error('Configure the app origin for Job emails.');
  const logo = await readFile(new URL('../../../packages/data/src/email/salesmora-email-logo.png', import.meta.url));
  let stopped = false, running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = processJobEmails(db, permissionIds, async mail => {
      await sendEmail({
        to: mail.to, ...(mail.event === 'deadline' ? renderJobDeadlineChangedEmail({ ...mail, baseURL }) : mail.event === 'assignment' ? renderJobAssignmentChangedEmail({ ...mail, baseURL }) : mail.event === 'status' ? renderJobStatusChangedEmail({ ...mail, baseURL }) : renderJobCreatedEmail({ ...mail, baseURL })),
        idempotencyKey: `job-${mail.event}-${mail.id}`,
        attachments: [{ filename: 'salesmora-logo.png', content: logo, contentType: 'image/png', cid: 'salesmora-logo', contentDisposition: 'inline' }],
      }, baseURL);
    }).then(result => {
      if (result.failed || result.retryPending) console.error(JSON.stringify({ event: 'worker.job_email_status', failed: result.failed, retryPending: result.retryPending }));
    }).catch(() => console.error(JSON.stringify({ event: 'worker.job_email_error' }))).finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 5000); tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
