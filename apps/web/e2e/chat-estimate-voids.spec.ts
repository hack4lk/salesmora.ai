import { randomUUID } from "node:crypto";
import { expect, request as requests, test, type APIRequestContext, type Page } from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import { chatStreamEventSchema, estimateVoidChatResponseSchema, type EstimateVoidChatTicket } from "@salesmora/contracts";
import { estimateProposalDigest } from "../../../packages/data/src/estimates/chat-proposals";
import { down as rollbackEvidence } from "../../../packages/data/src/migrations/202610270006_estimate_void_evidence";
import { estimateVoidBinding } from "../src/features/assistant/estimate-result/estimate-void-client";
import { estimateVoidCardData as c } from "../src/features/estimates/estimate-void-card/estimate-void-card.data";

test.setTimeout(120000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") ||
    !["127.0.0.1", "localhost"].includes(new URL(connection).hostname) || connection === process.env.DATABASE_URL) {
  throw new Error("Use the isolated local test database.");
}
const db = createDatabase(connection), origin = "http://127.0.0.1:3002", headers = { Origin: origin }, prefix = randomUUID();
let owner: APIRequestContext, office: APIRequestContext, other: APIRequestContext;
let workspaceId: string, ownerId: string, officeId: string, otherId: string;
const reason = "PRIVATE_WITHDRAWAL_REASON: The scope was sent in error.";
test.beforeAll(async () => {
  await db("rateLimits").where("key", "like", "%/sign-up/email%").delete();
  const ids = [];
  for (const role of ["owner", "office", "other"]) {
    const client = await requests.newContext({ baseURL: origin }), email = `${prefix}-${role}@example.test`;
    expect((await client.post("/api/auth/sign-up/email", { headers, data: {
      name: `Void ${role}`, email, password: "Fictional-void-assistant-42!", termsAccepted: true,
    } })).status()).toBe(200);
    ids.push((await db("users").where({ email }).first("id")).id);
    if (role === "owner") owner = client; else if (role === "office") office = client; else other = client;
  }
  [ownerId, officeId, otherId] = ids;
  const workspace = await owner.post("/api/workspaces", { headers, data: {
    business: { businessName: "Assistant Void Fixture", businessType: "plumbing" },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" }, team: { invitations: [] },
  } });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json()).workspaceId;
  await db("workspaceMemberships").insert({ workspaceId, userId: officeId, role: "office" });
  const settings = await (await owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
  expect((await owner.put("/api/settings/estimates", { headers, data: {
    workspaceId, expectedVersion: settings.record.version,
    profile: { ...settings.record.profile, name: "Assistant Void Fixture", address: "1 Fixture Avenue",
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
  if (ownerId) await db("users").whereIn("id", [ownerId, officeId, otherId]).delete();
  await Promise.all([owner, office, other].filter(Boolean).map(client => client.dispose()));
  await db.destroy();
});
async function source(mode: "publish" | "send" | "draft" = "publish") {
  const parentId = randomUUID();
  await db("jobs").insert({
    id: parentId, workspaceId, title: "Void job", customerName: "Private frozen recipient",
    service: "Plumbing", location: "", description: "PRIVATE_JOB_NOTE", primaryOwnerId: officeId, createdBy: ownerId,
  });
  const response = await owner.post("/api/estimates", { headers, data: {
    workspaceId, submissionId: randomUUID(), parentType: "job", parentId,
    values: {
      details: { name: "Withdrawal fixture", recipientName: "Private frozen recipient", recipientEmail: "customer@example.test",
        serviceAddress: "2 Fixture Avenue", ownerId: officeId },
      items: [{ description: "Saved repair", quantity: "1", unitPrice: "100.00", taxable: false, included: false }],
      totals: { discount: { type: "none" }, taxRate: "0" },
      terms: { message: "PRIVATE_CUSTOMER_MESSAGE", validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        paymentTerms: "Due on completion.", termsNote: "Customer terms.", deposit: { type: "none" } },
      scope: "PRIVATE_SCOPE", internalNotes: "PRIVATE_ESTIMATE_NOTES", paymentLink: "https://payments.example.test/PRIVATE_PAYMENT_URL",
    },
  } });
  expect(response.status()).toBe(201);
  const saved = await response.json();
  if (mode !== "draft") {
    const review = await (await owner.get(`/api/estimates/${saved.id}/sharing?workspace=${workspaceId}`)).json();
    expect((await owner.post(`/api/estimates/${saved.id}/sharing?workspace=${workspaceId}`, { headers, data: {
      workspaceId, estimateId: saved.id, expectedVersion: saved.version, snapshotHash: review.snapshotHash,
      submissionId: randomUUID(), mode,
      ...(mode === "send" ? { recipientEmail: "customer@example.test", subject: review.subject } : {}),
    } })).status()).toBe(200);
  }
  return { ...saved, parentId };
}
const input = (estimateRef: string | null, suppliedReason: string | null = reason) => ({ operation: "void", estimateRef, reason: suppliedReason });
const message = (request: ReturnType<typeof input>, slow = false) => `fixture:estimate-void${slow ? "-slow" : ""}:${JSON.stringify({ request })}`;
async function propose(request: ReturnType<typeof input>, client = owner, extra = {}) {
  const response = await client.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(), message: message(request), ...extra,
  } });
  expect(response.status()).toBe(200);
  const text = await response.text(), events = text.split("\n\n").filter(frame => frame.startsWith("data: "))
    .map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(6))));
  const card = events.find(event => event.type === "estimates.void"), accepted = events.find(event => event.type === "turn.accepted");
  if (card?.type !== "estimates.void" || accepted?.type !== "turn.accepted") throw new Error(`Missing withdrawal ticket: ${text}`);
  return { ticket: card.result, threadId: accepted.threadId, turnId: accepted.turnId, text };
}
const data = (ticket: EstimateVoidChatTicket, decision = "confirm") => ({ workspaceId, request: estimateVoidBinding(ticket), decision });
const operate = (ticket: EstimateVoidChatTicket, decision = "confirm", client = owner) =>
  client.post("/api/chat/estimates/voids", { headers, data: data(ticket, decision) });
async function review(ticket: EstimateVoidChatTicket, client = owner) {
  const query = new URLSearchParams({ workspace: workspaceId });
  for (const [key, value] of Object.entries(estimateVoidBinding(ticket))) query.set(key, String(value));
  return client.get(`/api/chat/estimates/voids?${query}`);
}
async function show(page: Page, request: ReturnType<typeof input>, client = owner) {
  await page.context().addCookies((await client.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("textbox", { name: "Ask the SalesMora assistant" }).fill(message(request));
  await page.getByRole("button", { name: "Ask assistant", exact: true }).click();
}
const history = async (threadId: string, client = owner) =>
  (await client.get(`/api/chat/threads?workspace=${workspaceId}&thread=${threadId}`)).json();
const followup = (threadId: string, client = owner, slow = false) => client.post("/api/chat/turns", { headers, data: {
  workspaceId, surfaceKey: "home", threadId, clientTurnId: randomUUID(), message: `fixture:estimate-void-history${slow ? "-slow" : ""}`,
} });
async function business() {
  const snapshot: Record<string, unknown> = {};
  for (const table of ["estimates", "estimate_items", "estimate_snapshots", "estimate_activity", "estimate_share_tokens",
    "estimate_deliveries", "estimate_operation_receipts", "jobs", "leads", "estimateNotifications"]) {
    snapshot[table] = await db(table).where({ workspaceId }).orderBy(table === "estimate_operation_receipts" ? "submissionId" : "id");
  }
  return snapshot;
}
async function replaceMembership() {
  const membership = await db("workspaceMemberships").where({ workspaceId, userId: officeId }).first();
  await db("workspaceMemberships").where({ workspaceId, userId: officeId }).delete();
  await db("workspaceMemberships").insert(membership);
}
async function expire(ticket: EstimateVoidChatTicket) {
  const row = await db("chatEstimateVoids").where({ id: ticket.id }).first(), payload = row.payload, expires = Date.now() - 1;
  payload.ticket.createdAt = new Date(expires - 900000).toISOString(); payload.ticket.expiresAt = new Date(expires).toISOString();
  const immutable = Object.fromEntries(Object.entries(payload.ticket).filter(([key]) => !["state", "inputHash"].includes(key)));
  payload.ticket.inputHash = estimateProposalDigest({ ticket: immutable, review: payload.review, canConfirm: payload.canConfirm, stamp: payload.stamp });
  await db("chatEstimateVoids").where({ id: ticket.id }).update({ payload: JSON.stringify(payload) });
}
test("preparation, natural-language yes, cancellation and restored compact tickets never withdraw", async () => {
  const saved = await source(), before = await business(), run = await propose(input(saved.id));
  expect(await business()).toEqual(before);
  for (const field of ["reason", "recipientName", "recipientEmail", "totalCents", "receipt", "href", "review"]) {
    expect(JSON.stringify(run.ticket)).not.toContain(`"${field}"`);
  }
  for (const text of [reason, "PRIVATE_ESTIMATE_NOTES", "PRIVATE_PAYMENT_URL", "Private frozen recipient"]) expect(run.text).not.toContain(text);
  const yes = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId, threadId: run.threadId, surfaceKey: "home", clientTurnId: randomUUID(), message: "yes",
  } });
  expect(await yes.text()).not.toContain('"type":"estimates.void"');
  expect((await history(run.threadId)).turns.find((turn: { id: string }) => turn.id === run.turnId).estimateVoid).toEqual(run.ticket);
  const checked = estimateVoidChatResponseSchema.parse(await (await review(run.ticket)).json());
  expect(checked.view.review.reason).toBe(reason);
  expect((await operate(run.ticket, "cancel")).status()).toBe(200);
  expect((await operate(run.ticket, "cancel")).status()).toBe(200);
  expect((await history(run.threadId)).turns.find((turn: { id: string }) => turn.id === run.turnId).estimateVoid.state).toBe("cancelled");
  expect(await business()).toEqual(before);
});
test("missing reason stays read-only and unconfirmable in the real assistant", async ({ page }) => {
  const saved = await source(), before = await business();
  await show(page, input(saved.id, null));
  await expect(page.getByText(c.missingReason, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: c.confirm, exact: true })).toBeDisabled();
  const row = await db("chatEstimateVoids").where({ workspaceId }).orderBy("createdAt", "desc").first();
  expect((await operate(row.payload.ticket)).status()).toBe(422);
  await page.getByRole("button", { name: c.cancel, exact: true }).click();
  await expect(page.getByText(c.cancelled, { exact: true })).toBeVisible();
  expect(await business()).toEqual(before);
});
test("browser confirms Published withdrawal using metadata only, restores receipt and opens only explicitly", async ({ page }) => {
  const saved = await source();
  await show(page, input(saved.id));
  await expect(page.getByText(reason, { exact: true })).toBeVisible();
  const commands: unknown[] = [];
  page.on("request", request => {
    if (request.method() === "POST" && request.url().includes("/api/chat/estimates/voids")) commands.push(request.postDataJSON());
  });
  await page.getByRole("button", { name: c.confirm, exact: true }).dblclick();
  await expect(page.getByText(c.confirmed, { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/home\?/);
  expect(commands).toHaveLength(1);
  expect(JSON.stringify(commands)).not.toContain(reason);
  const row = await db("chatEstimateVoids").where({ workspaceId }).orderBy("createdAt", "desc").first();
  expect(commands[0]).toEqual(data(row.payload.ticket));
  expect((await db("estimates").where({ id: saved.id }).first()).status).toBe("void");
  await page.reload();
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await expect(page.getByText(c.confirmed, { exact: true })).toBeVisible();
  await expect(page.getByText(reason, { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: c.open, exact: true }).click();
  await page.waitForURL(`**/estimates/${saved.id}?workspace=${workspaceId}`);
});
test("Sent confirmation revokes customer links, stops queued delivery and preserves paper, history, Job and payment", async () => {
  const saved = await source("send"), frozen = await db("estimate_snapshots").where({ estimateId: saved.id }).first();
  const link = (await (await owner.get(`/api/estimates/${saved.id}/sharing/link?workspace=${workspaceId}`)).json()).path;
  const jobs = await db("jobs").where({ workspaceId }).orderBy("id"), notifications = await db("estimateNotifications").where({ workspaceId }).orderBy("id");
  const run = await propose(input(saved.id)), result = estimateVoidChatResponseSchema.parse(await (await operate(run.ticket)).json());
  expect(result.view.receipt).toMatchObject({ estimateId: saved.id, version: run.ticket.estimate.version + 1, status: "void" });
  const row = await db("estimates").where({ id: saved.id }).first();
  expect(row).toMatchObject({ status: "void", archivedAt: null, voidReason: reason, paymentLink: "https://payments.example.test/PRIVATE_PAYMENT_URL" });
  expect(await db("estimate_snapshots").where({ estimateId: saved.id }).first()).toEqual(frozen);
  expect(await db("jobs").where({ workspaceId }).orderBy("id")).toEqual(jobs);
  expect(await db("estimateNotifications").where({ workspaceId }).orderBy("id")).toEqual(notifications);
  expect(await db("estimate_deliveries").where({ estimateId: saved.id })).toMatchObject([{ status: "failed", failureCode: "inactive", attemptCount: 0 }]);
  expect(await db("estimate_share_tokens").where({ estimateId: saved.id }).whereNull("revokedAt")).toEqual([]);
  const publicPage = await other.get(link);
  expect(await publicPage.text()).toContain("withdrawn"); expect(await publicPage.text()).not.toContain(reason);
  const lifecycle = await (await owner.get(`/api/estimates/${saved.id}/lifecycle?workspace=${workspaceId}`)).json();
  expect(lifecycle.events.filter((event: { kind: string }) => event.kind === "voided")).toMatchObject([{ source: { type: "chat" } }]);
  expect(await db("estimate_activity").where({ estimateId: saved.id, type: "voided" })).toMatchObject([{ source: "assistant-confirmed" }]);
});
test("HTTP operations require owned completed proposal, exact bindings, same origin and metadata-only requests", async () => {
  const saved = await source(), run = await propose(input(saved.id));
  expect((await review(run.ticket, other)).status()).toBe(404);
  expect((await operate(run.ticket, "confirm", other)).status()).toBe(404);
  for (const requestHeaders of [undefined, { Origin: "https://other.example.test" }]) {
    expect((await owner.post("/api/chat/estimates/voids", { headers: requestHeaders, data: data(run.ticket) })).status()).toBe(403);
  }
  for (const change of [{ reason: "Changed" }, { decision: "yes" }, { request: { ...data(run.ticket).request, reason: "Changed" } },
    ...["inputHash", "reviewHash", "snapshotHash", "authorizationVersion"].map(field => ({ request: { ...data(run.ticket).request, [field]: "f".repeat(64) } })),
    { request: { ...data(run.ticket).request, expectedVersion: 999 } }]) {
    expect((await owner.post("/api/chat/estimates/voids", { headers, data: { ...data(run.ticket), ...change } })).status()).not.toBe(200);
  }
  await db("chatTurns").where({ id: run.turnId }).update({ state: "running" });
  expect((await review(run.ticket)).status()).toBe(409); expect((await operate(run.ticket)).status()).toBe(409);
  await db("chatTurns").where({ id: run.turnId }).update({ state: "completed" });
  expect((await operate(run.ticket, "cancel")).status()).toBe(200);
});
test("concurrent confirmation and lost-response retry produce one withdrawal, exact receipt and audit", async () => {
  const saved = await source(), run = await propose(input(saved.id));
  const responses = await Promise.all([operate(run.ticket), operate(run.ticket)]);
  expect(responses.map(response => response.status())).toEqual([200, 200]);
  const receipt = estimateVoidChatResponseSchema.parse(await responses[0].json()).view.receipt;
  expect(estimateVoidChatResponseSchema.parse(await responses[1].json()).view.receipt).toEqual(receipt);
  expect(estimateVoidChatResponseSchema.parse(await (await operate(run.ticket)).json()).view.receipt).toEqual(receipt);
  expect(await db("chatEstimateVoidAudit").where({ proposalId: run.ticket.id }).pluck("action")).toEqual(["proposed", "confirmed"]);
  expect(await db("estimate_activity").where({ estimateId: saved.id, type: "voided" })).toHaveLength(1);
  expect(await db("estimate_operation_receipts").where({ submissionId: run.ticket.id })).toHaveLength(1);
});
test("stale parent changes redact the browser review on focus and prevent confirmation", async ({ page }) => {
  const saved = await source();
  await show(page, input(saved.id), office); await expect(page.getByText(reason, { exact: true })).toBeVisible();
  const row = await db("chatEstimateVoids").where({ workspaceId, userId: officeId }).orderBy("createdAt", "desc").first();
  await db("jobs").where({ id: saved.parentId }).update({ title: "Changed parent" }).increment("version", 1);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText(reason, { exact: true })).not.toBeVisible();
  await expect(page.getByRole("button", { name: c.confirm, exact: true })).not.toBeVisible();
  expect((await operate(row.payload.ticket, "confirm", office)).status()).toBe(409);
});
test("current role loss invalidates pending review; same-role membership replacement invalidates saved outcomes", async () => {
  const saved = await source(), run = await propose(input(saved.id), office);
  await db("workspaceMemberships").where({ workspaceId, userId: officeId }).update({ role: "field" });
  expect((await review(run.ticket, office)).status()).toBe(404);
  expect((await operate(run.ticket, "confirm", office)).status()).toBe(404);
  await db("workspaceMemberships").where({ workspaceId, userId: officeId }).update({ role: "office" });
  const next = await propose(input(saved.id), office);
  expect((await operate(next.ticket, "confirm", office)).status()).toBe(200);
  await replaceMembership();
  for (const decision of ["confirm", "open"]) expect((await operate(next.ticket, decision, office)).status()).toBe(404);
  expect((await history(next.threadId, office)).turns[0].estimateVoid).toBeUndefined();
});
test("later archive withholds saved receipt restoration and opening without another withdrawal", async () => {
  const saved = await source(), run = await propose(input(saved.id));
  expect((await operate(run.ticket)).status()).toBe(200);
  await db("estimates").where({ id: saved.id }).update({ archivedAt: new Date() }).increment("version", 1);
  expect((await review(run.ticket)).status()).toBe(409);
  expect((await operate(run.ticket, "open")).status()).toBe(409);
  expect((await history(run.threadId)).turns[0].estimateVoid).toBeUndefined();
  expect(await db("estimate_activity").where({ estimateId: saved.id, type: "voided" })).toHaveLength(1);
});
test("confirmed follow-ups retain flattened checked provenance and migration refuses retained evidence", async () => {
  const saved = await source(), run = await propose(input(saved.id), office);
  expect((await operate(run.ticket, "confirm", office)).status()).toBe(200);
  for (let count = 0; count < 2; count++) {
    expect(await (await followup(run.threadId, office)).text()).toContain("Verified confirmed withdrawal.");
  }
  const turns = await db("chatTurns").where({ threadId: run.threadId }).whereNot({ id: run.turnId });
  expect(turns).toHaveLength(2);
  for (const turn of turns) expect(turn.estimateVoidEvidence).toEqual([run.turnId]);
  const restored = await history(run.threadId, office);
  expect(JSON.stringify(restored.turns)).not.toContain(reason);
  expect(JSON.stringify(restored.turns)).not.toContain("Private frozen recipient");
  await expect(rollbackEvidence(db)).rejects.toThrow("Retained Void evidence");
  await replaceMembership();
  const redacted = await history(run.threadId, office);
  expect(redacted.turns.every((turn: { estimateVoidEvidence: string[] }) => turn.estimateVoidEvidence.length === 0)).toBe(true);
  expect(redacted.messages.filter((entry: { role: string }) => entry.role === "assistant")
    .every((entry: { text: string }) => !entry.text.includes("Verified confirmed withdrawal."))).toBe(true);
});
test("membership revocation during inherited streaming blocks later claims and redacts restored follow-ups", async () => {
  const saved = await source(), run = await propose(input(saved.id), office);
  expect((await operate(run.ticket, "confirm", office)).status()).toBe(200);
  const response = followup(run.threadId, office, true);
  await expect.poll(async () => !!await db("chatTurns").where({ threadId: run.threadId, state: "running" })
    .whereRaw(`jsonb_array_length("estimateVoidEvidence") > 0`).first("id")).toBe(true);
  await replaceMembership();
  expect(await (await response).text()).not.toContain("Verified confirmed withdrawal.");
  expect((await history(run.threadId, office)).turns.every((turn: { estimateVoidEvidence: string[] }) => turn.estimateVoidEvidence.length === 0)).toBe(true);
});
test("pending expiry invalidates inherited streaming and never withdraws the Estimate", async () => {
  const saved = await source(), run = await propose(input(saved.id));
  const response = followup(run.threadId, owner, true);
  await expect.poll(async () => !!await db("chatTurns").where({ threadId: run.threadId, state: "running" })
    .whereRaw(`jsonb_array_length("estimateVoidEvidence") > 0`).first("id")).toBe(true);
  await expire(run.ticket);
  expect(await (await response).text()).not.toContain("No verified confirmed withdrawal.");
  expect((await db("estimates").where({ id: saved.id }).first()).status).toBe("published");
  expect((await history(run.threadId)).turns.every((turn: { estimateVoidEvidence: string[] }) => turn.estimateVoidEvidence.length === 0)).toBe(true);
});
test("same-role membership replacement during initial streaming withholds later text and compact ticket", async () => {
  const saved = await source();
  const response = office.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(), message: message(input(saved.id), true),
  } });
  await expect.poll(async () => !!await db("chatEstimateVoids as p").join("chatTurns as t", "t.id", "p.turnId")
    .where({ "p.workspaceId": workspaceId, "p.userId": officeId, "t.state": "running" }).first("p.id")).toBe(true);
  await replaceMembership();
  const text = await (await response).text();
  expect(text).not.toContain("Withdrawal fixture complete.");
  expect(text).not.toContain('"type":"estimates.void"'); expect(text).toContain('"code":"access_denied"');
});
for (const operation of ["update", "publish", "decision", "duplicate", "void"] as const) {
  test(`${operation} replaces pending Void provenance only on the replacing turn`, async () => {
    const saved = await source(), draft = await source("draft"), run = await propose(input(saved.id));
    const priorAnswer = await followup(run.threadId); expect(priorAnswer.status()).toBe(200);
    const payload = operation === "void" ? input(saved.id, "Replacement reason")
      : operation === "decision" ? { operation, estimateRef: saved.id, outcome: "accepted",
        decisionDate: new Date().toISOString().slice(0, 10), channel: "phone", note: null, reason: null }
        : operation === "update" ? { operation, estimateRef: draft.id, parentType: null, parentRef: null,
          changes: { name: "Replacement Draft", scope: null, message: null, paymentTerms: null, termsNote: null,
            validUntil: null, discount: null, taxRate: null, deposit: null, items: null } }
          : { operation, estimateRef: operation === "publish" ? draft.id : saved.id };
    const fixture = { update: "draft", publish: "sharing", decision: "decision", duplicate: "draft-action", void: "void" }[operation];
    const response = await owner.post("/api/chat/turns", { headers, data: {
      workspaceId, surfaceKey: "home", threadId: run.threadId, clientTurnId: randomUUID(),
      message: `fixture:estimate-${fixture}:${JSON.stringify({ request: payload })}`,
    } });
    const text = await response.text(), type = { update: "draft", publish: "sharing", decision: "decision", duplicate: "draft_action", void: "void" }[operation];
    expect(text).toContain(`"type":"estimates.${type}"`);
    const turns = await db("chatTurns").where({ threadId: run.threadId }).orderBy("createdAt", "desc");
    const replacement = turns.find((turn: { id: string; estimateVoidEvidence: string[] }) => turn.id !== run.turnId && turn.estimateVoidEvidence.length === 0);
    expect(replacement).toBeDefined();
    expect(turns.some((turn: { estimateVoidEvidence: string[] }) => turn.estimateVoidEvidence.includes(run.turnId))).toBe(true);
    expect((await db("chatEstimateVoids").where({ id: run.ticket.id }).first()).state).toBe("superseded");
    expect((await operate(run.ticket)).status()).toBe(409);
    expect((await db("estimates").where({ id: saved.id }).first()).status).toBe("published");
  });
}
test("exact numbers choose latest revision; selected and explicit UUIDs never silently retarget", async () => {
  const saved = await source(), family = await (await owner.get(`/api/estimates/${saved.id}/revisions?workspace=${workspaceId}`)).json();
  expect((await owner.post(`/api/estimates/${saved.id}/revise`, { headers, data: {
    workspaceId, estimateId: saved.id, expectedVersion: family.version, snapshotHash: family.snapshotHash, submissionId: randomUUID(),
  } })).status()).toBe(201);
  const response = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(), message: message(input(saved.number)),
  } });
  expect(await response.text()).not.toContain('"type":"estimates.void"');
  const exact = await propose(input(saved.id)); expect(exact.ticket.estimate.id).toBe(saved.id);
  const selected = await propose(input(null), owner, {
    surfaceKey: "estimate.detail", recordRefs: [{ type: "estimate", id: saved.id }],
  });
  expect(selected.ticket.estimate.id).toBe(saved.id);
});
test("reason changes require a fresh proposal and exact 500-character literal reasons survive unchanged", async () => {
  const saved = await source(), first = await propose(input(saved.id));
  const literal = `<script>literal</script>${"x".repeat(476)}`; expect(literal.length).toBe(500);
  const fresh = await propose(input(saved.id, literal), owner, { threadId: first.threadId });
  expect((await operate(first.ticket)).status()).toBe(409);
  const checked = estimateVoidChatResponseSchema.parse(await (await review(fresh.ticket)).json());
  expect(checked.view.review.reason).toBe(literal);
  expect((await operate(fresh.ticket)).status()).toBe(200);
  expect((await db("estimates").where({ id: saved.id }).first()).voidReason).toBe(literal);
});
test("cancelled proposal follow-ups never claim confirmed withdrawal or mutate business data", async () => {
  const saved = await source(), before = await business(), run = await propose(input(saved.id));
  expect((await operate(run.ticket, "cancel")).status()).toBe(200);
  const response = await followup(run.threadId);
  expect(await response.text()).toContain("No verified confirmed withdrawal.");
  expect(await business()).toEqual(before);
});
