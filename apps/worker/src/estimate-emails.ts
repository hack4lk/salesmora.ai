import { readFile } from "node:fs/promises";
import { processEstimateEmails, type Knex } from "@salesmora/data";
import { renderEstimateEmail } from "@salesmora/data/email/estimate";
import { estimateEmailDeliveryAvailable, sendEstimateEmail } from "@salesmora/data/email/transport";

export async function startEstimateEmails(db: Knex) {
  const baseURL = process.env.BETTER_AUTH_URL ?? "";
  if (!estimateEmailDeliveryAvailable(baseURL)) {
    console.log(JSON.stringify({ event: "worker.estimate_delivery_disabled", reason: "not-configured" }));
    return async () => {};
  }
  if (!process.env.FILE_MASTER_KEY || Buffer.from(process.env.FILE_MASTER_KEY, "base64").length !== 32) {
    throw new Error("Configure the existing file-encryption key before starting estimate delivery.");
  }
  if (!await db.schema.hasColumn("estimate_deliveries", "failureCode")) {
    throw new Error("Apply estimate delivery migrations before starting the worker.");
  }
  const logo = await readFile(new URL("../../../packages/data/src/email/salesmora-email-logo.png", import.meta.url));
  let stopped = false, running: Promise<void> | undefined;
  function tick() {
    if (stopped || running) return;
    running = processEstimateEmails(db, ["estimates.read", "estimates.send"], async mail =>
      sendEstimateEmail({
        to: mail.to, ...renderEstimateEmail({ ...mail, baseURL }),
        idempotencyKey: `estimate-delivery-${mail.id}`,
        attachments: [{
          filename: "salesmora-logo.png", content: logo, contentType: "image/png",
          cid: "salesmora-logo", contentDisposition: "inline",
        }],
      }, baseURL, mail.queuedAt),
    ).then(result => {
      if (result.sent || result.retryPending || result.failed) {
        console.log(JSON.stringify({ event: "worker.estimate_delivery_status", ...result }));
      }
    }).catch(() => {
      console.error(JSON.stringify({ event: "worker.estimate_delivery_error" }));
    }).finally(() => { running = undefined; });
  }
  const timer = setInterval(tick, 5000);
  console.log(JSON.stringify({ event: "worker.estimate_delivery_started", intervalMs: 5000 }));
  tick();
  return async () => { stopped = true; clearInterval(timer); await running; };
}
