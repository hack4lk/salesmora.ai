import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { permissionIds } from "@salesmora/contracts";
import { createDatabase } from "../database";
import { initializeWorkspacePolicy, AuthorizationAccessError } from "../authorization/store";
import { readMaterials, MaterialConflictError, MaterialValidationError } from "./store";
import { mutateMaterial } from "./mutations";
import { exportMaterials } from "./export";
import { readNotifications, markNotificationRead } from "../notifications/store";

const env = fileURLToPath(new URL("../../../../.env.local", import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") || connection === process.env.DATABASE_URL || !["localhost", "127.0.0.1"].includes(new URL(connection).hostname)) throw Error("Use the isolated local test database.");
const db = createDatabase(connection), workspaceId = randomUUID(), otherWorkspace = randomUUID();
const users = Object.fromEntries(["owner", "admin", "office", "field", "other"].map(role => [role, randomUUID()]));
const enabled = [...permissionIds];
const identity = (role = "owner") => ({ userId: users[role], workspaceId: role === "other" ? otherWorkspace : workspaceId });
const ws = (role: string) => (role === "other" ? otherWorkspace : workspaceId);
let passed = 0;
async function check(label: string, work: () => Promise<void>) { await work(); console.log("PASS " + label); passed++; }
const list = (role: string, extra: Record<string, unknown> = {}) => readMaterials(db, identity(role), enabled, { workspaceId: ws(role), ...extra });
const act = (role: string, input: Record<string, unknown>) => mutateMaterial(db, identity(role), enabled, { workspaceId: ws(role), submissionId: randomUUID(), ...input });
const item = (name: string, extra: Record<string, unknown> = {}) => ({ name, sku: "", unit: "each", category: "", supplier: "", ...extra });
const create = (role: string, name: string, extra: Record<string, unknown> = {}) => act(role, { action: "create", item: item(name, extra) });
const propose = (role: string, name: string, extra: Record<string, unknown> = {}) => act(role, { action: "propose", item: item(name, extra) });
const denied = (work: Promise<unknown>) => assert.rejects(work, AuthorizationAccessError);
const invalid = (work: Promise<unknown>) => assert.rejects(work, MaterialValidationError);

try {
  await db.transaction(async trx => {
    const now = new Date();
    await trx("users").insert(Object.entries(users).map(([role, id]) => ({ id, name: `Material fixture ${role}`, email: `${id}@example.test`, createdAt: now, updatedAt: now, termsVersion: "fixture", termsAcceptedAt: now })));
    for (const [id, owner] of [[workspaceId, users.owner], [otherWorkspace, users.other]]) {
      await trx("workspaces").insert({ id, ownerId: owner, businessName: "Materials fixture", businessType: "plumbing", postalCode: "", serviceRange: "", timezone: "America/New_York" });
      await trx("workspaceMemberships").insert({ workspaceId: id, userId: owner, role: "owner" });
      await initializeWorkspacePolicy(trx, { workspaceId: id, userId: owner });
    }
    await trx("workspaceMemberships").insert(["admin", "office", "field"].map(role => ({ workspaceId, userId: users[role], role })));
  });

  let copper = "", elbow = "";
  await check("owner creates items with cost and price; SKU is unique per workspace ignoring case", async () => {
    copper = (await create("owner", "Copper pipe 1/2in", { sku: "CP-12", unit: "ft", category: "Plumbing", supplier: "Acme", costCents: 250, priceCents: 400 })).materialId;
    elbow = (await create("owner", "Elbow 90", { sku: "EL-90", category: "Plumbing", costCents: 100, priceCents: 300 })).materialId;
    await invalid(create("admin", "Other copper", { sku: "cp-12" }));
    await create("other", "Other workspace pipe", { sku: "CP-12" });
    await assert.rejects(act("owner", { action: "create", item: item("Bad", { unit: "pallet" }) }));
    await assert.rejects(act("owner", { action: "create", item: item("Bad", { costCents: -1 }) }));
    await assert.rejects(act("owner", { action: "create", item: item("Bad", { imageUrl: "javascript:alert(1)" }) }));
  });
  await check("list searches, filters, sorts and paginates inside the workspace", async () => {
    assert.equal((await list("owner")).total, 2);
    assert.deepEqual((await list("owner", { q: "cp-12" })).rows.map(row => row.name), ["Copper pipe 1/2in"]);
    assert.equal((await list("owner", { q: "100%" })).total, 0);
    assert.equal((await list("owner", { category: "plumbing" })).total, 2);
    assert.equal((await list("owner", { supplier: "acme" })).total, 1);
    assert.deepEqual((await list("owner", { sort: "price", direction: "desc" })).rows.map(row => row.name), ["Copper pipe 1/2in", "Elbow 90"]);
    const page = await list("owner", { pageSize: 25, page: 2 });
    assert.equal(page.rows.length, 0); assert.equal(page.total, 2);
    assert.deepEqual((await list("owner")).options, { categories: ["Plumbing"], suppliers: ["Acme"] });
    assert.equal((await list("other")).total, 1);
  });
  await check("cost and price are redacted by permission, with margin only when both are visible", async () => {
    const owner = (await list("owner", { q: "Copper" })).rows[0];
    assert.deepEqual([owner.costCents, owner.priceCents, owner.marginPercent], [250, 400, 37.5]);
    const office = (await list("office", { q: "Copper" })).rows[0];
    assert.deepEqual([office.costCents, office.priceCents, office.marginPercent], [null, 400, null]);
    const field = await list("field", { q: "Copper", sort: "price" });
    assert.deepEqual([field.rows[0].costCents, field.rows[0].priceCents], [null, null]);
    assert.deepEqual([field.canManage, field.canPropose, field.canExport], [false, false, false]);
    assert.equal((await list("office")).canPropose, true);
  });
  await check("only owner and admin manage; edits need the version; money fields follow price and cost access", async () => {
    await denied(create("office", "Nope")); await denied(create("field", "Nope"));
    await denied(act("office", { action: "update", materialId: copper, expectedVersion: 1, item: { name: "Hacked" } }));
    await invalid(act("admin", { action: "update", materialId: copper, expectedVersion: 1, item: { name: "Copper pipe 1/2in" } }));
    const edited = await act("admin", { action: "update", materialId: copper, expectedVersion: 1, item: { priceCents: 450, notes: "Type L" } });
    assert.equal(edited.version, 2);
    await assert.rejects(act("owner", { action: "update", materialId: copper, expectedVersion: 1, item: { notes: "stale" } }), MaterialConflictError);
    await invalid(act("office", { action: "propose", item: item("Costed", { costCents: 5 }) }));
    const audit = await db("materialAudit").where({ materialId: copper, action: "update" }).first();
    assert.deepEqual(audit.changes.to, { priceCents: 450, notes: "Type L" });
    await invalid(act("owner", { action: "update", materialId: copper, expectedVersion: 2, item: { sku: "EL-90" } }));
  });
  await check("a repeated submission returns the same result and a changed one conflicts", async () => {
    const submissionId = randomUUID(), input = { workspaceId, submissionId, action: "create", item: item("Idempotent") };
    const first = await mutateMaterial(db, identity("owner"), enabled, input);
    assert.deepEqual(await mutateMaterial(db, identity("owner"), enabled, input), first);
    assert.equal((await list("owner", { q: "Idempotent" })).total, 1);
    await assert.rejects(mutateMaterial(db, identity("owner"), enabled, { ...input, item: item("Different") }), MaterialConflictError);
  });
  let pending = "";
  await check("office proposals stay out of the catalog, are visible to the proposer and approvers, and flag duplicates", async () => {
    pending = (await propose("office", "elbow 90", { sku: "el-90", priceCents: 350 })).materialId;
    assert.equal((await list("owner", { q: "elbow" })).total, 1);
    assert.equal((await list("office", { q: "elbow" })).total, 1);
    const queue = await list("owner", { status: "proposed" });
    assert.equal(queue.rows[0].duplicateOf, "Elbow 90"); assert.equal(queue.rows[0].proposedByName, "Material fixture office");
    assert.equal(queue.pendingProposals, 1);
    assert.equal((await list("office", { status: "proposed" })).total, 1);
    assert.equal((await list("admin", { status: "proposed" })).total, 1);
    await denied(list("field", { status: "proposed" }));
    await denied(propose("field", "Field idea"));
  });
  await check("approving checks SKU, can edit first, and only active items are linkable; reject and withdraw are guarded", async () => {
    await invalid(act("owner", { action: "approve", materialId: pending, expectedVersion: 1 }));
    const approved = await act("owner", { action: "approve", materialId: pending, expectedVersion: 1, item: { name: "Elbow 90 deg", sku: "EL-91" } });
    assert.equal(approved.version, 2);
    assert.equal((await list("owner", { q: "EL-91" })).rows[0].status, "active");
    const second = (await propose("office", "Wax ring")).materialId;
    await denied(act("field", { action: "withdraw", materialId: second, expectedVersion: 1 }));
    await denied(act("admin", { action: "withdraw", materialId: second, expectedVersion: 1 }));
    await denied(act("office", { action: "reject", materialId: second, expectedVersion: 1, reason: "no" }));
    await act("admin", { action: "reject", materialId: second, expectedVersion: 1, reason: "Not stocked" });
    const rejected = await list("office", { status: "rejected" });
    assert.equal(rejected.rows[0].rejectionReason, "Not stocked");
    assert.equal((await list("owner", { q: "Wax" })).total, 0);
    const third = (await propose("office", "Flange")).materialId;
    await act("office", { action: "withdraw", materialId: third, expectedVersion: 1 });
    assert.equal(await db("materialCatalog").where({ id: third }).first(), undefined);
    await invalid(act("owner", { action: "archive", materialId: second, expectedVersion: 2, archived: true }));
  });
  await check("notifications: the proposer hears about approval and rejection, nobody else does, and read is per person", async () => {
    const mine = async (role: string) => (await readNotifications(db, identity(role), enabled)).items.filter(n => n.kind === "material");
    const items = await mine("office");
    assert.equal(items.length, 2);
    const approved = items.find(n => n.kind === "material" && n.event === "approved"), rejected = items.find(n => n.kind === "material" && n.event === "rejected");
    assert.ok(approved && approved.kind === "material" && approved.materialName === "Elbow 90 deg" && approved.reason === "");
    assert.ok(rejected && rejected.kind === "material" && rejected.reason === "Not stocked" && rejected.actorName === "Material fixture admin" && !rejected.read);
    for (const role of ["owner", "admin", "field"]) assert.equal((await mine(role)).length, 0);
    assert.equal((await readNotifications(db, identity("office"), enabled)).unreadCount, 2);
    await denied(markNotificationRead(db, identity("owner"), enabled, rejected!.id));
    await markNotificationRead(db, identity("office"), enabled, rejected!.id);
    assert.equal((await readNotifications(db, identity("office"), enabled)).unreadCount, 1);
    assert.equal((await mine("other")).length, 0);
  });
  await check("archive hides items, blocks edits, and restore rechecks the SKU", async () => {
    await act("owner", { action: "archive", materialId: elbow, expectedVersion: 1, archived: true });
    assert.equal((await list("owner", { q: "EL-90" })).total, 0);
    assert.equal((await list("owner", { archived: true })).rows[0].archived, true);
    assert.ok((await list("office", { archived: true })).rows.every(row => !row.archived));
    await invalid(act("owner", { action: "update", materialId: elbow, expectedVersion: 2, item: { notes: "x" } }));
    await create("owner", "Replacement elbow", { sku: "el-90" });
    await invalid(act("owner", { action: "archive", materialId: elbow, expectedVersion: 2, archived: false }));
  });
  await check("workspace isolation: other workspaces cannot read or change items and mismatched ids are refused", async () => {
    await denied(act("other", { action: "update", materialId: copper, expectedVersion: 3, item: { notes: "x" } }));
    await denied(readMaterials(db, identity("other"), enabled, { workspaceId }));
    await denied(mutateMaterial(db, identity("owner"), enabled, { workspaceId: otherWorkspace, submissionId: randomUUID(), action: "create", item: item("X") }));
  });
  await check("work-order rows link by composite key and fall back to free text when the item is deleted", async () => {
    const customerId = randomUUID(), jobId = randomUUID(), workOrderId = randomUUID(), rowId = randomUUID();
    await db("customers").insert({ id: customerId, workspaceId, name: "Fixture customer", type: "person", companyName: "", email: "", phone: "", location: "", internalNotes: "" });
    await db("jobs").insert({ id: jobId, workspaceId, customerId, customerName: "Fixture customer", title: "Job", service: "", location: "1 Fiction Lane", description: "", primaryOwnerId: users.owner });
    await db("workOrders").insert({ id: workOrderId, workspaceId, jobId, title: "Order", status: "draft", instructions: "", accessNotes: "", safetyNotes: "" });
    const base = { workspaceId, workOrderId, position: 0, name: "Copper pipe", quantity: 1, unit: "ft" };
    await assert.rejects(db("workOrderMaterials").insert({ ...base, id: randomUUID(), catalogId: randomUUID() }));
    const foreign = await db("materialCatalog").where({ workspaceId: otherWorkspace }).first("id");
    await assert.rejects(db("workOrderMaterials").insert({ ...base, id: randomUUID(), catalogId: foreign.id }));
    await db("workOrderMaterials").insert({ ...base, id: rowId, catalogId: copper });
    await db("workOrderMaterials").insert({ ...base, id: randomUUID(), position: 1, catalogId: null });
    await db("materialCatalog").where({ id: copper }).delete();
    const row = await db("workOrderMaterials").where({ id: rowId }).first();
    assert.equal(row.catalogId, null); assert.equal(row.workspaceId, workspaceId); assert.equal(row.name, "Copper pipe");
  });
  await check("default grants: everyone reads, office proposes, only owner and admin manage", async () => {
    const rows = await db("workspaceRolePolicies").where({ workspaceId }).whereIn("permission", ["materials.read", "materials.propose", "materials.manage"]).select("role", "permission");
    const keys = rows.map(row => `${row.role}:${row.permission}`).sort();
    assert.deepEqual(keys, ["admin:materials.manage", "admin:materials.read", "field:materials.read", "office:materials.propose", "office:materials.read", "owner:materials.manage", "owner:materials.read"]);
  });
  await check("export: owner and admin only, filtered, formula-safe, audited, and stale counts are refused", async () => {
    await act("owner", { action: "create", item: { name: "=SUM(1+1) export probe", sku: "EXP-1", unit: "each", category: "", supplier: "", costCents: 150, priceCents: 300, notes: "", imageUrl: "", sourceUrl: "" } });
    const query = { workspaceId, q: "export probe" }, exportAs = (role: string, over: Record<string, unknown> = {}) => exportMaterials(db, identity(role), enabled, { query: { ...query, workspaceId: ws(role) }, expectedCount: 1, ...over });
    const csv = await exportAs("owner");
    assert.ok(csv.startsWith('\uFEFF"Name","SKU","Unit","Category","Supplier","Cost per unit","Price per unit","Status"'));
    assert.ok(csv.includes('"\'=SUM(1+1) export probe"') && csv.includes('"1.50"') && csv.includes('"3.00"'));
    assert.equal(csv.trim().split("\r\n").length, 2);
    for (const role of ["office", "field"]) await assert.rejects(exportAs(role), AuthorizationAccessError);
    await assert.rejects(exportAs("other", { query: { ...query, workspaceId } }), AuthorizationAccessError);
    await assert.rejects(exportAs("owner", { expectedCount: 5 }), MaterialConflictError);
    assert.equal(Number((await db("materialExportAudit").where({ workspaceId }).count({ count: "*" }).first())?.count), 1);
  });
  console.log(`PASS ${passed} Materials catalog database journeys`);
} finally {
  await db("workOrders").whereIn("workspaceId", [workspaceId, otherWorkspace]).delete();
  await db("jobs").whereIn("workspaceId", [workspaceId, otherWorkspace]).delete();
  await db("materialExportAudit").whereIn("workspaceId", [workspaceId, otherWorkspace]).delete();
  await db("materialNotifications").whereIn("workspaceId", [workspaceId, otherWorkspace]).delete();
  await db("materialAudit").whereIn("workspaceId", [workspaceId, otherWorkspace]).delete();
  await db("users").whereIn("id", Object.values(users)).delete();
  await db.destroy();
}
