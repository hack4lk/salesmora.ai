import { readFile } from 'node:fs/promises';
import { processWorkspaceOwnershipNotices, type Knex } from '@salesmora/data';
import { sendEmail } from '@salesmora/data/email/transport';
import { renderOwnershipTransferredEmail } from '@salesmora/data/email/ownership-transferred';
export async function startOwnershipNotices(db: Knex) {
  if (!await db.schema.hasTable('workspaceOwnershipNotices')) throw Error('Apply ownership transfer migrations before starting worker.');
  const baseURL = process.env.BETTER_AUTH_URL ?? '';
  if (!baseURL) throw Error('Configure the app origin for ownership notices.');
  const logo = await readFile(new URL('../../../packages/data/src/email/salesmora-email-logo.png', import.meta.url));
  let stopped = false, running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = processWorkspaceOwnershipNotices(db, async ({ id, to, ...input }) => {
      await sendEmail({ to, ...renderOwnershipTransferredEmail(input), idempotencyKey: `ownership-transferred-${id}`, attachments: [{ filename: 'salesmora-logo.png', content: logo, contentType: 'image/png', cid: 'salesmora-logo', contentDisposition: 'inline' }] }, baseURL);
    }).then(summary => { if (summary.failed || summary.retryPending) console.error(JSON.stringify({ event: 'worker.ownership_notice_status', failed: summary.failed, retryPending: summary.retryPending })); })
      .catch(() => console.error(JSON.stringify({ event: 'worker.ownership_notice_retry_pending' }))).finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 5000); tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
