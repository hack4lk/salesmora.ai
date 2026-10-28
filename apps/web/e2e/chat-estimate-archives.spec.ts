import { randomUUID } from "node:crypto";
import { expect, request as requests, test, type APIRequestContext, type Page } from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import {
  chatStreamEventSchema, estimateArchiveChatResponseSchema, type EstimateArchiveChatTicket,
} from "@salesmora/contracts";
import { estimateArchiveBinding } from "../src/features/assistant/estimate-result/estimate-archive-client";
import { estimateArchiveCardData as c } from "../src/features/estimates/estimate-archive-card/estimate-archive-card.data";

test.setTimeout(120000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") ||
    !["127.0.0.1", "localhost"].includes(new URL(connection).hostname) || connection === process.env.DATABASE_URL) {
  throw new Error("Use the isolated local test database.");
}
const db = createDatabase(connection), origin = "http://127.0.0.1:3002", headers = { Origin: origin }, prefix = randomUUID();
let owner: APIRequestContext, other: APIRequestContext;
let workspaceId: string, ownerId: string, otherId: string;
test.beforeAll(async () => {
  await db("rateLimits").where("key", "like", "%/sign-up/email%").delete();
  const ids = [];
  for (const role of ["owner", "other"]) {
    const client = await requests.newContext({ baseURL: origin }), email = `${prefix}-${role}@example.test`;
    expect((await client.post("/api/auth/sign-up/email", { headers, data: {
      name: `Archive ${role}`, email, password: "Fictional-archive-assistant-42!", termsAccepted: true,
    } })).status()).toBe(200);
    ids.push((await db("users").where({ email }).first("id")).id);
    if (role === "owner") owner = client; else other = client;
  }
  [ownerId, otherId] = ids;
  const workspace = await owner.post("/api/workspaces", { headers, data: {
    business: { businessName: "Assistant Archive Fixture", businessType: "plumbing" },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" }, team: { invitations: [] },
  } });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json()).workspaceId;
  const settings = await (await owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
  expect((await owner.put("/api/settings/estimates", { headers, data: {
    workspaceId, expectedVersion: settings.record.version,
    profile: { ...settings.record.profile, name: "Assistant Archive Fixture", address: "1 Fixture Avenue",
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
  if (ownerId) await db("users").whereIn("id", [ownerId, otherId]).delete();
  await Promise.all([owner, other].filter(Boolean).map(client => client.dispose()));
  await db.destroy();
});
async function source() {
  const parentId = randomUUID();
  await db("jobs").insert({
    id: parentId, workspaceId, title: "Archive job", customerName: "Private archive customer",
    service: "Plumbing", location: "", description: "PRIVATE_JOB_NOTE", primaryOwnerId: ownerId, createdBy: ownerId,
  });
  const response = await owner.post("/api/estimates", { headers, data: {
    workspaceId, submissionId: randomUUID(), parentType: "job", parentId,
    values: {
      details: { name: "Archive fixture", recipientName: "Private archive customer", recipientEmail: "customer@example.test",
        serviceAddress: "2 Fixture Avenue", ownerId },
      items: [{ description: "Saved repair", quantity: "1", unitPrice: "100.00", taxable: false, included: false }],
      totals: { discount: { type: "none" }, taxRate: "0" },
      terms: { message: "PRIVATE_CUSTOMER_MESSAGE", validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        paymentTerms: "Due on completion.", termsNote: "Customer terms.", deposit: { type: "none" } },
      scope: "PRIVATE_SCOPE", internalNotes: "PRIVATE_ESTIMATE_NOTES", paymentLink: "https://payments.example.test/PRIVATE_PAYMENT_URL",
    },
  } });
  expect(response.status()).toBe(201);
  const saved = await response.json();
  await db("estimates").where({ workspaceId, id: saved.id }).update({ status: "declined" });
  return { ...saved, parentId };
}
const input = (operation: "archive" | "restore", estimateRef: string | null) => ({ operation, estimateRef });
const message = (request: ReturnType<typeof input>) => `fixture:estimate-archive:${JSON.stringify({ request })}`;
async function propose(request: ReturnType<typeof input>, client = owner, extra = {}) {
  const response = await client.post("/api/chat/turns", { headers, data: {
    workspaceId, surfaceKey: "home", clientTurnId: randomUUID(), message: message(request), ...extra,
  } });
  expect(response.status()).toBe(200);
  const text = await response.text(), events = text.split("\n\n").filter(frame => frame.startsWith("data: "))
    .map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(6))));
  const card = events.find(event => event.type === "estimates.archive");
  const accepted = events.find(event => event.type === "turn.accepted");
  if (card?.type !== "estimates.archive" || accepted?.type !== "turn.accepted") {
    throw new Error(`Missing Archive/Restore ticket: ${text}`);
  }
  return { ticket: card.result, threadId: accepted.threadId, turnId: accepted.turnId, text };
}
const decision = (ticket: EstimateArchiveChatTicket, value: "confirm" | "cancel" | "open" = "confirm") =>
  ({ workspaceId, request: estimateArchiveBinding(ticket), decision: value });
const operate = (ticket: EstimateArchiveChatTicket, value: "confirm" | "cancel" | "open" = "confirm", client = owner) =>
  client.post("/api/chat/estimates/archives", { headers, data: decision(ticket, value) });
async function show(page: Page, request: ReturnType<typeof input>, client = owner) {
  await page.context().addCookies((await client.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("textbox", { name: "Ask the SalesMora assistant" }).fill(message(request));
  await page.getByRole("button", { name: "Ask assistant", exact: true }).click();
}
test("browser-confirmed Archive/Restore stays separate, preserves status, and opens only on request", async ({ page }) => {
  const saved = await source(), before = await db("estimates").where({ id: saved.id }).first();
  await show(page, input("archive", saved.id));
  await expect(page.getByRole("button", { name: c.archive.confirm, exact: true })).toBeEnabled();
  const commands: unknown[] = [];
  page.on("request", request => {
    if (request.method() === "POST" && request.url().includes("/api/chat/estimates/archives")) {
      commands.push(request.postDataJSON());
    }
  });
  await page.getByRole("button", { name: c.archive.confirm, exact: true }).dblclick();
  await expect(page.getByText(c.archive.confirmed, { exact: true })).toBeVisible();
  expect(commands).toHaveLength(1);
  expect(JSON.stringify(commands)).not.toContain("Private archive customer");
  const archived = await db("estimates").where({ id: saved.id }).first();
  expect(archived).toMatchObject({ status: "declined", version: before.version + 1 });
  expect(archived.archivedAt).not.toBeNull();
  expect(await db("estimate_activity").where({ estimateId: saved.id, type: "archived" }))
    .toMatchObject([{ source: "assistant-confirmed" }]);
  const proposal = await db("chatEstimateArchives").where({ workspaceId }).orderBy("createdAt", "desc").first();
  expect(proposal.state).toBe("confirmed");
  expect(commands[0]).toEqual(decision(proposal.payload.ticket));

  await page.getByRole("button", { name: c.open, exact: true }).click();
  await page.waitForURL(`**/estimates/${saved.id}?workspace=${workspaceId}`);
  const restore = await propose(input("restore", saved.id), owner, { threadId: proposal.threadId });
  expect(restore.ticket.actionType).toBe("estimate.restore");
  expect(restore.ticket.estimate.archived).toBe(true);
  const restoreTurn = await db("chatTurns").where({ id: restore.turnId }).first();
  expect(restoreTurn.estimateArchiveEvidence).toEqual([]);
  const result = estimateArchiveChatResponseSchema.parse(await (await operate(restore.ticket)).json());
  expect(result.view.receipt).toMatchObject({
    estimateId: saved.id, version: restore.ticket.estimate.version + 1, archived: false,
  });
  const restored = await db("estimates").where({ id: saved.id }).first();
  expect(restored).toMatchObject({ status: "declined", version: before.version + 2, archivedAt: null });
});
test("preparation and cancellation write no Estimate fields; retained ticket stays compact and private reviews are owned", async () => {
  const saved = await source(), before = await db("estimates").where({ id: saved.id }).first();
  const run = await propose(input("archive", saved.id));
  expect(await db("estimates").where({ id: saved.id }).first()).toEqual(before);
  for (const field of ["recipientName", "recipientEmail", "review", "receipt", "href", "privateNotes"]) {
    expect(JSON.stringify(run.ticket)).not.toContain(`"${field}"`);
  }
  for (const privateText of ["Private archive customer", "PRIVATE_ESTIMATE_NOTES", "PRIVATE_PAYMENT_URL", "PRIVATE_SCOPE"]) {
    expect(run.text).not.toContain(privateText);
  }
  expect((await owner.get(`/api/chat/estimates/archives?workspace=${workspaceId}&proposalId=invalid`)).status()).toBe(422);
  const query = new URLSearchParams({ workspace: workspaceId });
  for (const [key, value] of Object.entries(estimateArchiveBinding(run.ticket))) query.set(key, String(value));
  expect((await other.get(`/api/chat/estimates/archives?${query}`)).status()).toBe(404);
  const review = estimateArchiveChatResponseSchema.parse(await (await owner.get(`/api/chat/estimates/archives?${query}`)).json());
  expect(review.view.review.parent.name).toBe("Archive job");
  expect((await operate(run.ticket, "cancel")).status()).toBe(200);
  expect((await operate(run.ticket, "cancel")).status()).toBe(200);
  expect((await db("estimates").where({ id: saved.id }).first()).archivedAt).toBeNull();
});
