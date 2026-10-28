import { randomUUID } from "node:crypto";
import { expect, request as requests, test, type APIRequestContext, type Page } from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import { chatStreamEventSchema, estimateShareChatResponseSchema, type EstimateShareChatTicket } from "@salesmora/contracts";
import { estimateSharingBinding, estimateSharingData as c } from "../src/features/assistant/estimate-result/estimate-sharing-client";

test.setTimeout(120000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") ||
    !["127.0.0.1", "localhost"].includes(new URL(connection).hostname) || connection === process.env.DATABASE_URL) {
  throw new Error("Use the isolated local test database.");
}
const db = createDatabase(connection), origin = "http://127.0.0.1:3002", headers = { Origin: origin };
const prefix = randomUUID();
let owner: APIRequestContext, field: APIRequestContext, other: APIRequestContext;
let workspaceId: string, ownerId: string, fieldId: string, otherId: string;
test.beforeAll(async () => {
  await db("rateLimits").where("key", "like", "%/sign-up/email%").delete();
  const ids = [];
  for (const role of ["owner", "field", "other"]) {
    const client = await requests.newContext({ baseURL: origin }), email = `${prefix}-${role}@example.test`;
    expect((await client.post("/api/auth/sign-up/email", {
      headers, data: { name: `Sharing ${role}`, email, password: "Fictional-sharing-assistant-42!", termsAccepted: true },
    })).status()).toBe(200);
    ids.push((await db("users").where({ email }).first("id")).id);
    if (role === "owner") owner = client; else if (role === "field") field = client; else other = client;
  }
  [ownerId, fieldId, otherId] = ids;
  const workspace = await owner.post("/api/workspaces", { headers, data: {
    business: { businessName: "Assistant Sharing Fixture", businessType: "plumbing" },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" }, team: { invitations: [] },
  } });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json()).workspaceId;
  await db("workspaceMemberships").insert({ workspaceId, userId: fieldId, role: "field" });
  const settings = await (await owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
  expect((await owner.put("/api/settings/estimates", { headers, data: {
    workspaceId, expectedVersion: settings.record.version,
    profile: { ...settings.record.profile, name: "Assistant Sharing Fixture", address: "1 Fixture Avenue",
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
async function draft(paymentLink = "", parent?: { type: "lead"; id: string }) {
  const parentId = parent?.id ?? randomUUID();
  if (!parent) await db("jobs").insert({ id: parentId, workspaceId, title: "Sharing assistant job", customerName: "Customer fixture",
    service: "Plumbing", location: "", description: "PRIVATE_JOB_NOTE", primaryOwnerId: fieldId, createdBy: ownerId });
  const until = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const response = await owner.post("/api/estimates", { headers, data: {
    workspaceId, submissionId: randomUUID(), parentType: parent?.type ?? "job", parentId,
    values: {
      details: { name: "Assistant sharing fixture", recipientName: "Customer fixture", recipientEmail: "customer@example.test", serviceAddress: "2 Fixture Avenue", ownerId },
      items: [{ description: "Repair", quantity: "1", unitPrice: "100.00", taxable: false, included: false }],
      totals: { discount: { type: "none" }, taxRate: "0" },
      terms: { message: "Customer message", validUntil: until, paymentTerms: "Due on completion.", termsNote: "Customer terms.", deposit: { type: "none" } },
      scope: "Customer scope", internalNotes: "PRIVATE_ESTIMATE_NOTE", paymentLink,
    },
  } });
  expect(response.status()).toBe(201);
  return { ...(await response.json()), parentId };
}
async function propose(mode: "send" | "publish" | "resend", id: string, client = owner, extra = {}) {
  const response = await client.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(),
    message: `fixture:estimate-sharing:${JSON.stringify({ request: { operation: mode, estimateRef: id } })}`, ...extra,
  } });
  expect(response.status()).toBe(200);
  const text = await response.text();
  const events = text.split("\n\n").filter(frame => frame.startsWith("data: "))
    .map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(6))));
  const sharing = events.find(event => event.type === "estimates.sharing");
  if (sharing?.type !== "estimates.sharing") throw new Error(`Missing sharing ticket: ${text}`);
  const accepted = events.find(event => event.type === "turn.accepted");
  if (accepted?.type !== "turn.accepted") throw new Error("Missing accepted turn.");
  return { ticket: sharing.result, threadId: accepted.threadId, text };
}
const data = (ticket: EstimateShareChatTicket, decision = "confirm") =>
  ({ workspaceId, request: estimateSharingBinding(ticket), decision, paymentLinkReviewed: false });
async function decide(ticket: EstimateShareChatTicket, decision = "confirm", client = owner, extra = {}) {
  return client.post("/api/chat/estimates/sharing", { headers, data: { ...data(ticket, decision), ...extra } });
}
async function show(page: Page, mode: "send" | "publish" | "resend", id: string, client = owner) {
  await page.context().addCookies((await client.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("textbox", { name: "Ask the SalesMora assistant" }).fill(
    `fixture:estimate-sharing:${JSON.stringify({ request: { operation: mode, estimateRef: id } })}`,
  );
  await page.getByRole("button", { name: "Ask assistant", exact: true }).click();
}
test("proposal, checked GET, history, cancel and natural-language yes never share customer paper", async () => {
  const saved = await draft("https://payments.example.test/PRIVATE_PAYMENT_URL");
  const run = await propose("send", saved.id);
  expect(run.text).not.toContain("customer@example.test");
  expect(run.text).not.toContain("PRIVATE_PAYMENT_URL");
  expect(run.text).not.toContain("PRIVATE_ESTIMATE_NOTE");
  const query = new URLSearchParams({ workspace: workspaceId });
  for (const [key, value] of Object.entries(estimateSharingBinding(run.ticket))) query.set(key, String(value));
  const review = await owner.get(`/api/chat/estimates/sharing?${query}`);
  expect(review.status()).toBe(200);
  expect(estimateShareChatResponseSchema.parse(await review.json()).view.review.recipientEmail).toBe("customer@example.test");
  const history = await (await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${run.threadId}`)).json();
  expect(history.turns[0].estimateSharing).toEqual(run.ticket);
  expect(JSON.stringify(history)).not.toContain("PRIVATE_PAYMENT_URL");
  const yes = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", threadId: run.threadId, clientTurnId: randomUUID(), message: "yes",
  } });
  expect(yes.status()).toBe(200);
  expect(await db("estimate_deliveries").where({ estimateId: saved.id })).toEqual([]);
  expect(await db("estimate_snapshots").where({ estimateId: saved.id })).toEqual([]);
  expect((await decide(run.ticket, "cancel")).status()).toBe(200);
  expect((await decide(run.ticket, "cancel")).status()).toBe(200);
  expect((await decide(run.ticket)).status()).toBe(409);
});
test("concurrent explicit Send confirms once and reload restores its queued receipt without exposing tokens", async () => {
  const saved = await draft();
  const run = await propose("send", saved.id);
  const [first, retry] = await Promise.all([decide(run.ticket), decide(run.ticket)]);
  expect(first.status()).toBe(200); expect(retry.status()).toBe(200);
  const outcome = await first.json();
  expect(outcome).toEqual(await retry.json());
  expect(outcome.view.ticket.state).toBe("confirmed");
  expect((await db("estimate_deliveries").where({ estimateId: saved.id }))).toHaveLength(1);
  expect((await db("estimate_deliveries").where({ estimateId: saved.id }).first()).status).toBe("queued");
  expect(JSON.stringify(outcome)).not.toContain("tokenCiphertext");
  const history = await (await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${run.threadId}`)).json();
  expect(history.turns[0].estimateSharing.state).toBe("confirmed");
  expect((await decide(run.ticket, "open")).status()).toBe(200);
});
test("origin, ownership, strict metadata, current permission and version changes fail without email", async () => {
  const saved = await draft(), run = await propose("send", saved.id);
  expect((await decide(run.ticket, "confirm", other)).status()).toBe(404);
  expect((await owner.post("/api/chat/estimates/sharing", { headers: { Origin: "https://foreign.test" }, data: data(run.ticket) })).status()).toBe(403);
  for (const patch of [{ inputHash: "e".repeat(64) }, { expectedVersion: 999 }, { snapshotHash: "f".repeat(64) }]) {
    expect((await decide(run.ticket, "confirm", owner, { request: { ...estimateSharingBinding(run.ticket), ...patch } })).status()).not.toBe(200);
  }
  expect((await decide(run.ticket, "confirm", owner, { recipientEmail: "injected@example.test" })).status()).toBe(422);
  await db("estimates").where({ id: saved.id }).increment("version", 1);
  expect((await decide(run.ticket)).status()).toBe(409);
  expect(await db("estimate_deliveries").where({ estimateId: saved.id })).toEqual([]);
});
test("live Send review survives reload and explicit confirmation opens the checked saved estimate", async ({ page }) => {
  const saved = await draft();
  await show(page, "send", saved.id);
  await expect(page.getByRole("button", { name: "Confirm and send", exact: true })).toBeEnabled();
  expect(await db("estimate_deliveries").where({ estimateId: saved.id })).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("button", { name: "Confirm and send", exact: true }).click();
  await expect(page.getByText(c.queued, { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("button", { name: c.open, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/estimates/${saved.id}\\?workspace=${workspaceId}`));
  expect((await db("estimate_deliveries").where({ estimateId: saved.id }))).toHaveLength(1);
});
test("Publish uses the shared explicit review; opening and closing it sends nothing", async ({ page }) => {
  const saved = await draft();
  await show(page, "publish", saved.id);
  await page.getByRole("button", { name: c.review["estimate.publish"], exact: true }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByText("customer@example.test", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Confirm and publish", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("textbox", { name: "Ask the SalesMora assistant", exact: true })).toBeVisible();
  await page.getByRole("button", { name: c.review["estimate.publish"], exact: true }).click();
  expect(await db("estimate_share_tokens").where({ estimateId: saved.id })).toEqual([]);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect((await db("estimates").where({ id: saved.id }).first()).status).toBe("draft");
  await page.getByRole("button", { name: c.review["estimate.publish"], exact: true }).click();
  await dialog.getByRole("button", { name: "Confirm and publish", exact: true }).click();
  await expect(page.getByText(c.published, { exact: true })).toBeVisible();
  expect(await db("estimate_deliveries").where({ estimateId: saved.id })).toEqual([]);
  expect((await db("estimate_share_tokens").where({ estimateId: saved.id }))).toHaveLength(1);
});
test("revision Send uses the replacement/payment-link review instead of the ordinary Send card", async ({ page }) => {
  const saved = await draft("https://payments.example.test/review-me");
  const initial = await propose("publish", saved.id);
  const publication = await decide(initial.ticket);
  expect(publication.status()).toBe(200);
  const receipt = estimateShareChatResponseSchema.parse(await publication.json()).view.receipt!;
  const revision = await owner.post(`/api/estimates/${saved.id}/revise?workspace=${workspaceId}`, { headers, data: {
    workspaceId, estimateId: saved.id, expectedVersion: receipt.version, snapshotHash: receipt.snapshotHash, submissionId: randomUUID(),
  } });
  expect(revision.status()).toBe(201);
  const revised = await revision.json();
  await show(page, "send", revised.id);
  await expect(page.getByRole("button", { name: "Confirm and send", exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: c.review["estimate.send"], exact: true }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByRole("button", { name: "Confirm and send", exact: true })).toBeDisabled();
  expect(await db("estimate_deliveries").where({ estimateId: revised.id })).toEqual([]);
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Confirm and send", exact: true }).click();
  await expect(page.getByText(c.queued, { exact: true })).toBeVisible();
  expect((await db("estimates").where({ id: saved.id }).first()).status).toBe("superseded");
  expect((await db("estimate_deliveries").where({ estimateId: revised.id }))).toHaveLength(1);
});
test("Resend recipient changes require a refreshed proposal then a second explicit confirmation", async ({ page }) => {
  const saved = await draft();
  const initial = await propose("send", saved.id);
  expect((await decide(initial.ticket)).status()).toBe(200);
  await db("estimate_deliveries").where({ estimateId: saved.id }).update({ status: "sent", sentAt: new Date(), attemptCount: 1 });
  const snapshot = await db("estimate_snapshots").where({ estimateId: saved.id }).first();
  await show(page, "resend", saved.id);
  await page.getByRole("button", { name: c.review["estimate.resend"], exact: true }).click();
  const dialog = page.getByRole("alertdialog");
  await dialog.getByRole("textbox", { name: "Delivery email", exact: true }).fill("changed@example.test");
  await dialog.getByRole("button", { name: "Review updated recipient", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Confirm resend", exact: true })).toBeEnabled();
  expect((await db("estimate_deliveries").where({ estimateId: saved.id }))).toHaveLength(1);
  await dialog.getByRole("button", { name: "Confirm resend", exact: true }).click();
  await expect(page.getByText(c.queued, { exact: true })).toBeVisible();
  expect((await db("estimate_deliveries").where({ estimateId: saved.id, status: "queued" }).first()).recipient).toBe("changed@example.test");
  expect(await db("estimate_snapshots").where({ estimateId: saved.id }).first()).toEqual(snapshot);
});
test("current Field assignment loss hides private review and blocks confirmation", async ({ page }) => {
  const saved = await draft();
  await show(page, "publish", saved.id, field);
  await page.getByRole("button", { name: c.review["estimate.publish"], exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await db("jobs").where({ id: saved.parentId }).update({ primaryOwnerId: ownerId }).increment("version", 1);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("alertdialog")).not.toBeVisible();
  await expect(page.getByText("customer@example.test", { exact: true })).not.toBeVisible();
  expect(await db("estimate_deliveries").where({ estimateId: saved.id })).toEqual([]);
  expect((await db("estimates").where({ id: saved.id }).first()).status).toBe("draft");
});
test("Lead Send preserves the separate existing stage review and never moves the Lead automatically", async ({ page }) => {
  const leadId = randomUUID();
  await db("leads").insert({
    id: leadId, workspaceId, createdBy: ownerId, submissionId: randomUUID(), submissionHash: leadId,
    name: "Sharing Lead fixture", email: "", phone: "", service: "Repairs", address: "", details: "", notes: "",
    source: "website", stage: "contacted", ownerId,
  });
  const saved = await draft("", { type: "lead", id: leadId });
  await show(page, "send", saved.id);
  await page.getByRole("button", { name: "Confirm and send", exact: true }).click();
  await expect(page.getByText(c.queued, { exact: true })).toBeVisible();
  expect((await db("leads").where({ id: leadId }).first()).stage).toBe("contacted");
  await page.getByRole("button", { name: "Review move to Estimate sent", exact: true }).click();
  const dialog = page.getByRole("alertdialog", { name: "Move this lead?", exact: true });
  await expect(dialog).toBeVisible();
  expect((await db("leads").where({ id: leadId }).first()).stage).toBe("contacted");
  await dialog.getByRole("button", { name: "Confirm move", exact: true }).click();
  await expect(page.getByText("Lead stage updated. The estimate is unchanged.", { exact: true })).toBeVisible();
  expect((await db("leads").where({ id: leadId }).first()).stage).toBe("estimate-sent");
  expect((await db("estimate_deliveries").where({ estimateId: saved.id }))).toHaveLength(1);
});
