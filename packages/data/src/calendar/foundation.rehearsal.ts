import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDatabase } from "../database";
import { migrateFreshBaseline } from "../baseline-runner";
import { down as rollbackBaseline } from "../baseline-migrations/202611150001_fresh_baseline";
import { initializeWorkspacePolicy } from "../authorization/store";

const env = fileURLToPath(new URL("../../../../.env.local", import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use a separate local test database.");

const name = `calendar_foundation_${randomUUID().replaceAll("-", "")}_test`;
const url = new URL(connection); url.pathname = `/${name}`;
const owner = createDatabase(connection), db = createDatabase(url.toString());
const workspaceId = randomUUID(), other = randomUUID(), userId = randomUUID(), otherUser = randomUUID();
const job = randomUUID(), foreignJob = randomUUID(), visitId = randomUUID();
let created = false;
try {
  await owner.raw("CREATE DATABASE ??", [name]); created = true;
  await migrateFreshBaseline(db);
  const now = new Date();
  await db("users").insert([userId, otherUser].map(id => ({
    id, name: "Calendar fixture", email: `${id}@example.test`, createdAt: now, updatedAt: now,
    termsVersion: "fixture", termsAcceptedAt: now,
  })));
  await db.transaction(async trx => {
    for (const [id, ownerId] of [[workspaceId, userId], [other, otherUser]]) {
      await trx("workspaces").insert({ id, ownerId, businessName: "Calendar fixture", businessType: "test", postalCode: "", serviceRange: "" });
      await trx("workspaceMemberships").insert({ workspaceId: id, userId: ownerId, role: "owner" });
      await initializeWorkspacePolicy(trx, { workspaceId: id, userId: ownerId });
    }
  });
  await db("jobs").insert([job, foreignJob].map((id, index) => ({
    id, workspaceId: index ? other : workspaceId, customerName: "Fixture", title: "Fixture",
    service: "Repair", location: "", description: "",
  })));
  await db("calendarVisits").insert({ id: visitId, workspaceId, scheduledDate: "2026-11-01" });
  await db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, jobId: job });
  await db("calendarScheduleSnapshots").insert({
    id: randomUUID(), workspaceId, visitId, jobId: job, recordVersion: 1,
    recordStatus: "needs-scheduling", scheduledDate: "2026-11-01", reason: "rescheduled",
  });
  await assert.rejects(db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId: other, visitId, jobId: foreignJob }));
  await assert.rejects(db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, jobId: foreignJob }));
  await assert.rejects(db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, jobId: job }));
  await assert.rejects(db("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId }));
  await assert.rejects(db("calendarScheduleSnapshots").where({ workspaceId, visitId }).update({ scheduledDate: "2026-11-02" }));
  await assert.rejects(db("calendarVisits").where({ id: visitId }).update({ scheduledDate: null, arrivalWindow: "09:00-11:00" }));
  await assert.rejects(rollbackBaseline(), /forward-only/);
  await db("workspaces").where({ id: workspaceId }).delete();
  assert.equal((await db("calendarVisits").where({ workspaceId })).length, 0);
  assert.equal((await db("calendarScheduleSnapshots").where({ workspaceId })).length, 0);
  assert.ok(await db("jobs").where({ id: foreignJob, workspaceId: other }).first());
  console.log("Calendar foundation tenant, uniqueness, snapshot, rollback and erasure checks passed.");
} finally {
  await db.destroy();
  try { if (created) await owner.raw("DROP DATABASE ??", [name]); } finally { await owner.destroy(); }
}
