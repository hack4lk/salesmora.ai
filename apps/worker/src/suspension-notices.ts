import { readFile } from 'node:fs/promises';
import { processWorkspaceSuspensionNotices, type Knex } from '@salesmora/data';
import { sendEmail } from '@salesmora/data/email/transport';
import { renderWorkspaceSuspendedEmail } from '@salesmora/data/email/workspace-suspended';
export async function startSuspensionNotices(db: Knex) {
  if (!await db.schema.hasTable('workspaceSuspensionNotices')) throw Error('Apply suspension migrations before starting worker.');
  const baseURL = process.env.BETTER_AUTH_URL ?? '';
  if (!baseURL) throw Error('Configure the app origin for suspension notices.');
  const logo = await readFile(new URL('../../../packages/data/src/email/salesmora-email-logo.png', import.meta.url));
  let stopped = false, running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = processWorkspaceSuspensionNotices(db, async ({ id, to, workspaceName }) => {
      await sendEmail({ to, ...renderWorkspaceSuspendedEmail({ workspaceName }), idempotencyKey: `workspace-suspended-${id}`, attachments: [{ filename: 'salesmora-logo.png', content: logo, contentType: 'image/png', cid: 'salesmora-logo', contentDisposition: 'inline' }] }, baseURL);
    }).then(summary => { if (summary.failed || summary.retryPending) console.error(JSON.stringify({ event: 'worker.suspension_notice_status', failed: summary.failed, retryPending: summary.retryPending })); })
      .catch(() => console.error(JSON.stringify({ event: 'worker.suspension_notice_retry_pending' }))).finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 5000); tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
