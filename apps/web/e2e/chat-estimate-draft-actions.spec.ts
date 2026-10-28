import { randomUUID } from "node:crypto";
import { expect, request as requests, test, type APIRequestContext, type Page } from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import {
  chatStreamEventSchema, estimateDraftActionChatResponseSchema,
  type EstimateDraftActionChatInput, type EstimateDraftActionChatTicket,
} from "@salesmora/contracts";
import { estimateProposalDigest } from "../../../packages/data/src/estimates/chat-proposals";
import { down as rollbackEvidence } from "../../../packages/data/src/migrations/202610270004_estimate_draft_action_evidence";
import { estimateDraftActionBinding } from "../src/features/assistant/estimate-result/estimate-draft-action-client";
import { estimateDraftActionCardData as c } from "../src/features/estimates/estimate-draft-action-card/estimate-draft-action-card.data";

test.setTimeout(120000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") ||
    !["127.0.0.1", "localhost"].includes(new URL(connection).hostname) || connection === process.env.DATABASE_URL) {
  throw new Error("Use the isolated local test database.");
}
const db = createDatabase(connection), origin = "http://127.0.0.1:3002", headers = { Origin: origin }, prefix = randomUUID();
let owner: APIRequestContext, field: APIRequestContext, other: APIRequestContext;
let workspaceId: string, ownerId: string, fieldId: string, otherId: string;
test.beforeAll(async () => {
  await db("rateLimits").where("key", "like", "%/sign-up/email%").delete();
  const ids = [];
  for (const role of ["owner", "field", "other"]) {
    const client = await requests.newContext({ baseURL: origin }), email = `${prefix}-${role}@example.test`;
    expect((await client.post("/api/auth/sign-up/email", {
      headers, data: { name: `Draft action ${role}`, email, password: "Fictional-draft-actions-42!", termsAccepted: true },
    })).status()).toBe(200);
    ids.push((await db("users").where({ email }).first("id")).id);
    if (role === "owner") owner = client; else if (role === "field") field = client; else other = client;
  }
  [ownerId, fieldId, otherId] = ids;
  const workspace = await owner.post("/api/workspaces", { headers, data: {
    business: { businessName: "Assistant Draft Actions Fixture", businessType: "plumbing" },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" }, team: { invitations: [] },
  } });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json()).workspaceId;
  await db("workspaceMemberships").insert({ workspaceId, userId: fieldId, role: "field" });
  const settings = await (await owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
  expect((await owner.put("/api/settings/estimates", { headers, data: {
    workspaceId, expectedVersion: settings.record.version,
    profile: { ...settings.record.profile, name: "Assistant Draft Actions Fixture", address: "1 Fixture Avenue",
      phone: "555-0100", email: "estimates@example.test", requireServiceAddress: true },
  } })).status()).toBe(200);
});
test.beforeEach(async () => {
  await db("chatTurns").where({ workspaceId }).whereNotIn("state", ["accepted", "running"])
    .update({ createdAt: new Date(Date.now() - 120000) });
});
test.afterAll(async () => {
  if (workspaceId) {
    await db("estimate_operation_receipts").where({ workspaceId }).delete();
    await db("estimates").where({ workspaceId }).delete();
    await db("workspaces").where({ id: workspaceId }).delete();
  }
  if (ownerId) await db("users").whereIn("id", [ownerId, fieldId, otherId]).delete();
  await Promise.all([owner, field, other].filter(Boolean).map(client => client.dispose()));
  await db.destroy();
});
async function source(publish = true) {
  const parentId = randomUUID();
  await db("jobs").insert({
    id: parentId, workspaceId, title: "Draft action job", customerName: "Private copied recipient",
    service: "Plumbing", location: "", description: "PRIVATE_JOB_NOTE", primaryOwnerId: fieldId, createdBy: ownerId,
  });
  const response = await owner.post("/api/estimates", { headers, data: {
    workspaceId, submissionId: randomUUID(), parentType: "job", parentId,
    values: {
      details: { name: "Draft action fixture", recipientName: "Private copied recipient", recipientEmail: "customer@example.test",
        serviceAddress: "2 Fixture Avenue", ownerId: fieldId },
      items: [{ description: "Saved repair", quantity: "2.5", unitPrice: "100.00", taxable: false, included: false }],
      totals: { discount: { type: "none" }, taxRate: "0" },
      terms: { message: "PRIVATE_CUSTOMER_MESSAGE", validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        paymentTerms: "Due on completion.", termsNote: "Customer terms.", deposit: { type: "none" } },
      scope: "PRIVATE_SAVED_SCOPE", internalNotes: "PRIVATE_COPIED_NOTES", paymentLink: "https://payments.example.test/PRIVATE_PAYMENT_URL",
    },
  } });
  expect(response.status()).toBe(201);
  const saved = await response.json();
  if (publish) {
    const review = await (await owner.get(`/api/estimates/${saved.id}/sharing?workspace=${workspaceId}`)).json();
    expect((await owner.post(`/api/estimates/${saved.id}/sharing?workspace=${workspaceId}`, { headers, data: {
      workspaceId, estimateId: saved.id, expectedVersion: saved.version, snapshotHash: review.snapshotHash,
      submissionId: randomUUID(), mode: "publish",
    } })).status()).toBe(200);
  }
  return { ...saved, parentId };
}
const input = (estimateRef: string | null, operation: "revise" | "duplicate" = "revise"): EstimateDraftActionChatInput => ({ operation, estimateRef });
async function propose(request: EstimateDraftActionChatInput, client = owner, extra = {}) {
  const response = await client.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(),
    message: `fixture:estimate-draft-action:${JSON.stringify({ request })}`, ...extra,
  } });
  expect(response.status()).toBe(200);
  const text = await response.text();
  const events = text.split("\n\n").filter(frame => frame.startsWith("data: "))
    .map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(6))));
  const card = events.find(event => event.type === "estimates.draft_action"), accepted = events.find(event => event.type === "turn.accepted");
  if (card?.type !== "estimates.draft_action" || accepted?.type !== "turn.accepted") throw new Error(`Missing Draft action: ${text}`);
  return { ticket: card.result, threadId: accepted.threadId, turnId: accepted.turnId, text };
}
const data = (ticket: EstimateDraftActionChatTicket, decision = "confirm") => ({ workspaceId, request: estimateDraftActionBinding(ticket), decision });
const operate = (ticket: EstimateDraftActionChatTicket, decision = "confirm", client = owner) =>
  client.post("/api/chat/estimates/draft-actions", { headers, data: data(ticket, decision) });
async function review(ticket: EstimateDraftActionChatTicket, client = owner) {
  const query = new URLSearchParams({ workspace: workspaceId });
  for (const [key, value] of Object.entries(estimateDraftActionBinding(ticket))) query.set(key, String(value));
  return client.get(`/api/chat/estimates/draft-actions?${query}`);
}
async function show(page: Page, request: EstimateDraftActionChatInput, client = owner) {
  await page.context().addCookies((await client.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("textbox", { name: "Ask the SalesMora assistant" }).fill(`fixture:estimate-draft-action:${JSON.stringify({ request })}`);
  await page.getByRole("button", { name: "Ask assistant", exact: true }).click();
}
const history = async (threadId: string, client = owner) =>
  (await client.get(`/api/chat/threads?workspace=${workspaceId}&thread=${threadId}`)).json();
async function pendingRevision(estimateId: string) {
  const family = await (await owner.get(`/api/estimates/${estimateId}/revisions?workspace=${workspaceId}`)).json();
  const response = await owner.post(`/api/estimates/${estimateId}/revise`, { headers, data: {
    workspaceId, estimateId, expectedVersion: family.version, snapshotHash: family.snapshotHash, submissionId: randomUUID(),
  } });
  expect(response.status()).toBe(201);
  return response.json();
}
async function followup(threadId: string, client = owner, slow = false) {
  return client.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", threadId, clientTurnId: randomUUID(),
    message: `fixture:estimate-draft-action-history${slow ? "-slow" : ""}`,
  } });
}
test("compact streaming/history, no-write preparation, natural-language yes and explicit cancellation", async () => {
  const saved = await source(), before = await db("estimates").where({ workspaceId }).count("* as count").first();
  const run = await propose(input(saved.id, "duplicate"));
  for (const text of ["Private copied recipient", "customer@example.test", "PRIVATE_COPIED_NOTES", "PRIVATE_SAVED_SCOPE", "PRIVATE_PAYMENT_URL", "PRIVATE_CUSTOMER_MESSAGE"]) {
    expect(run.text).not.toContain(text);
    expect(JSON.stringify((await history(run.threadId)).turns)).not.toContain(text);
  }
  const checked = await review(run.ticket);
  expect(checked.status()).toBe(200); expect(checked.headers()["cache-control"]).toContain("no-store");
  expect(estimateDraftActionChatResponseSchema.parse(await checked.json()).view.review.values.internalNotes).toBe("PRIVATE_COPIED_NOTES");
  expect((await history(run.threadId)).turns[0].estimateDraftAction).toEqual(run.ticket);
  const yes = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", threadId: run.threadId, clientTurnId: randomUUID(), message: "yes",
  } });
  expect(yes.status()).toBe(200); await yes.text();
  expect(await db("estimates").where({ workspaceId }).count("* as count").first()).toEqual(before);
  expect((await operate(run.ticket, "cancel")).status()).toBe(200);
  expect((await history(run.threadId)).turns.find((turn: { id: string }) => turn.id === run.turnId).estimateDraftAction.state).toBe("cancelled");
  expect(await db("estimates").where({ workspaceId }).count("* as count").first()).toEqual(before);
});
test("browser revision confirms frozen contents without sending or navigation, restores receipt and checks Open Draft", async ({ page }) => {
  const saved = await source();
  const tokensBefore = await db("estimate_share_tokens").where({ estimateId: saved.id }).select("*");
  await show(page, input(saved.id));
  await expect(page.getByText("PRIVATE_SAVED_SCOPE", { exact: true })).toBeVisible();
  await expect(page.getByText(c.noNotesCopied, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: c.confirm.revise, exact: true }).click();
  await expect(page.getByText(c.confirmed.revise, { exact: true })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/home");
  const row = await db("chatEstimateDraftActions").where({ workspaceId }).orderBy("createdAt", "desc").first();
  const receipt = row.payload.receipt;
  expect(receipt).toMatchObject({ number: saved.number, revision: 2, reused: false });
  expect(await db("estimate_share_tokens").where({ estimateId: saved.id }).select("*")).toEqual(tokensBefore);
  expect(await db("estimate_deliveries").where({ workspaceId })).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await expect(page.getByText(c.confirmed.revise, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: c.open, exact: true }).click();
  await page.waitForURL(`**/estimates/${receipt.id}?workspace=${workspaceId}`);
  expect((await db("estimates").where({ id: saved.id }).first()).status).toBe("published");
});
test("phone Duplicate preserves saved rows/private notes, clears recipient/date/payment and assigns a new number", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const saved = await source(false);
  await show(page, input(saved.id, "duplicate"));
  await expect(page.getByText("PRIVATE_COPIED_NOTES", { exact: true })).toBeVisible();
  await expect(page.getByText("customer@example.test", { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: c.confirm.duplicate, exact: true }).click();
  await expect(page.getByText(c.confirmed.duplicate, { exact: true })).toBeVisible();
  const row = await db("chatEstimateDraftActions").where({ workspaceId }).orderBy("createdAt", "desc").first();
  const checked = estimateDraftActionChatResponseSchema.parse(await (await operate(row.payload.ticket, "open")).json());
  expect(checked.view.receipt!.number).not.toBe(saved.number);
  const seed = await (await owner.get(`/api/estimates/${checked.view.receipt!.id}?workspace=${workspaceId}`)).json();
  expect(seed.estimate.values.details).toMatchObject({ recipientName: "", recipientEmail: "" });
  expect(seed.estimate.values).toMatchObject({ internalNotes: "PRIVATE_COPIED_NOTES", paymentLink: "", terms: { validUntil: "" } });
  expect(seed.estimate.values.items).toMatchObject([{ quantity: "2.5", unitPrice: "100.00" }]);
  expect(seed.estimate.parent.id).toBe(saved.parentId);
  expect(await db("estimate_decisions").where({ estimateId: checked.view.receipt!.id })).toEqual([]);
});
test("browser explicitly reuses the exact edited pending revision without overwriting", async ({ page }) => {
  const saved = await source(), pending = await pendingRevision(saved.id);
  const seed = await (await owner.get(`/api/estimates/${pending.id}?workspace=${workspaceId}`)).json();
  expect((await owner.patch(`/api/estimates/${pending.id}`, { headers, data: {
    workspaceId, estimateId: pending.id, expectedVersion: seed.estimate.version,
    values: { ...seed.estimate.values, scope: "EDITED_PENDING_SCOPE", internalNotes: "EDITED_PENDING_PRIVATE_NOTE" },
  } })).status()).toBe(200);
  const before = await db("estimates").where({ id: pending.id }).first();
  await show(page, input(saved.id));
  await expect(page.getByText("EDITED_PENDING_SCOPE", { exact: true })).toBeVisible();
  await expect(page.getByText("EDITED_PENDING_PRIVATE_NOTE", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: c.confirm.reuse, exact: true }).click();
  await expect(page.getByText(c.confirmed.reuse, { exact: true })).toBeVisible();
  expect(await db("estimates").where({ id: pending.id }).first()).toEqual(before);
  expect((await db("chatEstimateDraftActions").where({ workspaceId }).orderBy("createdAt", "desc").first()).payload.receipt).toMatchObject({
    id: pending.id, reused: true, version: before.version,
  });
});
test("HTTP boundary requires owned completed proposal, exact bindings, same origin and metadata-only requests", async () => {
  const saved = await source(), run = await propose(input(saved.id));
  expect((await review(run.ticket, other)).status()).toBe(404);
  expect((await operate(run.ticket, "confirm", other)).status()).toBe(404);
  expect((await owner.post("/api/chat/estimates/draft-actions", { data: data(run.ticket) })).status()).toBe(403);
  expect((await owner.post("/api/chat/estimates/draft-actions", { headers: { Origin: "https://other.example.test" }, data: data(run.ticket) })).status()).toBe(403);
  for (const request of [{ ...data(run.ticket), values: {} }, { ...data(run.ticket), decision: "yes" },
    { ...data(run.ticket), request: { ...data(run.ticket).request, inputHash: "f".repeat(64) } },
    { ...data(run.ticket), request: { ...data(run.ticket).request, reviewHash: "f".repeat(64) } },
    { ...data(run.ticket), request: { ...data(run.ticket).request, expectedVersion: 999 } }]) {
    expect((await owner.post("/api/chat/estimates/draft-actions", { headers, data: request })).status()).not.toBe(200);
  }
  await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
  expect((await review(run.ticket)).status()).toBe(409);
  expect((await operate(run.ticket)).status()).toBe(409);
  await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
  expect((await operate(run.ticket, "cancel")).status()).toBe(200);
});
test("concurrent confirmation and lost-response retry resolve one exact saved Draft and one audit", async () => {
  const saved = await source(), run = await propose(input(saved.id, "duplicate"));
  const responses = await Promise.all([operate(run.ticket), operate(run.ticket)]);
  expect(responses.map(response => response.status())).toEqual([200, 200]);
  const first = estimateDraftActionChatResponseSchema.parse(await responses[0].json());
  expect(estimateDraftActionChatResponseSchema.parse(await responses[1].json()).view.receipt).toEqual(first.view.receipt);
  expect(estimateDraftActionChatResponseSchema.parse(await (await operate(run.ticket)).json()).view.receipt).toEqual(first.view.receipt);
  expect(await db("chatEstimateDraftActionAudit").where({ proposalId: run.ticket.id }).pluck("action")).toEqual(["proposed", "confirmed"]);
});
test("creation intent conflicts rather than silently switching to reuse after another Draft is created", async () => {
  const saved = await source(), run = await propose(input(saved.id));
  const pending = await pendingRevision(saved.id), before = await db("estimates").where({ id: pending.id }).first();
  expect((await operate(run.ticket)).status()).toBe(409);
  expect((await review(run.ticket)).status()).toBe(409);
  expect(await db("estimates").where({ id: pending.id }).first()).toEqual(before);
  expect((await history(run.threadId)).turns[0].estimateDraftAction).toBeUndefined();
});
test("Field assignment loss withholds private browser review and blocks stale confirmation", async ({ page }) => {
  const saved = await source();
  await show(page, input(saved.id, "duplicate"), field);
  await expect(page.getByText("PRIVATE_COPIED_NOTES", { exact: true })).toBeVisible();
  const row = await db("chatEstimateDraftActions").where({ workspaceId, userId: fieldId }).orderBy("createdAt", "desc").first();
  await db("jobs").where({ id: saved.parentId }).update({ primaryOwnerId: ownerId }).increment("version", 1);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("button", { name: c.confirm.duplicate, exact: true })).not.toBeVisible();
  await expect(page.getByText("PRIVATE_COPIED_NOTES", { exact: true })).not.toBeVisible();
  expect((await operate(row.payload.ticket, "confirm", field)).status()).toBe(404);
});
test("same-role membership replacement invalidates pending/confirmed reads, retries and checked opening", async () => {
  const saved = await source(), run = await propose(input(saved.id, "duplicate"), field);
  expect((await operate(run.ticket, "confirm", field)).status()).toBe(200);
  const membership = await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).first();
  await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).delete();
  await db("workspaceMemberships").insert(membership);
  expect((await review(run.ticket, field)).status()).toBe(404);
  expect((await operate(run.ticket, "open", field)).status()).toBe(404);
  expect((await operate(run.ticket, "confirm", field)).status()).toBe(404);
  expect((await history(run.threadId, field)).turns[0].estimateDraftAction).toBeUndefined();
});
test("changed saved destination invalidates receipt restoration and opening without another copy", async () => {
  const saved = await source(), run = await propose(input(saved.id, "duplicate"));
  const result = estimateDraftActionChatResponseSchema.parse(await (await operate(run.ticket)).json());
  await db("estimates").where({ id: result.view.receipt!.id }).update({ scope: "Later saved edit" }).increment("version", 1);
  expect((await operate(run.ticket, "open")).status()).toBe(409);
  expect((await operate(run.ticket)).status()).toBe(409);
  expect((await history(run.threadId)).turns[0].estimateDraftAction).toBeUndefined();
});
test("follow-up history inherits flattened confirmed action provenance, never private content, and migration retains it", async () => {
  const saved = await source(), run = await propose(input(saved.id, "duplicate"), field);
  expect((await operate(run.ticket, "confirm", field)).status()).toBe(200);
  for (let count = 0; count < 2; count++) {
    const response = await followup(run.threadId, field);
    expect(response.status()).toBe(200); expect(await response.text()).toContain("Verified confirmed Draft operation.");
  }
  const turns = await db("chatTurns").where({ threadId: run.threadId }).whereNot({ id: run.turnId }).select("*");
  expect(turns.every(turn => JSON.stringify(turn.estimateDraftActionEvidence) === JSON.stringify([run.turnId]))).toBe(true);
  await expect(rollbackEvidence(db)).rejects.toThrow("Retained Draft-action evidence");
  const membership = await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).first();
  await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).delete();
  await db("workspaceMemberships").insert(membership);
  const restored = await history(run.threadId, field);
  expect(restored.messages.filter((message: { role: string }) => message.role === "assistant")
    .every((message: { text: string }) => !message.text.includes("Verified confirmed Draft operation."))).toBe(true);
  expect(restored.turns.every((turn: { estimateDraftActionEvidence: string[] }) => turn.estimateDraftActionEvidence.length === 0)).toBe(true);
});
test("mid-stream inherited action revocation blocks later text and redacts restored follow-ups", async () => {
  const saved = await source(), run = await propose(input(saved.id, "duplicate"), field);
  expect((await operate(run.ticket, "confirm", field)).status()).toBe(200);
  const response = followup(run.threadId, field, true);
  await expect.poll(async () => !!await db("chatTurns").where({ workspaceId, threadId: run.threadId, state: "running" })
    .whereRaw(`jsonb_array_length("estimateDraftActionEvidence") > 0`).first("id")).toBe(true);
  await db("jobs").where({ id: saved.parentId }).update({ primaryOwnerId: ownerId }).increment("version", 1);
  expect(await (await response).text()).not.toContain("Verified confirmed Draft operation.");
  const restored = await history(run.threadId, field);
  expect(restored.turns.every((turn: { estimateDraftActionEvidence: string[] }) => turn.estimateDraftActionEvidence.length === 0)).toBe(true);
});
test("pending-proposal expiry invalidates inherited follow-up evidence before the later streamed answer", async () => {
  const saved = await source(), run = await propose(input(saved.id));
  const response = followup(run.threadId, owner, true);
  await expect.poll(async () => !!await db("chatTurns").where({ threadId: run.threadId, state: "running" })
    .whereRaw(`jsonb_array_length("estimateDraftActionEvidence") > 0`).first("id")).toBe(true);
  const row = await db("chatEstimateDraftActions").where({ id: run.ticket.id }).first();
  const payload = row.payload, expires = Date.now() - 1;
  payload.ticket.createdAt = new Date(expires - 900000).toISOString(); payload.ticket.expiresAt = new Date(expires).toISOString();
  const immutable = Object.fromEntries(Object.entries(payload.ticket).filter(([key]) => !["state", "inputHash"].includes(key)));
  payload.ticket.inputHash = estimateProposalDigest({ ticket: immutable, review: payload.review, stamp: payload.stamp });
  await db("chatEstimateDraftActions").where({ id: run.ticket.id }).update({ payload: JSON.stringify(payload) });
  expect(await (await response).text()).not.toContain("No verified confirmed Draft operation.");
  const restored = await history(run.threadId);
  expect(restored.turns.every((turn: { estimateDraftActionEvidence: string[] }) => turn.estimateDraftActionEvidence.length === 0)).toBe(true);
  expect(await db("estimates").where({ sourceEstimateId: saved.id })).toEqual([]);
});
test("a newer Draft-action proposal supersedes the older intent and preserves no-write cancellation", async () => {
  const saved = await source(), run = await propose(input(saved.id));
  const newer = await propose(input(saved.id, "duplicate"), owner, { threadId: run.threadId });
  expect((await db("chatEstimateDraftActions").where({ id: run.ticket.id }).first()).state).toBe("superseded");
  expect((await operate(run.ticket)).status()).toBe(409);
  expect((await operate(newer.ticket, "cancel")).status()).toBe(200);
  expect(await db("estimates").where({ sourceEstimateId: saved.id })).toEqual([]);
});
test("exact Estimate number and selected page resolve the intended source; explicit Draft UUID never retargets", async () => {
  const saved = await source(), pending = await pendingRevision(saved.id);
  const numbered = await propose(input(saved.number));
  expect(numbered.ticket.source.id).toBe(saved.id);
  expect(numbered.ticket.plan.existingDraft?.id).toBe(pending.id);
  const selected = await propose(input(null, "duplicate"), owner, {
    surfaceKey: "estimate.detail", recordRefs: [{ type: "estimate", id: saved.id }],
  });
  expect(selected.ticket.source.id).toBe(saved.id);
  const denied = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(),
    message: `fixture:estimate-draft-action:${JSON.stringify({ request: input(pending.id) })}`,
  } });
  const text = await denied.text();
  expect(text).not.toContain('"type":"estimates.draft_action"');
  expect(await db("estimates").where({ sourceEstimateId: saved.id })).toHaveLength(1);
});
test("replacing pending decision with a Draft action, then sharing, succeeds without inheriting superseded intent", async () => {
  const saved = await source(), draft = await source(false);
  const start = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(), message: `fixture:estimate-decision:${JSON.stringify({ request: {
      operation: "decision", estimateRef: saved.id, outcome: "accepted", decisionDate: new Date().toISOString().slice(0, 10),
      channel: "phone", note: null, reason: null,
    } })}`,
  } });
  const frames = (await start.text()).split("\n\n").filter(frame => frame.startsWith("data: ")).map(frame => JSON.parse(frame.slice(6)));
  const threadId = frames.find(frame => frame.type === "turn.accepted").threadId;
  expect(frames.some(frame => frame.type === "estimates.decision")).toBe(true);
  const action = await propose(input(saved.id, "duplicate"), owner, { threadId });
  const replacement = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", threadId, clientTurnId: randomUUID(),
    message: `fixture:estimate-sharing:${JSON.stringify({ request: { operation: "publish", estimateRef: draft.id } })}`,
  } });
  expect(await replacement.text()).toContain('"type":"estimates.sharing"');
  expect((await db("chatEstimateDraftActions").where({ id: action.ticket.id }).first()).state).toBe("superseded");
  expect((await operate(action.ticket)).status()).toBe(409);
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toEqual([]);
});
test("same-role membership replacement during proposal streaming withholds later text and compact ticket", async () => {
  const saved = await source();
  const response = field.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(),
    message: `fixture:estimate-draft-action-slow:${JSON.stringify({ request: input(saved.id, "duplicate") })}`,
  } });
  await expect.poll(async () => !!await db("chatEstimateDraftActions as p").join("chatTurns as t", "t.id", "p.turnId")
    .where({ "p.workspaceId": workspaceId, "p.userId": fieldId, "t.state": "running" }).first("p.id")).toBe(true);
  const membership = await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).first();
  await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).delete();
  await db("workspaceMemberships").insert(membership);
  const text = await (await response).text();
  expect(text).not.toContain("Draft action fixture complete.");
  expect(text).not.toContain('"type":"estimates.draft_action"');
  expect(text).toContain('"code":"access_denied"');
});
