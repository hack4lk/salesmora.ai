import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { permissionIds } from "@salesmora/contracts";
import { createDatabase } from "../database";
import { initializeWorkspacePolicy, AuthorizationAccessError } from "../authorization/store";
import { readGantt } from "./read";
const env = fileURLToPath(new URL("../../../../.env.local", import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") || connection === process.env.DATABASE_URL ||
  !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use the isolated local test database.");
const db = createDatabase(connection), workspaceId = randomUUID(), otherWorkspace = randomUUID(), customerId = randomUUID();
const users = Object.fromEntries(["owner", "admin", "office", "field", "other"].map(role => [role, randomUUID()]));
const enabled = [...permissionIds];
const identity = (role = "owner") => ({ userId: users[role], workspaceId: role === "other" ? otherWorkspace : workspaceId });
const jobIds = { open: randomUUID(), overdue: randomUUID(), oldClosed: randomUUID(), recentClosed: randomUUID(), undated: randomUUID() };
const orderIds = { scheduled: randomUUID(), done: randomUUID(), archived: randomUUID() };
let passed = 0;
async function check(label: string, work: () => Promise<void>) { await work(); console.log("PASS " + label); passed++; }
const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
try {
  await db.transaction(async trx => {
    const now = new Date();
    await trx("users").insert(Object.entries(users).map(([role, id]) => ({ id, name: `Gantt fixture ${role}`, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: "fixture", termsAcceptedAt: now })));
    for (const [id, owner] of [[workspaceId, users.owner], [otherWorkspace, users.other]]) {
      await trx("workspaces").insert({ id, ownerId: owner, businessName: "Gantt fixture", businessType: "plumbing", postalCode: "", serviceRange: "", timezone: "America/New_York" });
      await trx("workspaceMemberships").insert({ workspaceId: id, userId: owner, role: "owner" });
      await initializeWorkspacePolicy(trx, { workspaceId: id, userId: owner });
    }
    await trx("workspaceMemberships").insert(["admin", "office", "field"].map(role => ({ workspaceId, userId: users[role], role })));
    await trx("customers").insert({ id: customerId, workspaceId, name: "Fictional Gantt Customer", type: "person", companyName: "", email: "", phone: "", location: "", internalNotes: "" });
    const base = { workspaceId, customerId, customerName: "Fictional Gantt Customer", service: "", location: "12 Fiction Lane", description: "", primaryOwnerId: users.field };
    await trx("jobs").insert([
      { ...base, id: jobIds.open, title: "Open job", status: "scheduled", scheduledDate: day(2), completionDeadline: day(10) },
      { ...base, id: jobIds.overdue, title: "Overdue job", status: "in-progress", scheduledDate: day(-20), completionDeadline: day(-3) },
      { ...base, id: jobIds.oldClosed, title: "Old closed job", status: "completed", scheduledDate: day(-200), completionDeadline: day(-150) },
      { ...base, id: jobIds.recentClosed, title: "Recent closed job", status: "completed", scheduledDate: day(-30), completionDeadline: day(-20) },
      { ...base, id: jobIds.undated, title: "Undated job", status: "needs-scheduling" },
    ]);
    await trx("jobTeamMembers").insert({ workspaceId, jobId: jobIds.open, userId: users.office });
    const wo = { workspaceId, jobId: jobIds.open, instructions: "", accessNotes: "", safetyNotes: "" };
    await trx("workOrders").insert([
      { ...wo, id: orderIds.scheduled, title: "Scheduled order", status: "issued", issuedAt: now, scheduledDate: day(3), primaryAssigneeId: users.field },
      { ...wo, id: orderIds.done, title: "Done order", status: "completed", issuedAt: now, completedAt: now, scheduledDate: day(-1) },
      { ...wo, id: orderIds.archived, title: "Archived order", status: "completed", issuedAt: now, completedAt: now, archivedAt: now },
    ]);
  });
  await check("owner sees open and recent closed jobs with workspace-local today and ordered dates", async () => {
    const result = await readGantt(db, identity(), enabled);
    assert.match(result.today, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(result.truncated, false);
    assert.deepEqual(result.jobs.map(job => job.title), ["Recent closed job", "Overdue job", "Open job", "Undated job"]);
    assert.deepEqual(result.customers, [{ id: customerId, name: "Fictional Gantt Customer" }]);
    assert(result.teamMembers.some(member => member.id === users.field));
  });
  await check("job flags, owner and team names", async () => {
    const jobs = new Map((await readGantt(db, identity("admin"), enabled)).jobs.map(job => [job.title, job]));
    assert.equal(jobs.get("Overdue job")!.overdue, true);
    assert.equal(jobs.get("Open job")!.overdue, false);
    assert.equal(jobs.get("Recent closed job")!.overdue, false);
    assert.equal(jobs.get("Open job")!.primaryOwnerName, "Gantt fixture field");
    assert.deepEqual(jobs.get("Open job")!.teamUserIds, [users.office]);
    assert.equal(jobs.get("Undated job")!.scheduledDate, null);
    assert.match(jobs.get("Open job")!.number, /^J-\d{4}$/);
  });
  await check("work orders nest under their job, skip archived, and stamp completion only when completed", async () => {
    const open = (await readGantt(db, identity(), enabled)).jobs.find(job => job.title === "Open job")!;
    assert.deepEqual(open.workOrders.map(order => order.title).sort(), ["Done order", "Scheduled order"]);
    const scheduled = open.workOrders.find(order => order.title === "Scheduled order")!, done = open.workOrders.find(order => order.title === "Done order")!;
    assert.equal(scheduled.completionDate, null);
    assert.equal(scheduled.assigneeName, "Gantt fixture field");
    assert.match(done.completionDate!, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(done.number, /^WO-\d{4}$/);
  });
  await check("office and field users are denied", async () => {
    for (const role of ["office", "field"]) await assert.rejects(readGantt(db, identity(role), enabled), AuthorizationAccessError);
  });
  await check("workspaces are isolated in both directions", async () => {
    await assert.rejects(readGantt(db, { userId: users.owner, workspaceId: otherWorkspace }, enabled), AuthorizationAccessError);
    assert.deepEqual((await readGantt(db, identity("other"), enabled)).jobs, []);
  });
  console.log(`PASS ${passed} Gantt read database journeys`);
} finally {
  await db("users").whereIn("id", Object.values(users)).delete();
  await db.destroy();
}
