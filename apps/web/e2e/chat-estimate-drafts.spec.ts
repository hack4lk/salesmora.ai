import { randomUUID } from "node:crypto";
import { expect, request as requests, test, type APIRequestContext } from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import {
  chatStreamEventSchema, estimateDraftChatProposeSchema, estimateDraftChatViewSchema,
  type EstimateDraftChatView, type EstimateDraftChatInput,
} from "@salesmora/contracts";

test.setTimeout(120000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") ||
    !["127.0.0.1", "localhost"].includes(new URL(connection).hostname) ||
    connection === process.env.DATABASE_URL) throw new Error("Use the isolated local test database.");
const db = createDatabase(connection);
const origin = "http://127.0.0.1:3002", headers = { Origin: origin };
let owner: APIRequestContext, field: APIRequestContext, other: APIRequestContext;
let workspaceId: string, ownerId: string, fieldId: string, otherId: string;
const prefix = randomUUID();
const blank = {
  name: "Assistant repair Draft", scope: null, message: null, paymentTerms: null, termsNote: null,
  validUntil: null, discount: null, taxRate: "8.875", deposit: null, items: null,
};
const item = {
  savedLineId: null, description: "Materials", quantity: "1", unit: "each", taxable: true, included: false,
  unitPrice: "100.00", priceSource: "user", priceQuote: "100.00", catalogRef: null,
};
test.beforeAll(async () => {
  await db("rateLimits").where("key", "like", "%/sign-up/email%").delete();
  const ids = [];
  for (const role of ["owner", "field", "other"]) {
    const client = await requests.newContext({ baseURL: origin });
    const email = `${prefix}-${role}@example.test`;
    expect((await client.post("/api/auth/sign-up/email", {
      headers, data: { name: `Draft ${role}`, email, password: "Fictional-estimate-draft-42!", termsAccepted: true },
    })).status()).toBe(200);
    ids.push((await db("users").where({ email }).first("id")).id);
    if (role === "owner") owner = client;
    else if (role === "field") field = client;
    else other = client;
  }
  [ownerId, fieldId, otherId] = ids;
  const response = await owner.post("/api/workspaces", { headers, data: {
    business: { businessName: "Estimate Draft assistant fixture", businessType: "plumbing" },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" }, team: { invitations: [] },
  } });
  expect(response.status()).toBe(201);
  workspaceId = (await response.json()).workspaceId;
  await db("workspaceMemberships").insert({ workspaceId, userId: fieldId, role: "field" });
});
test.beforeEach(async () => {
  await db("chatTurns").where({ workspaceId }).whereNotIn("state", ["accepted", "running"])
    .update({ createdAt: new Date(Date.now() - 120000) });
});
test.afterAll(async () => {
  if (workspaceId) await db("workspaces").where({ id: workspaceId }).delete();
  if (ownerId) await db("users").whereIn("id", [ownerId, fieldId, otherId]).delete();
  await Promise.all([owner, field, other].filter(Boolean).map(client => client.dispose()));
  await db.destroy();
});
async function job(assigned = true) {
  const id = randomUUID();
  await db("jobs").insert({
    id, workspaceId, title: "Assistant Draft Job", customerName: "Fictional Customer", service: "Plumbing", location: "",
    description: "PRIVATE_JOB", primaryOwnerId: assigned ? fieldId : ownerId, createdBy: ownerId,
  });
  return id;
}
function input(parentRef: string, changes = {}): EstimateDraftChatInput {
  return estimateDraftChatProposeSchema.parse({ request: {
    operation: "create", parentType: "job", parentRef, estimateRef: null,
    changes: { ...blank, items: [item], ...changes },
  } }).request;
}
function binding(view: EstimateDraftChatView) {
  const draft = view.draft;
  return {
    workspaceId, proposalId: draft.id, inputHash: draft.inputHash, authorizationVersion: draft.authorizationVersion,
    actionType: draft.actionType, parentType: draft.parent.type, parentId: draft.parent.id, parentVersion: draft.parent.version,
    estimateId: draft.actionType === "estimate.update" ? draft.estimate.id : null,
    expectedVersion: draft.actionType === "estimate.update" ? draft.estimate.expectedVersion : null,
  };
}
async function propose(request: EstimateDraftChatInput, client = owner, extra = {}) {
  const clientTurnId = randomUUID();
  const message = `fixture:estimate-draft:${JSON.stringify({ request })}`;
  const response = await client.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId, message, ...extra,
  } });
  expect(response.status()).toBe(200);
  const body = await response.text();
  const events = body.split("\n\n").filter(frame => frame.startsWith("data: "))
    .map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(6))));
  const card = events.find(event => event.type === "estimates.draft");
  return {
    view: card?.type === "estimates.draft" ? card.result : undefined,
    events, body, clientTurnId,
    threadId: events[0].type === "turn.accepted" ? events[0].threadId : "",
  };
}
function required(view: EstimateDraftChatView | undefined) {
  expect(view).toBeDefined();
  if (!view) throw new Error("Estimate Draft proposal missing.");
  return view;
}
async function decide(view: EstimateDraftChatView, decision: string, client = owner, patch = {}) {
  return client.post("/api/chat/estimates/draft", { headers, data: { ...binding(view), decision, ...patch } });
}
async function history(threadId: string) {
  return (await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${threadId}`)).json();
}

test("preparation/cancellation never creates or edits an Estimate and history restores the exact review", async () => {
  const parentId = await job();
  const before = await db("estimates").where({ workspaceId }).select("id", "version");
  const run = await propose(input(parentId));
  const view = required(run.view);
  expect(view.canConfirm).toBe(true);
  expect((await history(run.threadId)).turns[0].estimateDraft).toEqual(view);
  expect(await db("estimates").where({ workspaceId }).select("id", "version")).toEqual(before);
  const cancelled = await decide(view, "cancel");
  expect(cancelled.status()).toBe(200);
  expect((await cancelled.json()).view.draft.state).toBe("cancelled");
  expect((await decide(view, "cancel")).status()).toBe(200);
  expect((await decide(view, "confirm")).status()).toBe(409);
  expect(await db("estimates").where({ workspaceId }).select("id", "version")).toEqual(before);
  expect(await db("chatEstimateDraftAudit").where({ workspaceId, proposalId: view.draft.id }).pluck("action")).toEqual(["proposed", "cancelled"]);
});

test("explicit confirmation atomically saves exact canonical amounts, issues no delivery and safely replays", async () => {
  const parentId = await job();
  const run = await propose(input(parentId, {
    items: [item, { ...item, description: "Installation", taxable: false, unitPrice: "400.00", priceQuote: "400.00" }],
    discount: { type: "percent", value: "10" }, deposit: { type: "percent", value: "25" },
  }));
  const view = required(run.view);
  const [first, retry] = await Promise.all([decide(view, "confirm"), decide(view, "confirm")]);
  expect(first.status()).toBe(200); expect(retry.status()).toBe(200);
  const saved = (await first.json()).view;
  expect(saved).toEqual((await retry.json()).view);
  const row = await db("estimates").where({ workspaceId, id: saved.receipt.id }).first();
  expect(row.status).toBe("draft");
  expect(Number(row.totalCents)).toBe(45799);
  expect(Number(row.depositCents)).toBe(11450);
  expect(Number(row.balanceCents)).toBe(34349);
  expect(await db("estimates").where({ workspaceId, jobId: parentId }).count("* as n").first()).toMatchObject({ n: "1" });
  expect(await db("estimate_deliveries").where({ workspaceId, estimateId: row.id })).toEqual([]);
  expect(await db("estimate_share_tokens").where({ workspaceId, estimateId: row.id })).toEqual([]);
  expect((await history(run.threadId)).turns[0].estimateDraft.draft.state).toBe("confirmed");
  expect((await decide(view, "open")).status()).toBe(200);
});

test("missing/forged prices stay blank until an explicit unsaved editor refresh, then the old proposal is superseded", async () => {
  const parentId = await job();
  const run = await propose(input(parentId, { items: [{ ...item, priceQuote: "$999.00" }] }));
  const view = required(run.view);
  // The quote is present in the fixture user message, but does not match the requested numeric price.
  expect(view.draft.proposed.items[0]).toMatchObject({ unitPrice: "", priceSource: { type: "missing" } });
  expect((await decide(view, "confirm")).status()).toBe(422);
  const opened = await decide(view, "editor");
  expect(opened.status()).toBe(200);
  expect((await opened.json()).href).toContain(`&proposal=${view.draft.id}`);
  expect(await db("estimates").where({ workspaceId, jobId: parentId })).toEqual([]);
  const refreshed = await owner.patch("/api/chat/estimates/draft", { headers, data: {
    workspaceId, request: { ...binding(view), workspaceId: undefined },
    content: { ...view.draft.proposed, items: [{ ...view.draft.proposed.items[0], unitPrice: "125.00", priceSource: { type: "user" } }] },
  } });
  expect(refreshed.status()).toBe(200);
  const next = estimateDraftChatViewSchema.parse((await refreshed.json()).view);
  expect(next.draft.id).not.toBe(view.draft.id);
  expect(next.canConfirm).toBe(true);
  expect(await db("estimates").where({ workspaceId, jobId: parentId })).toEqual([]);
  expect((await decide(view, "confirm")).status()).toBe(409);
  expect((await decide(next, "confirm")).status()).toBe(200);
});

test("Draft updates preserve private fields and unchanged prices, show before/after, and save only after confirmation", async () => {
  const parentId = await job();
  const created = required((await propose(input(parentId))).view);
  const saved = (await (await decide(created, "confirm")).json()).view.receipt;
  await db("estimates").where({ id: saved.id }).update({
    internalNotes: "PRIVATE_NOTE", paymentLink: "https://example.test/PRIVATE_PAYMENT",
    recipientName: "PRIVATE_RECIPIENT", recipientEmail: "PRIVATE_RECIPIENT@example.test",
  });
  const request = estimateDraftChatProposeSchema.parse({ request: {
    operation: "update", parentType: null, parentRef: null, estimateRef: saved.id,
    changes: { ...blank, name: "Updated repair scope", scope: "Only the requested scope", taxRate: null, items: null },
  } }).request;
  const run = await propose(request);
  expect(run.body).not.toContain("PRIVATE_");
  const view = required(run.view);
  expect(view.draft.actionType).toBe("estimate.update");
  expect(view.draft.proposed.items[0]).toMatchObject({ unitPrice: "100.00", priceSource: { type: "saved" } });
  expect((await db("estimates").where({ id: saved.id }).first()).name).toBe("Assistant repair Draft");
  expect((await decide(view, "confirm")).status()).toBe(200);
  expect(await db("estimates").where({ id: saved.id }).first()).toMatchObject({
    name: "Updated repair scope", internalNotes: "PRIVATE_NOTE", paymentLink: "https://example.test/PRIVATE_PAYMENT",
    recipientName: "PRIVATE_RECIPIENT", recipientEmail: "PRIVATE_RECIPIENT@example.test", version: saved.version + 1,
  });
});

test("binding/origin/ownership/parent changes fail closed without writes", async () => {
  const parentId = await job();
  const run = await propose(input(parentId));
  const view = required(run.view);
  for (const patch of [{ inputHash: "f".repeat(64) }, { parentVersion: 99 }, { proposalId: randomUUID() }, { estimateId: randomUUID() }]) {
    expect((await decide(view, "confirm", owner, patch)).status()).not.toBe(200);
  }
  expect((await decide(view, "confirm", other)).status()).toBe(404);
  expect((await owner.post("/api/chat/estimates/draft", { headers: { Origin: "https://foreign.test" }, data: { ...binding(view), decision: "confirm" } })).status()).toBe(403);
  await db("jobs").where({ id: parentId }).increment("version", 1);
  expect((await decide(view, "confirm")).status()).toBe(409);
  expect((await history(run.threadId)).turns[0].estimateDraft).toBeUndefined();
  expect(await db("estimates").where({ workspaceId, jobId: parentId })).toEqual([]);
});

test("catalog prices come from authorized server rows, and unchanged catalog snapshots survive Draft updates", async () => {
  const parentId = await job(), materialId = randomUUID();
  await db("materialCatalog").insert({ id: materialId, workspaceId, name: "Verified fixture fitting", unit: "each", sku: "FIXTURE-42", priceCents: 2250 });
  const view = required((await propose(input(parentId, { items: [{
    ...item, unitPrice: "999.00", priceSource: "catalog", priceQuote: null, catalogRef: "FIXTURE-42",
  }] }))).view);
  expect(view.draft.proposed.items[0]).toMatchObject({
    unitPrice: "22.50", priceSource: { type: "catalog", name: "Verified fixture fitting" },
    catalog: { id: materialId, name: "Verified fixture fitting", unit: "each", sku: "FIXTURE-42" },
  });
  const saved = (await (await decide(view, "confirm")).json()).view.receipt;
  const request = estimateDraftChatProposeSchema.parse({ request: {
    operation: "update", parentType: null, parentRef: null, estimateRef: saved.id,
    changes: { ...blank, taxRate: null, scope: "Updated catalog scope", items: null },
  } }).request;
  const updated = required((await propose(request)).view);
  expect((await decide(updated, "confirm")).status()).toBe(200);
  const seed = await (await owner.get(`/api/estimates/${saved.id}?workspace=${workspaceId}`)).json();
  expect(seed.estimate.values.items[0]).toMatchObject({ unitPrice: "22.50", catalog: view.draft.proposed.items[0].catalog });
});

test("natural-language yes cannot confirm a pending proposal; empty Drafts remain explicitly confirmable", async () => {
  const parentId = await job();
  const run = await propose(input(parentId, { items: [] }));
  const view = required(run.view);
  expect(view.canConfirm).toBe(true);
  const yes = await propose(input(parentId), owner, { threadId: run.threadId, message: "yes" });
  expect(yes.view).toBeUndefined();
  expect(await db("estimates").where({ workspaceId, jobId: parentId })).toEqual([]);
  expect((await decide(view, "confirm")).status()).toBe(200);
  expect((await db("estimates").where({ workspaceId, jobId: parentId }).first()).totalCents).toBeNull();
});

test("Field may propose/confirm only assigned Jobs; duplicate open Estimates cannot be created", async () => {
  const parentId = await job();
  const view = required((await propose(input(parentId), field)).view);
  expect((await decide(view, "confirm", field)).status()).toBe(200);
  const duplicate = await propose(input(parentId), field);
  expect(duplicate.view).toBeUndefined();
  const forbiddenJob = await job(false);
  const inaccessible = await propose(input(forbiddenJob), field);
  expect(inaccessible.view).toBeUndefined();
  expect(inaccessible.body).toContain("access_denied");
  expect(await db("estimates").where({ workspaceId, jobId: forbiddenJob })).toEqual([]);
});

test("new proposals supersede earlier intent and current Field assignment is required again on confirmation", async () => {
  const parentId = await job();
  const first = await propose(input(parentId));
  const old = required(first.view);
  const latest = required((await propose(input(parentId, { scope: "Refined scope" }), owner, { threadId: first.threadId })).view);
  expect((await decide(old, "confirm")).status()).toBe(409);
  expect((await decide(latest, "cancel")).status()).toBe(200);
  const fieldRun = await propose(input(parentId), field);
  const fieldView = required(fieldRun.view);
  await db("jobs").where({ id: parentId }).update({ primaryOwnerId: ownerId }).increment("version", 1);
  expect((await decide(fieldView, "confirm", field)).status()).toBe(404);
  expect(await db("estimates").where({ workspaceId, jobId: parentId })).toEqual([]);
  const response = await field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${fieldRun.threadId}`);
  expect(response.status()).toBe(200);
  expect((await response.json()).turns[0].estimateDraft).toBeUndefined();
});

test("a catalog change during streaming blocks later proposal text, card release and restored content", async () => {
  const parentId = await job(), materialId = randomUUID(), clientTurnId = randomUUID();
  await db("materialCatalog").insert({ id: materialId, workspaceId, name: "Streaming catalog fitting", unit: "each", priceCents: 2250 });
  const request = input(parentId, { items: [{ ...item, priceSource: "catalog", priceQuote: null, catalogRef: "Streaming catalog fitting" }] });
  const pending = owner.post("/api/chat/turns", { headers, data: {
    workspaceId, clientTurnId, surfaceKey: "home",
    message: `fixture:estimate-draft-slow:${JSON.stringify({ request })}`,
  } });
  let turn: { id: string; threadId: string } | undefined;
  for (let attempt = 0; attempt < 200; attempt++) {
    turn = await db("chatTurns as t").join("chatMessages as m", "m.turnId", "t.id")
      .where({ "t.clientTurnId": clientTurnId, "m.role": "assistant" }).where("m.text", "<>", "")
      .select("t.id", "t.threadId").first();
    if (turn) break;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  expect(turn).toBeDefined();
  await db("materialCatalog").where({ id: materialId }).update({ priceCents: 3000 });
  const body = await (await pending).text();
  expect(body).toContain("access_denied");
  expect(body).not.toContain("Estimate Draft fixture complete.");
  expect(body).not.toContain("estimates.draft");
  if (!turn) throw new Error("Streaming proposal turn missing.");
  const saved = await history(turn.threadId);
  expect(saved.turns[0].estimateDraft).toBeUndefined();
  expect(saved.messages.filter((message: { role: string }) => message.role === "assistant")
    .every((message: { text: string }) => !message.text.includes("Review the Estimate Draft proposal."))).toBe(true);
  expect(await db("estimates").where({ workspaceId, jobId: parentId })).toEqual([]);
});

test("live missing-price handoff and refreshed review save nothing until the card is explicitly confirmed", async ({ page }) => {
  const parentId = await job();
  const request = input(parentId, { items: [{ ...item, unitPrice: null, priceSource: "missing", priceQuote: null }] });
  await page.context().addCookies((await owner.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("textbox", { name: "Ask the SalesMora assistant" }).fill(`fixture:estimate-draft:${JSON.stringify({ request })}`);
  await page.getByRole("button", { name: "Ask assistant", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirm Draft creation", exact: true })).toBeDisabled();
  await page.reload();
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("button", { name: "Review in editor", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Review unsaved Estimate proposal", exact: true })).toBeVisible({ timeout: 30000 });
  expect(await db("estimates").where({ workspaceId, jobId: parentId })).toEqual([]);
  await page.getByRole("textbox", { name: "Unit price (USD)", exact: true }).fill("125.00");
  await page.getByRole("button", { name: "Review refreshed proposal", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirm Draft creation", exact: true })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole("button", { name: "Confirm Draft creation", exact: true })).toBeEnabled({ timeout: 30000 });
  expect(await db("estimates").where({ workspaceId, jobId: parentId })).toEqual([]);
  await page.getByRole("button", { name: "Confirm Draft creation", exact: true }).click();
  await expect(page.getByText("The host reports this Draft proposal was saved.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Open saved Draft", exact: true })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "Open saved Draft", exact: true }).click();
  await expect(page).toHaveURL(/\/estimates\/[0-9a-f-]+\?workspace=/, { timeout: 30000 });
  expect(await db("estimates").where({ workspaceId, jobId: parentId }).count("* as n").first()).toMatchObject({ n: "1" });
});
