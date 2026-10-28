import { randomUUID } from "node:crypto";
import { expect, request as requests, test, type APIRequestContext, type Page } from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import { estimateProposalDigest } from "../../../packages/data/src/estimates/chat-proposals";
import {
  chatStreamEventSchema, estimateDecisionChatResponseSchema,
  type EstimateDecisionChatInput, type EstimateDecisionChatTicket,
} from "@salesmora/contracts";
import { estimateDecisionBinding, estimateDecisionResultData as c } from "../src/features/assistant/estimate-result/estimate-decision-client";

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
      headers, data: { name: `Decision ${role}`, email, password: "Fictional-decision-assistant-42!", termsAccepted: true },
    })).status()).toBe(200);
    ids.push((await db("users").where({ email }).first("id")).id);
    if (role === "owner") owner = client; else if (role === "field") field = client; else other = client;
  }
  [ownerId, fieldId, otherId] = ids;
  const workspace = await owner.post("/api/workspaces", { headers, data: {
    business: { businessName: "Assistant Decision Fixture", businessType: "plumbing" },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" }, team: { invitations: [] },
  } });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json()).workspaceId;
  await db("workspaceMemberships").insert({ workspaceId, userId: fieldId, role: "field" });
  const settings = await (await owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
  expect((await owner.put("/api/settings/estimates", { headers, data: {
    workspaceId, expectedVersion: settings.record.version,
    profile: { ...settings.record.profile, name: "Assistant Decision Fixture", address: "1 Fixture Avenue",
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
async function shared(parent?: { type: "lead"; id: string }) {
  const parentId = parent?.id ?? randomUUID();
  if (!parent) await db("jobs").insert({
    id: parentId, workspaceId, title: "Decision job", customerName: "Private decision customer",
    service: "Plumbing", location: "", description: "PRIVATE_JOB_NOTE", primaryOwnerId: fieldId, createdBy: ownerId,
  });
  const response = await owner.post("/api/estimates", { headers, data: {
    workspaceId, submissionId: randomUUID(), parentType: parent?.type ?? "job", parentId,
    values: {
      details: { name: "Decision fixture", recipientName: "Private decision customer", recipientEmail: "customer@example.test", serviceAddress: "2 Fixture Avenue", ownerId },
      items: [{ description: "Repair", quantity: "1", unitPrice: "100.00", taxable: false, included: false }],
      totals: { discount: { type: "none" }, taxRate: "0" },
      terms: { message: "Customer message", validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        paymentTerms: "Due on completion.", termsNote: "Customer terms.", deposit: { type: "none" } },
      scope: "Customer scope", internalNotes: "PRIVATE_ESTIMATE_NOTE", paymentLink: "https://payments.example.test/PRIVATE_PAYMENT_URL",
    },
  } });
  expect(response.status()).toBe(201);
  const saved = await response.json();
  const review = await (await owner.get(`/api/estimates/${saved.id}/sharing?workspace=${workspaceId}`)).json();
  expect((await owner.post(`/api/estimates/${saved.id}/sharing?workspace=${workspaceId}`, { headers, data: {
    workspaceId, estimateId: saved.id, expectedVersion: saved.version, snapshotHash: review.snapshotHash,
    submissionId: randomUUID(), mode: "publish",
  } })).status()).toBe(200);
  const decision = await (await owner.get(`/api/estimates/${saved.id}/decision?workspace=${workspaceId}`)).json();
  return { ...saved, parentId, today: decision.today };
}
function input(estimateId: string, today: string, changes: Partial<EstimateDecisionChatInput> = {}): EstimateDecisionChatInput {
  return {
    operation: "decision", estimateRef: estimateId, outcome: "accepted", decisionDate: today, channel: "phone",
    note: "PRIVATE_CHAT_DECISION_NOTE", reason: null, ...changes,
  };
}
async function propose(request: EstimateDecisionChatInput, client = owner, extra = {}) {
  const response = await client.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(),
    message: `fixture:estimate-decision:${JSON.stringify({ request })}`, ...extra,
  } });
  expect(response.status()).toBe(200);
  const text = await response.text();
  const events = text.split("\n\n").filter(frame => frame.startsWith("data: "))
    .map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(6))));
  const card = events.find(event => event.type === "estimates.decision"), accepted = events.find(event => event.type === "turn.accepted");
  if (card?.type !== "estimates.decision" || accepted?.type !== "turn.accepted") throw new Error(`Missing decision ticket: ${text}`);
  return { ticket: card.result, threadId: accepted.threadId, turnId: accepted.turnId, text };
}
const data = (ticket: EstimateDecisionChatTicket, decision = "confirm") =>
  ({ workspaceId, request: estimateDecisionBinding(ticket), decision });
async function decide(ticket: EstimateDecisionChatTicket, decision = "confirm", client = owner, extra = {}) {
  return client.post("/api/chat/estimates/decisions", { headers, data: { ...data(ticket, decision), ...extra } });
}
async function review(ticket: EstimateDecisionChatTicket, client = owner) {
  const query = new URLSearchParams({ workspace: workspaceId });
  for (const [key, value] of Object.entries(estimateDecisionBinding(ticket))) query.set(key, String(value));
  return client.get(`/api/chat/estimates/decisions?${query}`);
}
async function show(page: Page, request: EstimateDecisionChatInput, client = owner) {
  await page.context().addCookies((await client.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("textbox", { name: "Ask the SalesMora assistant" }).fill(
    `fixture:estimate-decision:${JSON.stringify({ request })}`,
  );
  await page.getByRole("button", { name: "Ask assistant", exact: true }).click();
}
test("compact stream/history and natural-language yes never record; private browser review and cancellation are explicit", async () => {
  const saved = await shared(), run = await propose(input(saved.id, saved.today));
  for (const privateText of ["Private decision customer", "PRIVATE_CHAT_DECISION_NOTE", "PRIVATE_ESTIMATE_NOTE", "PRIVATE_PAYMENT_URL", "customer@example.test"]) {
    expect(run.text).not.toContain(privateText);
  }
  const result = await review(run.ticket);
  expect(result.status()).toBe(200); expect(result.headers()["cache-control"]).toContain("no-store");
  expect(estimateDecisionChatResponseSchema.parse(await result.json()).view.value.note).toBe("PRIVATE_CHAT_DECISION_NOTE");
  const history = await (await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${run.threadId}`)).json();
  expect(history.turns[0].estimateDecision).toEqual(run.ticket);
  expect(JSON.stringify(history.turns)).not.toContain("Private decision customer");
  expect(JSON.stringify(history.turns)).not.toContain("PRIVATE_CHAT_DECISION_NOTE");
  const yes = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", threadId: run.threadId, clientTurnId: randomUUID(), message: "yes",
  } });
  expect(yes.status()).toBe(200); await yes.text();
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toEqual([]);
  expect((await decide(run.ticket, "cancel")).status()).toBe(200);
  expect((await db("estimates").where({ id: saved.id }).first()).status).toBe("published");
});
test("explicit concurrent confirmation records one immutable decision and retains a checked restored receipt", async () => {
  const saved = await shared(), run = await propose(input(saved.id, saved.today));
  const before = await db("estimate_snapshots").where({ estimateId: saved.id }).first();
  const jobs = await db("jobs").where({ workspaceId });
  const [first, retry] = await Promise.all([decide(run.ticket), decide(run.ticket)]);
  expect(first.status()).toBe(200); expect(retry.status()).toBe(200);
  expect(await first.json()).toEqual(await retry.json());
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toHaveLength(1);
  expect(await db("estimate_snapshots").where({ estimateId: saved.id }).first()).toEqual(before);
  expect(await db("jobs").where({ workspaceId })).toEqual(jobs);
  expect((await db("estimate_activity").where({ estimateId: saved.id, type: "decision-recorded" }).first()).source).toBe("assistant-confirmed");
  const history = await (await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${run.threadId}`)).json();
  expect(history.turns[0].estimateDecision.state).toBe("confirmed");
  expect((await decide(run.ticket, "open")).status()).toBe(200);
});
test("same-origin strict metadata, ownership, snapshot/version and stale records cannot be bypassed", async () => {
  const saved = await shared(), run = await propose(input(saved.id, saved.today));
  expect((await decide(run.ticket, "confirm", other)).status()).toBe(404);
  expect((await review(run.ticket, other)).status()).toBe(404);
  expect((await owner.post("/api/chat/estimates/decisions", { headers: { Origin: "https://foreign.test" }, data: data(run.ticket) })).status()).toBe(403);
  for (const field of ["note", "reason", "outcome", "expectedDecisionId"]) {
    expect((await decide(run.ticket, "confirm", owner, { [field]: "injected" })).status()).toBe(422);
  }
  for (const patch of [{ inputHash: "e".repeat(64) }, { expectedVersion: 999 }, { snapshotHash: "f".repeat(64) }]) {
    expect((await decide(run.ticket, "confirm", owner, { request: { ...estimateDecisionBinding(run.ticket), ...patch } })).status()).toBe(409);
  }
  await db("estimates").where({ id: saved.id }).increment("version", 1);
  expect((await decide(run.ticket)).status()).toBe(409);
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toEqual([]);
});
test("live Decision card survives reload and records only explicit keyboard confirmation then checked navigation", async ({ page }) => {
  const saved = await shared();
  await show(page, input(saved.id, saved.today));
  await expect(page.getByRole("button", { name: "Confirm decision", exact: true })).toBeEnabled();
  await expect(page.getByText("Private decision customer", { exact: true })).toBeVisible();
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("button", { name: "Confirm decision", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(c.accepted, { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("button", { name: c.open, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/estimates/${saved.id}\\?workspace=${workspaceId}`));
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toHaveLength(1);
});
test("missing initial fields block both card and API confirmation without guesses", async ({ page }) => {
  const saved = await shared();
  await show(page, input(saved.id, saved.today, { outcome: null, decisionDate: null, channel: null }));
  await expect(page.getByRole("button", { name: "Confirm decision", exact: true })).toBeDisabled();
  const row = await db("chatEstimateDecisions").where({ workspaceId }).orderBy("createdAt", "desc").first();
  expect(row.payload.value.outcome).toBe(""); expect(row.payload.value.decisionDate).toBe(""); expect(row.payload.value.channel).toBe("");
  expect((await decide(row.payload.ticket)).status()).toBe(422);
  await page.getByRole("button", { name: "Cancel proposal", exact: true }).click();
  await expect(page.getByText(c.cancelled, { exact: true })).toBeVisible();
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toEqual([]);
});
test("correction card shows Existing versus Proposed, preserves unspecified fields and explicitly clears note", async ({ page }) => {
  const saved = await shared(), first = await propose(input(saved.id, saved.today));
  expect((await decide(first.ticket)).status()).toBe(200);
  await show(page, input(saved.id, saved.today, {
    operation: "correct-decision", outcome: null, decisionDate: null, channel: "email", note: "",
    reason: "PRIVATE_CORRECTION_REASON",
  }));
  await expect(page.getByRole("heading", { name: "Existing decision", exact: true })).toBeVisible();
  await expect(page.getByText("PRIVATE_CHAT_DECISION_NOTE", { exact: true })).toBeVisible();
  await expect(page.getByText("PRIVATE_CORRECTION_REASON", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Confirm correction", exact: true }).click();
  await expect(page.getByText(c.corrected, { exact: true })).toBeVisible();
  const entries = await db("estimate_decisions").where({ estimateId: saved.id }).orderBy("estimateVersion");
  expect(entries).toHaveLength(2); expect(entries[0].note).toBe("PRIVATE_CHAT_DECISION_NOTE");
  expect(entries[1].outcome).toBe("accepted"); expect(entries[1].channel).toBe("email"); expect(entries[1].note).toBe("");
  expect(entries[1].reason).toBe("PRIVATE_CORRECTION_REASON"); expect(entries[1].previousDecisionId).toBe(entries[0].id);
});
test("current Field assignment loss redacts private decision review and blocks stale confirmation", async ({ page }) => {
  const saved = await shared();
  await show(page, input(saved.id, saved.today), field);
  await expect(page.getByRole("button", { name: "Confirm decision", exact: true })).toBeEnabled();
  const row = await db("chatEstimateDecisions").where({ workspaceId, userId: fieldId }).orderBy("createdAt", "desc").first();
  await db("jobs").where({ id: saved.parentId }).update({ primaryOwnerId: ownerId }).increment("version", 1);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("button", { name: "Confirm decision", exact: true })).not.toBeVisible();
  await expect(page.getByText("Private decision customer", { exact: true })).not.toBeVisible();
  expect((await decide(row.payload.ticket, "confirm", field)).status()).not.toBe(200);
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toEqual([]);
});
test("Declined response offers the existing independent Lost-stage review without automatically moving the Lead", async ({ page }) => {
  const leadId = randomUUID();
  await db("leads").insert({
    id: leadId, workspaceId, createdBy: ownerId, submissionId: randomUUID(), submissionHash: randomUUID(),
    name: "Decision follow-up lead", email: "", phone: "", service: "Plumbing", address: "", details: "", notes: "",
    source: "website", stage: "contacted", ownerId,
  });
  const saved = await shared({ type: "lead", id: leadId });
  await show(page, input(saved.id, saved.today, { outcome: "declined" }));
  await page.getByRole("button", { name: "Confirm decision", exact: true }).click();
  await expect(page.getByText(c.declined, { exact: true })).toBeVisible();
  expect((await db("leads").where({ id: leadId }).first()).stage).toBe("contacted");
  await page.getByRole("button", { name: "Review move to Lost", exact: true }).click();
  const dialog = page.getByRole("alertdialog", { name: "Move this lead?" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  expect((await db("leads").where({ id: leadId }).first()).stage).toBe("contacted");
  await page.getByRole("button", { name: "Review move to Lost", exact: true }).click();
  await dialog.getByRole("button", { name: "Confirm move", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect((await db("leads").where({ id: leadId }).first()).stage).toBe("lost");
});
test("membership replacement invalidates pending and confirmed decision evidence after reload", async () => {
  const saved = await shared(), run = await propose(input(saved.id, saved.today), field);
  expect((await decide(run.ticket, "confirm", field)).status()).toBe(200);
  const membership = await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).first();
  await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).delete();
  await db("workspaceMemberships").insert(membership);
  expect((await review(run.ticket, field)).status()).toBe(404);
  expect((await decide(run.ticket, "confirm", field)).status()).toBe(404);
  const history = await (await field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${run.threadId}`)).json();
  expect(history.turns[0].estimateDecision).toBeUndefined();
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toHaveLength(1);
});
test("follow-up answers inherit checked decision receipt evidence and redact after membership replacement", async () => {
  const saved = await shared(), run = await propose(input(saved.id, saved.today), field);
  expect((await decide(run.ticket, "confirm", field)).status()).toBe(200);
  const followup = await field.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", threadId: run.threadId, clientTurnId: randomUUID(), message: "fixture:estimate-decision-history",
  } });
  expect(followup.status()).toBe(200);
  expect(await followup.text()).toContain("Verified recorded decision receipt.");
  const latest = await db("chatTurns").where({ workspaceId, threadId: run.threadId }).orderBy("createdAt", "desc").first();
  expect(latest.estimateDecisionEvidence).toEqual([run.turnId]);
  const membership = await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).first();
  await db("workspaceMemberships").where({ workspaceId, userId: fieldId }).delete();
  await db("workspaceMemberships").insert(membership);
  const history = await (await field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${run.threadId}`)).json();
  expect(history.messages.filter((message: { role: string }) => message.role === "assistant")
    .every((message: { text: string }) => !message.text.includes("Verified recorded decision receipt."))).toBe(true);
  expect(history.turns.find((turn: { id: string }) => turn.id === latest.id).estimateDecisionEvidence).toEqual([]);
});
test("mid-stream inherited receipt revocation blocks later text and retained answers", async () => {
  const saved = await shared(), run = await propose(input(saved.id, saved.today), field);
  expect((await decide(run.ticket, "confirm", field)).status()).toBe(200);
  const followup = field.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", threadId: run.threadId, clientTurnId: randomUUID(), message: "fixture:estimate-decision-history-slow",
  } });
  await expect.poll(async () => !!await db("chatTurns").where({ workspaceId, threadId: run.threadId, state: "running" })
    .whereRaw(`jsonb_array_length("estimateDecisionEvidence") > 0`).first("id")).toBe(true);
  await db("jobs").where({ id: saved.parentId }).update({ primaryOwnerId: ownerId }).increment("version", 1);
  const response = await followup;
  expect(response.status()).toBe(200);
  expect(await response.text()).not.toContain("Verified recorded decision receipt.");
  const history = await (await field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${run.threadId}`)).json();
  expect(history.messages.filter((message: { role: string }) => message.role === "assistant")
    .every((message: { text: string }) => !message.text.includes("Verified recorded decision receipt."))).toBe(true);
});
test("pending decision expiry invalidates inherited follow-up evidence before later streamed text", async () => {
  const saved = await shared(), run = await propose(input(saved.id, saved.today));
  const followup = owner.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", threadId: run.threadId, clientTurnId: randomUUID(), message: "fixture:estimate-decision-history-slow",
  } });
  await expect.poll(async () => !!await db("chatTurns").where({ workspaceId, threadId: run.threadId, state: "running" })
    .whereRaw(`jsonb_array_length("estimateDecisionEvidence") > 0`).first("id")).toBe(true);
  const row = await db("chatEstimateDecisions").where({ id: run.ticket.id }).first();
  const payload = row.payload;
  const expires = Date.now() - 1;
  payload.ticket.createdAt = new Date(expires - 900000).toISOString();
  payload.ticket.expiresAt = new Date(expires).toISOString();
  const ticket = Object.fromEntries(Object.entries(payload.ticket).filter(([key]) => key !== "state" && key !== "inputHash"));
  payload.ticket.inputHash = estimateProposalDigest({ ticket, review: payload.review, value: payload.value, stamp: payload.stamp });
  await db("chatEstimateDecisions").where({ id: run.ticket.id }).update({ payload: JSON.stringify(payload) });
  const response = await followup;
  expect(response.status()).toBe(200);
  expect(await response.text()).not.toContain("No verified recorded decision receipt.");
  const history = await (await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${run.threadId}`)).json();
  expect(history.turns.find((turn: { id: string }) => turn.id === run.turnId).estimateDecision.state).toBe("expired");
  const latest = await db("chatTurns").where({ workspaceId, threadId: run.threadId }).orderBy("createdAt", "desc").first();
  expect(latest.estimateDecisionEvidence).toEqual([run.turnId]);
  expect(history.turns.find((turn: { id: string }) => turn.id === latest.id).estimateDecisionEvidence).toEqual([]);
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toEqual([]);
});
