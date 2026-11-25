import {renderCancellationEmail} from "@salesmora/data/email/workflow-cancellation";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { DelayedError, Queue, Worker } from "bullmq";
import { permissionIds } from "@salesmora/contracts";
import { processServiceDueEmail,processCancellationEmails, claimWorkflowQueue, cleanupWorkflowQueue, acknowledgeWorkflowQueue, readWorkflowQueueEntry, workflowQueueTicketSchema,
  processCompletionHandoffEmail,workflowQueueListener, processWorkflowStep, processWorkflowBookingEmails, processAssignmentEmails, processEstimateNotificationEmails, processLeadWorkflowEmails, processWorkflowBriefingEmails, processWorkflowVisitEmails, type Knex } from "@salesmora/data";
import { renderEstimateNotificationEmail } from "@salesmora/data/email/estimate-notification";
import { renderWorkflowVisitEmail } from "@salesmora/data/email/workflow-visit";
import { renderWorkflowBriefingEmail } from "@salesmora/data/email/workflow-briefing";
import { renderWorkflowBookingEmail } from "@salesmora/data/email/workflow-booking";
import { renderLeadAssignedEmail } from "@salesmora/data/email/lead-assigned";
import { renderLeadWorkflowEmail } from "@salesmora/data/email/lead-workflow";
import { sendEmail } from "@salesmora/data/email/transport";
import type { WorkerConfiguration } from "./config.js";

export const workflowQueueName = (config: WorkerConfiguration) => `${config.queueName}-workflows`;

/** Redis handles waiting; PostgreSQL owns schedules, authorization, eligibility and duplicate protection. */
export async function startWorkflowReminders(db: Knex, config: WorkerConfiguration, options: { send?: typeof sendEmail } = {}) {
  if (!await db.schema.hasTable("workflowQueueOutbox")) throw new Error("Apply workflow queue migrations before starting the worker.");
  const send = options.send ?? sendEmail;
  const baseURL = process.env.BETTER_AUTH_URL ?? "";
  if (!baseURL) throw new Error("Configure the app origin for workflow emails.");
  const logo = await readFile(new URL("../../../packages/data/src/email/salesmora-email-logo.png", import.meta.url));
  const attachments = [{ filename: "salesmora-logo.png", content: logo, contentType: "image/png", cid: "salesmora-logo", contentDisposition: "inline" as const }];
  const name = workflowQueueName(config);
  const queue = new Queue(name, { connection: { ...config.connection, maxRetriesPerRequest: 1, enableOfflineQueue: false },
    defaultJobOptions: { attempts: 5, backoff: { type: "exponential", delay: 15_000 }, removeOnComplete: true, removeOnFail: { age: 86400, count: 1000 } } });
  const log = (event: string) => console.error(JSON.stringify({ event }));
  queue.on("error", () => log("worker.workflow_queue_error"));
  let workspaceCommands = false;
  let stopped = false, requested = false, running: Promise<void> | undefined;
  let continuation: ReturnType<typeof setTimeout> | undefined;
  function wake() {
    if (stopped) return;
    requested = true;
    if (running) return;
    running = (async () => {
      do {
        requested = false;
        for (let batch = 0; batch < 10 && !stopped; batch++) {
          const entries = await claimWorkflowQueue(db);
          if (!entries.length) break;
          await queue.addBulk(entries.map(entry => ({ name: "workflow-work", data: { id: entry.id, workspaceId: entry.workspaceId, version: entry.version },
            opts: { jobId: `${entry.id}-${entry.version}`, delay: Math.max(0, entry.availableAt.getTime() - Date.now()) } })));
          await acknowledgeWorkflowQueue(db, entries);
          if (entries.length < 100) break;
          if (batch === 9) continuation = setTimeout(wake, 250);
        }
      } while (requested && !stopped);
    })().catch(() => log("worker.workflow_dispatch_failed"))
      .finally(() => { running = undefined; if (requested && !stopped) wake(); });
  }
  const listener = workflowQueueListener(config.databaseURL, wake);
  const worker = new Worker(name, async (job, token) => {
    if (job.name === "workflow-queue-cleanup") {
      const deleted = await cleanupWorkflowQueue(db);
      if (deleted === 1000) await queue.add("workflow-queue-cleanup", {}, { delay: 1000 });
      return { deleted };
    }
    if (job.name !== "workflow-work") throw new Error("Unknown workflow queue job.");
    const ticket = workflowQueueTicketSchema.parse(job.data);
    // One workspace at a time per queue, before touching SQL. Busy tenants yield to other workspaces.
    const redis = await worker.client;
    if (!workspaceCommands) {
      redis.defineCommand("workflowWorkspaceAcquire", { numberOfKeys: 1, lua: "if redis.call('exists',KEYS[1]) == 1 then return 0 end redis.call('set',KEYS[1],ARGV[1],'PX',60000) return 1" });
      redis.defineCommand("workflowWorkspaceRenew", { numberOfKeys: 1, lua: "if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('pexpire',KEYS[1],60000) end return 0" });
      redis.defineCommand("workflowWorkspaceRelease", { numberOfKeys: 1, lua: "if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) end return 0" });
      workspaceCommands = true;
    }
    const lockKey = `${name}-workspace-${ticket.workspaceId}`, lockOwner = randomUUID();
    if (!await redis.runCommand("workflowWorkspaceAcquire", [lockKey, lockOwner])) {
      await job.moveToDelayed(Date.now() + 500 + Math.floor(Math.random() * 500), token);
      throw new DelayedError();
    }
    const renew = setInterval(() => { void redis.runCommand("workflowWorkspaceRenew", [lockKey, lockOwner])
      .catch(() => log("worker.workflow_workspace_lease_error")); }, 20_000);
    try {
      const entry = await readWorkflowQueueEntry(db, ticket);
      if (!entry) return; // Completed, superseded, paused, removed or recovered under a newer ticket.
      if (entry.kind === "step") {
        await processWorkflowStep(db, entry.workspaceId, entry.stepId!, permissionIds, {baseURL,send:mail=>send({...mail,attachments},baseURL)});
      } else if(entry.kind==='handoff_email'){
        await processCompletionHandoffEmail(db,permissionIds,{workspaceId:entry.workspaceId,id:entry.handoffNoticeId!},baseURL,mail=>send({...mail,attachments},baseURL));
      } else if(entry.kind==='service_due_notice_email'||entry.kind==='service_outreach_email'){
        await processServiceDueEmail(db,permissionIds,{id:entry.kind==='service_outreach_email'?entry.serviceOutreachId!:entry.serviceDueNoticeId!,workspaceId:entry.workspaceId},entry.kind==='service_outreach_email',baseURL,mail=>send({...mail,attachments},baseURL));
      } else if(entry.kind==='cancellation_email') {
        const result=await processCancellationEmails(db,permissionIds,async mail=>{await send({to:mail.to,...renderCancellationEmail({...mail,baseURL}),idempotencyKey:`workflow-cancellation-${mail.id}`},baseURL);},1,{id:entry.cancellationNoticeId!,workspaceId:entry.workspaceId});if(result.failed)log('worker.workflow_email_failed');
      } else if(entry.kind==='booking_email') {
        const result=await processWorkflowBookingEmails(db,permissionIds,async mail=>{await send({to:mail.to,...renderWorkflowBookingEmail({...mail,baseURL}),idempotencyKey:`workflow-booking-${mail.id}`},baseURL);},1,{id:entry.bookingNoticeId!,workspaceId:entry.workspaceId});
        if(result.failed)log('worker.workflow_email_failed');
      } else if (entry.kind === "assignment_email") {
        const result = await processAssignmentEmails(db, permissionIds, async mail => {
          await send({ to: mail.to, ...renderLeadAssignedEmail({ ...mail, baseURL }), attachments,
            idempotencyKey: `lead-assigned-${mail.id}` }, baseURL);
        }, 1, { id: entry.assignmentNoticeId!, workspaceId: entry.workspaceId });
        if (result.failed) log("worker.workflow_email_failed");
      } else if (entry.kind === "estimate_email") {
        const result = await processEstimateNotificationEmails(db, permissionIds, async mail => {
          await send({ to: mail.to, ...renderEstimateNotificationEmail({ ...mail, baseURL }), attachments,
            idempotencyKey: `estimate-notification-${mail.id}` }, baseURL);
        }, 1, { id: entry.estimateNoticeId!, workspaceId: entry.workspaceId });
        if (result.failed) log("worker.workflow_email_failed");
      } else if (entry.kind === "visit_email") {
        const result = await processWorkflowVisitEmails(db, permissionIds, async mail => {
          await send({ to: mail.to, ...renderWorkflowVisitEmail({ ...mail, baseURL }), attachments,
            idempotencyKey: `workflow-visit-${mail.id}` }, baseURL);
        }, 1, { id: entry.visitNoticeId!, workspaceId: entry.workspaceId });
        if (result.failed) log("worker.workflow_email_failed");
      } else if (entry.kind === "briefing_email") {
        const result = await processWorkflowBriefingEmails(db, permissionIds, async mail => {
          await send({ to: mail.to, ...renderWorkflowBriefingEmail({ ...mail, baseURL }), attachments,
            idempotencyKey: `workflow-briefing-${mail.id}` }, baseURL);
        }, 1, { id: entry.briefingNoticeId!, workspaceId: entry.workspaceId });
        if (result.failed) log("worker.workflow_email_failed");
      } else {
        const result = await processLeadWorkflowEmails(db, permissionIds, async mail => {
          await send({ to: mail.to, ...renderLeadWorkflowEmail({ ...mail, baseURL }), attachments,
            idempotencyKey: `lead-workflow-notification-${mail.id}` }, baseURL);
        }, 1, { id: entry.leadNoticeId!, workspaceId: entry.workspaceId });
        if (result.failed) log("worker.workflow_email_failed");
      }
      // Source status triggers complete or reschedule the outbox atomically. Deferred access/holds recover via its lease.
    } finally {
      clearInterval(renew);
      await redis.runCommand("workflowWorkspaceRelease", [lockKey, lockOwner]).catch(() => {});
    }
  }, { connection: { ...config.connection, maxRetriesPerRequest: null }, concurrency: 4 });
  worker.on("error", () => log("worker.workflow_worker_error"));
  worker.on("failed", () => log("worker.workflow_job_failed"));
  let recovery: ReturnType<typeof setInterval> | undefined;
  try {
    await Promise.all([queue.waitUntilReady(), worker.waitUntilReady()]);
    await queue.upsertJobScheduler("workflow-queue-cleanup", { every: 3600_000 }, {
      name: "workflow-queue-cleanup", data: {}, opts: { removeOnComplete: true, removeOnFail: 10 },
    });
    await listener.connect();
    wake();
    // One shared indexed recovery check, regardless of client/workflow count. Also reconnects LISTEN.
    recovery = setInterval(() => { void listener.connect(); wake(); }, 30_000);
  } catch (error) {
    stopped = true;
    await listener.close();
    await running;
    await Promise.allSettled([worker.close(), queue.close()]);
    throw error;
  }
  return async () => {
    stopped = true;
    clearInterval(recovery); clearTimeout(continuation);
    await listener.close();
    await running;
    const results = await Promise.allSettled([worker.close(), queue.close()]);
    if (results.some(result => result.status === "rejected")) throw new Error("Workflow queue shutdown incomplete.");
  };
}
