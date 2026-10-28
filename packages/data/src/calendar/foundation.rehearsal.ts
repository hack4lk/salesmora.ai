import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDatabase } from "../database";
import { up, down } from "../migrations/202610210001_calendar_visits";
const env = fileURLToPath(new URL("../../../../.env.local", import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") || connection === process.env.DATABASE_URL ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use the isolated local test database.");
const db = createDatabase(connection);
const rollback = new Error("Rollback isolated Calendar rehearsal");
let passed = 0;
try {
  await db.transaction(async trx => {
    const schema = `calendar_test_${randomUUID().replaceAll("-", "")}`;
    await trx.raw(`CREATE SCHEMA "${schema}"`);
    await trx.raw(`SET LOCAL search_path TO "${schema}", public`);
    // Minimal source tables with the same types/tenant keys as the actual foundation migrations.
    await trx.raw(`CREATE TABLE workspaces (id uuid PRIMARY KEY);
      CREATE TABLE jobs (id uuid PRIMARY KEY, "workspaceId" uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        "scheduledDate" date, "arrivalWindow" text, version integer NOT NULL, status text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(), UNIQUE("workspaceId",id));
      CREATE TABLE "workOrders" (LIKE jobs INCLUDING ALL)`);
    const workspaceId = randomUUID(), other = randomUUID();
    await trx("workspaces").insert([{ id: workspaceId }, { id: other }]);
    const job = randomUUID(), closedJob = randomUUID(), order = randomUUID(), foreignJob = randomUUID();
    await trx("jobs").insert([
      { id: job, workspaceId, scheduledDate: "2026-11-01", arrivalWindow: "09:00-11:00", version: 5, status: "scheduled" },
      { id: closedJob, workspaceId, scheduledDate: "2026-10-01", arrivalWindow: null, version: 7, status: "completed" },
      { id: foreignJob, workspaceId: other, scheduledDate: null, arrivalWindow: null, version: 1, status: "needs-scheduling" },
    ]);
    await trx("workOrders").insert({ id: order, workspaceId, scheduledDate: "2026-11-01", arrivalWindow: "09:00-11:00", version: 2, status: "issued" });
    const before = await trx("jobs").orderBy("id"), ordersBefore = await trx("workOrders").orderBy("id");
    await up(trx);
    const links = await trx("calendarVisitRecords");
    assert.equal(links.length, 4); assert.equal(new Set(links.map(row => row.visitId)).size, 4);
    assert.deepEqual(await trx("jobs").orderBy("id"), before);
    assert.deepEqual(await trx("workOrders").orderBy("id"), ordersBefore);
    assert.equal((await trx("calendarScheduleSnapshots")).length, 4);
    assert(links.find(row => row.jobId === closedJob).endedAt);
    assert.equal(links.find(row => row.jobId === job).endedAt, null);
    console.log("PASS independent backfill, unchanged records, closed history and unscheduled identities"); passed++;
    const visitId = links.find(row => row.jobId === job).visitId;
    const rejects = async (operation: (nested: typeof trx) => Promise<unknown>) => assert.rejects(trx.transaction(operation));
    await rejects(nested => nested("calendarVisitRecords").insert({ id: randomUUID(), workspaceId: other, visitId, jobId: foreignJob }));
    await rejects(nested => nested("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, jobId: foreignJob }));
    await rejects(nested => nested("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, jobId: job }));
    await rejects(nested => nested("calendarVisitRecords").insert({ id: randomUUID(), workspaceId, visitId, jobId: job, workOrderId: order }));
    console.log("PASS tenant-safe foreign keys, unique active memberships and exactly one resource per link"); passed++;
    await rejects(nested => nested("calendarScheduleSnapshots").where({ workspaceId, visitId }).update({ scheduledDate: "2026-11-02" }));
    await rejects(nested => nested("calendarVisits").where({ id: visitId }).update({ scheduledDate: null, arrivalWindow: "09:00-11:00" }));
    await rejects(nested => down(nested));
    console.log("PASS protected snapshots, schedule constraints and rollback history guard"); passed++;
    await trx("workspaces").where({ id: workspaceId }).delete();
    assert.equal((await trx("calendarVisits").where({ workspaceId })).length, 0);
    assert.equal((await trx("calendarScheduleSnapshots").where({ workspaceId })).length, 0);
    console.log("PASS workspace erasure cascades without changing another tenant"); passed++;
    assert.equal((await trx("calendarVisits").where({ workspaceId: other })).length, 1);
    throw rollback;
  });
} catch (error) { if (error !== rollback) throw error; }
finally { await db.destroy(); }
console.log(`Calendar foundation rehearsal passed (${passed} checks); isolated schema rolled back.`);
