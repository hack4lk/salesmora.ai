import { readFile } from 'node:fs/promises';
import { permissionIds } from '@salesmora/contracts';
import { scheduleDeadlineReminders, processDeadlineEmails, type Knex } from '@salesmora/data';
import { sendEmail } from '@salesmora/data/email/transport';
import { renderDeadlineReminderEmail } from '@salesmora/data/email/deadline-reminder';

export async function startDeadlineReminders(db: Knex) {
  for (const table of ['deadlineNotifications', 'jobNotificationSettings', 'notificationPreferences']) {
    if (!await db.schema.hasTable(table)) throw new Error('Apply deadline reminder migrations before starting the worker.');
  }
  if (!await db.schema.hasColumn('jobs', 'reminderRevision') || !await db.schema.hasColumn('notificationPreferences', 'deadlineReminderEmail'))
    throw new Error('Apply deadline reminder migrations before starting the worker.');
  const baseURL = process.env.BETTER_AUTH_URL ?? '';
  if (!baseURL) throw new Error('Configure the app origin for deadline emails.');
  const logo = await readFile(new URL('../../../packages/data/src/email/salesmora-email-logo.png', import.meta.url));
  let stopped = false, running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = (async () => {
      const planned = await scheduleDeadlineReminders(db, permissionIds);
      const delivery = await processDeadlineEmails(db, permissionIds, async mail => {
        await sendEmail({
          to: mail.to, ...renderDeadlineReminderEmail({ ...mail, baseURL }), idempotencyKey: `deadline-reminder-${mail.id}`,
          attachments: [{ filename: 'salesmora-logo.png', content: logo, contentType: 'image/png', cid: 'salesmora-logo', contentDisposition: 'inline' }],
        }, baseURL);
      });
      if (planned.failed || delivery.failed || delivery.retryPending)
        console.error(JSON.stringify({ event: 'worker.deadline_reminder_status', planningFailed: planned.failed, failed: delivery.failed, retryPending: delivery.retryPending }));
    })().catch(() => console.error(JSON.stringify({ event: 'worker.deadline_reminder_error' }))).finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 60_000); tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
