import { readFile } from "node:fs/promises";
import { permissionIds } from "@salesmora/contracts";
import { processEstimateNotificationEmails, type Knex } from "@salesmora/data";
import { renderEstimateNotificationEmail } from "@salesmora/data/email/estimate-notification";
import { sendEmail } from "@salesmora/data/email/transport";

export async function startEstimateNotificationEmails(db: Knex) {
  if (!await db.schema.hasTable("leadWorkflowNotifications")) {
    throw new Error("Apply workflow notification migrations before starting the worker.");
  }
  const baseURL = process.env.BETTER_AUTH_URL ?? "";
  if (!baseURL) throw new Error("Configure the app origin for Estimate notification emails.");
  const logo = await readFile(new URL("../../../packages/data/src/email/salesmora-email-logo.png", import.meta.url));
  let stopped = false;
  let running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = processEstimateNotificationEmails(db, permissionIds, async mail => {
      await sendEmail({
        to: mail.to,
        ...renderEstimateNotificationEmail({ ...mail, baseURL }),
        idempotencyKey: `estimate-notification-${mail.id}`,
        attachments: [{
          filename: "salesmora-logo.png",
          content: logo,
          contentType: "image/png",
          cid: "salesmora-logo",
          contentDisposition: "inline",
        }],
      }, baseURL);
    }, 10, { nonWorkflowOnly: true }).then(result => {
      if (result.failed || result.retryPending) {
        console.error(JSON.stringify({
          event: "worker.estimate_notification_email_status",
          failed: result.failed,
          retryPending: result.retryPending,
        }));
      }
    }).catch(() => {
      console.error(JSON.stringify({ event: "worker.estimate_notification_email_error" }));
    }).finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 5_000);
  tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
