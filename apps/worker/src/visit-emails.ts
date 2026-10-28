import { readFile } from 'node:fs/promises';
import { permissionIds } from '@salesmora/contracts';
import { processVisitEmails, type Knex } from '@salesmora/data';
import { sendEmail } from '@salesmora/data/email/transport';
import { renderVisitChangedEmail } from '@salesmora/data/email/visit-changed';
export async function startVisitEmails(db: Knex) {
  if (!await db.schema.hasTable('visitNotifications')) throw Error('Apply visit notification migrations before starting worker.');
  const baseURL = process.env.BETTER_AUTH_URL ?? ''; if (!baseURL) throw Error('Configure the app origin for visit emails.');
  const logo = await readFile(new URL('../../../packages/data/src/email/salesmora-email-logo.png', import.meta.url));
  let stopped = false, running: Promise<void> | undefined;
  const tick = () => {
    if (stopped || running) return;
    running = processVisitEmails(db, permissionIds, async mail => {
      await sendEmail({ to: mail.to, ...renderVisitChangedEmail({ ...mail, baseURL }), idempotencyKey: `visit-changed-${mail.id}`,
        attachments: [{ filename: 'salesmora-logo.png', content: logo, contentType: 'image/png', cid: 'salesmora-logo', contentDisposition: 'inline' }] }, baseURL);
    }).then(result => { if (result.failed || result.retryPending) console.error(JSON.stringify({ event: 'worker.visit_delivery_status', failed: result.failed, retryPending: result.retryPending })); })
      .catch(() => console.error(JSON.stringify({ event: 'worker.visit_delivery_retry_pending' }))).finally(() => { running = undefined; });
  };
  const timer = setInterval(tick, 5000); tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
