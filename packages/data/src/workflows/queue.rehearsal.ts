import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import knex from "knex";
import { initializeWorkspacePolicy } from "../authorization/store";
import { migrateFreshBaseline } from "../baseline-runner";
import { claimWorkflowQueue, cleanupWorkflowQueue, acknowledgeWorkflowQueue, readWorkflowQueueEntry } from "./queue";

process.loadEnvFile(fileURLToPath(new URL("../../../../.env.local", import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw new Error("Use a separate local _test database.");
const name = `workflow_queue_${randomUUID().replaceAll("-", "")}_test`, owner = randomUUID(), workspaceId = randomUUID();
const admin = knex({ client: "pg", connection }), url = new URL(connection); url.pathname = "/" + name;
const db = knex({ client: "pg", connection: url.toString() });
const queueMigration = "202611190002_workflow_features.ts";
const directory = fileURLToPath(new URL("../baseline-migrations", import.meta.url));
let created = false;
try {
  await admin.raw("CREATE DATABASE ??", [name]); created = true;
  for (const migration of readdirSync(directory).filter(file => file.endsWith(".ts") && file < queueMigration).sort()) {
    await db.migrate.up({ directory, name: migration, loadExtensions: [".ts"] });
  }
  await db("users").insert({ id: owner, name: "Queue fixture", email: `${owner}@example.test`, termsVersion: "fixture", termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
  await db.transaction(async trx => {
    await trx("workspaces").insert({ id: workspaceId, ownerId: owner, businessName: "Queue fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York" });
    await trx("workspaceMemberships").insert({ workspaceId, userId: owner, role: "owner" });
    await initializeWorkspacePolicy(trx, { workspaceId, userId: owner });
  });
  const workflowId = randomUUID(), paused = randomUUID();
  const definition = { kind: "unassigned_lead", businessDays: 1, recipientId: owner, recipientName: "Queue fixture", timezone: "America/New_York", notifications: { inApp: true, email: true } };
  await db("workflows").insert([workflowId, paused].map(id => ({ id, workspaceId, publisherId: owner, name: "Queue fixture", rule: "Notify office", status: id === paused ? "paused" : "active",
    enrollAfter: new Date("2026-11-01T00:00:00Z"), definition: JSON.stringify(definition) })));
  const leads = Array.from({ length: 4 }, () => randomUUID());
  const lead = (id: string) => ({ id, workspaceId, submissionId: randomUUID(), submissionHash: "fixture", name: "Queue fixture lead", email: "", phone: "", service: "Repair", address: "", details: "", notes: "", source: "other", stage: "new", createdAt: new Date("2026-11-06T18:00:00Z") });
  await db("leads").insert(leads.map(lead));
  const [pendingId, heldId, completedId] = Array.from({ length: 3 }, () => randomUUID());
  const future = new Date("2099-01-01T17:00:00Z");
  await db("workflowSteps").insert([
    { id: pendingId, workspaceId, workflowId, recordKind: "lead", leadId: leads[0], dueAt: future, status: "queued" },
    { id: heldId, workspaceId, workflowId: paused, recordKind: "lead", leadId: leads[1], dueAt: future, status: "held" },
    { id: completedId, workspaceId, workflowId, recordKind: "lead", leadId: leads[2], dueAt: new Date(0), status: "completed" },
  ]);
  const reviewId = randomUUID();
  await db("workflowManualRuns").insert({ id: reviewId, workspaceId, workflowId, actorId: owner, version: 1, recordKind: "lead", recordIds: JSON.stringify([leads[3]]), expiresAt: future });
  await migrateFreshBaseline(db);
  assert.equal((await db("workflowSteps").where({ id: pendingId }).first()).triggeredAt.toISOString(), "2026-11-06T18:00:00.000Z", "editing migration preserves the source anchor for legacy pending work");
  assert.equal((await db("workflowSteps").where({ id: pendingId }).first()).dueAt.toISOString(), future.toISOString());
  assert.equal((await db("workflowSteps").where({ id: heldId }).first()).status, "held");
  assert.equal((await db("workflowSteps").where({ id: completedId }).first()).status, "completed");
  const caughtUp = await db("workflowSteps").where({ workflowId, leadId: leads[3] }).first();
  assert.equal(caughtUp.dueAt.toISOString(), "2026-11-09T22:00:00.000Z");
  assert.deepEqual((await db("workflowManualRuns").where({ id: reviewId }).first()).recordIds, [leads[3]]);
  assert.equal(await db("workflowQueueOutbox").where({ stepId: heldId }).first(), undefined);
  assert.equal(await db("workflowQueueOutbox").where({ stepId: completedId }).first(), undefined);
  // Backfill is idempotent and does not change previously reviewed/pending schedules.
  await db.raw("SELECT workflow_enroll_record(?, 'unassigned_lead', ?, ?)", [workspaceId, leads[0], new Date("2026-11-06T18:00:00Z")]);
  assert.equal((await db("workflowSteps").where({ id: pendingId }).first()).dueAt.toISOString(), future.toISOString());
  const claims = await Promise.all([claimWorkflowQueue(db, 2), claimWorkflowQueue(db, 2)]);
  const tickets = claims.flat();
  assert.equal(new Set(tickets.map(row => row.id)).size, tickets.length);
  assert(tickets.some(row => row.stepId === pendingId));
  await acknowledgeWorkflowQueue(db, tickets);
  const old = tickets.find(row => row.stepId === pendingId)!;
  await db("workflowSteps").where({ id: pendingId }).update({ status: "held" });
  assert.equal(await readWorkflowQueueEntry(db, { id: old.id, workspaceId, version: old.version }), undefined);
  await db("workflowSteps").where({ id: pendingId }).update({ status: "queued" });
  const resumed = await db("workflowQueueOutbox").where({ stepId: pendingId }).first();
  assert(resumed.version > old.version); assert.equal(resumed.completedAt, null);
  await acknowledgeWorkflowQueue(db, [old]);
  assert((await db("workflowQueueOutbox").where({ stepId: pendingId }).first()).nextDispatchAt.getTime() <= Date.now());
  const reclaimed = (await claimWorkflowQueue(db)).find(row => row.stepId === pendingId)!;
  assert(reclaimed.version > old.version);
  assert.equal(await readWorkflowQueueEntry(db, { id: reclaimed.id, workspaceId: randomUUID(), version: reclaimed.version }), undefined);
  await db("workflowSteps").where({ id: pendingId }).update({ status: "canceled" });
  assert.equal(await readWorkflowQueueEntry(db, { id: reclaimed.id, workspaceId, version: reclaimed.version }), undefined);
  // Transaction rollback cannot leave either a schedule or a queue handoff behind.
  const rolledBack = randomUUID();
  await assert.rejects(db.transaction(async trx => { await trx("leads").insert(lead(rolledBack)); throw Error("Rollback"); }));
  assert.equal(await db("workflowSteps").where({ leadId: rolledBack }).first(), undefined);
  await db("workflowQueueOutbox").update({ completedAt: db.fn.now() });
  // Structural idle-load check at the requested 1,000 x 10 scale. This is not a throughput benchmark.
  const tenants = Array.from({ length: 1000 }, () => ({ id: randomUUID(), owner: randomUUID() }));
  await db.transaction(async trx => {
    await trx.batchInsert("users", tenants.map(({ owner }) => ({ id: owner, name: "Idle owner", email: `${owner}@example.test`, termsVersion: "fixture", termsAcceptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })), 100);
    await trx.batchInsert("workspaces", tenants.map(({ id, owner }) => ({ id, ownerId: owner, businessName: "Idle queue fixture", businessType: "test", postalCode: "", serviceRange: "", timezone: "America/New_York" })), 100);
    await trx.batchInsert("workspaceMemberships", tenants.map(({ id, owner }) => ({ workspaceId: id, userId: owner, role: "owner" })), 100);
    await trx.batchInsert("workspacePolicies", tenants.map(({ id }) => ({ workspaceId: id, revision: 0, templateVersion: 1 })), 100);
    await trx.raw(`INSERT INTO "workspaceRolePolicies" ("workspaceId",role,permission,scope)
      SELECT w.id,p.role,p.permission,p.scope FROM workspaces w CROSS JOIN "workspaceRolePolicies" p
      WHERE w.id = ANY(?::uuid[]) AND p."workspaceId" = ?`, [tenants.map(row => row.id), workspaceId]);
  });
  await db.batchInsert("workflows", tenants.flatMap(({ id: workspaceId, owner: publisherId }) => Array.from({ length: 10 }, () => ({ id: randomUUID(), workspaceId, publisherId,
    name: "Idle reminder", rule: "Notify office", status: "active", enrollAfter: new Date(), definition: JSON.stringify({ ...definition, recipientId: publisherId }) }))), 200);
  const queries: string[] = [];
  const observe = (query: { sql: string }) => queries.push(query.sql);
  db.on("query", observe);
  assert.deepEqual(await claimWorkflowQueue(db), []);
  db.off("query", observe);
  assert.equal(queries.length, 1);
  assert(!queries[0].includes('FROM "workflows"')); assert(!queries[0].includes('workspaceMemberships'));
  await db("workflowQueueOutbox").whereNotNull("completedAt").update({ completedAt: new Date(Date.now() - 8 * 86400000) });
  const stillPending = randomUUID(); await db("leads").insert(lead(stillPending));
  const pendingStep = await db("workflowSteps").where({ leadId: stillPending }).first();
  assert(await cleanupWorkflowQueue(db) > 0);
  assert(await db("workflowQueueOutbox").where({ stepId: pendingStep.id }).first());
  assert(await db("workflowSteps").where({ id: pendingId }).first(), "handoff cleanup never deletes domain history");
  console.log("Queue cutover, preserved due times/manual reviews, atomic event rollback, concurrent claims, stale-ticket isolation and 10,000-idle-workflow constant-query check passed.");
} finally {
  await db.destroy(); if (created) await admin.raw("DROP DATABASE ??", [name]); await admin.destroy();
}
