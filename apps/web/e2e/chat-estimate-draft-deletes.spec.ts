import { randomUUID } from "node:crypto";
import { expect, request as requests, test, type APIRequestContext, type Page } from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import {
  chatStreamEventSchema,
  estimateDraftDeleteChatResponseSchema,
  type EstimateDraftDeleteChatTicket,
} from "@salesmora/contracts";
import { estimateDraftDeleteBinding } from "../src/features/assistant/estimate-result/estimate-draft-delete-client";
import { estimateDraftDeleteCardData as c } from "../src/features/estimates/estimate-draft-delete-card/estimate-draft-delete-card.data";

test.setTimeout(120000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") ||
    !["127.0.0.1", "localhost"].includes(new URL(connection).hostname) ||
    connection === process.env.DATABASE_URL) {
  throw new Error("Use the isolated local test database.");
}
const db = createDatabase(connection);
const origin = "http://127.0.0.1:3002";
const headers = { Origin: origin };
const prefix = randomUUID();
let owner: APIRequestContext;
let other: APIRequestContext;
let workspaceId: string;
let ownerId: string;
let otherId: string;

test.beforeAll(async () => {
  await db("rateLimits").where("key", "like", "%/sign-up/email%").delete();
  const identities = [];
  for (const role of ["owner", "other"]) {
    const client = await requests.newContext({ baseURL: origin });
    const email = `${prefix}-${role}@example.test`;
    expect((await client.post("/api/auth/sign-up/email", { headers, data: {
      name: `Draft deletion ${role}`,
      email,
      password: "Fictional-draft-delete-assistant-42!",
      termsAccepted: true,
    } })).status()).toBe(200);
    identities.push((await db("users").where({ email }).first("id")).id);
    if (role === "owner") owner = client;
    else other = client;
  }
  [ownerId, otherId] = identities;
  const workspace = await owner.post("/api/workspaces", { headers, data: {
    business: { businessName: "Assistant Draft-deletion Fixture", businessType: "plumbing" },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" },
    team: { invitations: [] },
  } });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json()).workspaceId;
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
    id: parentId,
    workspaceId,
    title: "Draft deletion job",
    customerName: "Private deletion customer",
    service: "Plumbing",
    location: "",
    description: "PRIVATE_DELETION_JOB_NOTE",
    primaryOwnerId: ownerId,
    createdBy: ownerId,
  });
  const response = await owner.post("/api/estimates", { headers, data: {
    workspaceId,
    submissionId: randomUUID(),
    parentType: "job",
    parentId,
    values: {
      details: {
        name: "Private deletion estimate",
        recipientName: "Private deletion customer",
        recipientEmail: "customer@example.test",
        serviceAddress: "2 Fixture Avenue",
        ownerId,
      },
      items: [{
        description: "Saved repair",
        quantity: "1",
        unitPrice: "100.00",
        taxable: false,
        included: false,
      }],
      totals: { discount: { type: "none" }, taxRate: "0" },
      terms: {
        message: "PRIVATE_CUSTOMER_MESSAGE",
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        paymentTerms: "Due on completion.",
        termsNote: "Customer terms.",
        deposit: { type: "none" },
      },
      scope: "PRIVATE_SCOPE",
      internalNotes: "PRIVATE_ESTIMATE_NOTES",
      paymentLink: "https://payments.example.test/PRIVATE_PAYMENT_URL",
    },
  } });
  expect(response.status()).toBe(201);
  return { ...(await response.json()), parentId };
}

const request = (estimateRef: string | null) => ({ operation: "delete-draft", estimateRef });
const message = (input: ReturnType<typeof request>) =>
  `fixture:estimate-draft-delete:${JSON.stringify({ request: input })}`;

async function propose(input: ReturnType<typeof request>, client = owner, extra = {}) {
  const response = await client.post("/api/chat/turns", { headers, data: {
    workspaceId,
    surfaceKey: "home",
    clientTurnId: randomUUID(),
    message: message(input),
    ...extra,
  } });
  expect(response.status()).toBe(200);
  const text = await response.text();
  const events = text.split("\n\n").filter(frame => frame.startsWith("data: "))
    .map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(6))));
  const card = events.find(event => event.type === "estimates.draft_delete");
  const accepted = events.find(event => event.type === "turn.accepted");
  if (card?.type !== "estimates.draft_delete" || accepted?.type !== "turn.accepted") {
    throw new Error(`Missing Draft-deletion ticket: ${text}`);
  }
  return { ticket: card.result, threadId: accepted.threadId, turnId: accepted.turnId, text };
}

function command(ticket: EstimateDraftDeleteChatTicket, decision: "confirm" | "cancel", typedConfirmation?: string) {
  return {
    workspaceId,
    request: estimateDraftDeleteBinding(ticket),
    decision,
    ...(decision === "confirm" ? { typedConfirmation } : {}),
  };
}

const history = async (threadId: string, client = owner) =>
  (await client.get(`/api/chat/threads?workspace=${workspaceId}&thread=${threadId}`)).json();

async function showThread(page: Page, threadId: string, client = owner) {
  await page.context().addCookies((await client.storageState()).cookies);
  await page.addInitScript(({ workspace, thread }) => {
    sessionStorage.setItem(`salesmora-chat:${workspace}`, thread);
  }, { workspace: workspaceId, thread: threadId });
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
}

test("the connected card requires the exact number and restores only the checked deletion outcome", async ({ page }) => {
  const saved = await source();
  const run = await propose(request(saved.id));
  expect(run.text).not.toContain("Private deletion customer");
  expect(run.text).not.toContain("PRIVATE_ESTIMATE_NOTES");
  expect(run.ticket.actionType).toBe("estimate.delete-draft");
  expect(await db("estimates").where({ id: saved.id }).first("id")).toBeTruthy();

  const response = await owner.get(`/api/chat/estimates/draft-deletions?workspace=${workspaceId}&proposalId=invalid`);
  expect(response.status()).toBe(422);
  const pageReview = await owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${run.threadId}`);
  const stored = await pageReview.json();
  expect(stored.turns.find((turn: { id: string }) => turn.id === run.turnId).estimateDraftDelete.state)
    .toBe("pending");

  await showThread(page, run.threadId);
  await expect(page.getByRole("button", { name: c.reviewDelete, exact: true })).toBeVisible();
  const commands: unknown[] = [];
  page.on("request", outgoing => {
    if (outgoing.method() === "POST" && outgoing.url().includes("/api/chat/estimates/draft-deletions")) {
      commands.push(outgoing.postDataJSON());
    }
  });
  await page.getByRole("button", { name: c.reviewDelete, exact: true }).click();
  const dialog = page.getByRole("alertdialog");
  const input = dialog.getByRole("textbox", { name: c.dialog.type });
  const confirm = dialog.getByRole("button", { name: c.dialog.confirm, exact: true });
  await input.pressSequentially(`${run.ticket.estimate.number} `);
  await expect(input).toHaveValue(`${run.ticket.estimate.number} `);
  await expect(confirm).toBeDisabled();
  expect(await db("estimates").where({ id: saved.id }).first("id")).toBeTruthy();
  expect(commands).toHaveLength(0);
  await input.clear();
  await input.pressSequentially(run.ticket.estimate.number);
  await expect(input).toHaveValue(run.ticket.estimate.number);
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByText(c.confirmed, { exact: true })).toBeVisible();

  expect(commands).toHaveLength(1);
  expect(commands[0]).toEqual(command(run.ticket, "confirm", run.ticket.estimate.number));
  for (const privateValue of [
    "Private deletion customer", "PRIVATE_CUSTOMER_MESSAGE", "PRIVATE_SCOPE",
    "PRIVATE_ESTIMATE_NOTES", "PRIVATE_PAYMENT_URL",
  ]) expect(JSON.stringify(commands)).not.toContain(privateValue);
  expect(await db("estimates").where({ id: saved.id }).first("id")).toBeUndefined();
  expect(await db("estimate_items").where({ estimateId: saved.id })).toHaveLength(0);
  const proposal = await db("chatEstimateDraftDeletes").where({ id: run.ticket.id }).first();
  expect(proposal.state).toBe("confirmed");
  expect(await db("chatEstimateDraftDeleteAudit").where({ proposalId: run.ticket.id }).orderBy("createdAt")
    .then(rows => rows.map(row => row.action))).toEqual(["proposed", "confirmed"]);

  const restored = await history(run.threadId);
  expect(restored.turns.find((turn: { id: string }) => turn.id === run.turnId).estimateDraftDelete.state)
    .toBe("confirmed");
  const followup = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId,
    threadId: run.threadId,
    surfaceKey: "home",
    clientTurnId: randomUUID(),
    message: "fixture:estimate-draft-delete-history",
  } });
  expect(followup.status()).toBe(200);
  expect(await followup.text()).toContain("Verified confirmed Draft deletion.");
});

test("private reviews are owned and cancellation or a mismatched number never deletes", async () => {
  const saved = await source();
  const run = await propose(request(saved.id));
  const query = new URLSearchParams({ workspace: workspaceId });
  for (const [key, value] of Object.entries(estimateDraftDeleteBinding(run.ticket))) {
    query.set(key, String(value));
  }
  const response = await owner.get(`/api/chat/estimates/draft-deletions?${query}`);
  const review = estimateDraftDeleteChatResponseSchema.parse(await response.json());
  expect(review.view.review.name).toBe("Private deletion estimate");
  expect(review.view.review.recipientName).toBe("Private deletion customer");
  expect(JSON.stringify(run.ticket)).not.toContain("Private deletion customer");
  expect((await other.get(`/api/chat/estimates/draft-deletions?${query}`)).status()).toBe(404);

  const mismatched = await owner.post("/api/chat/estimates/draft-deletions", {
    headers,
    data: command(run.ticket, "confirm", ` ${run.ticket.estimate.number}`),
  });
  expect(mismatched.status()).toBeGreaterThanOrEqual(400);
  expect(await db("estimates").where({ id: saved.id }).first("id")).toBeTruthy();
  expect((await db("chatEstimateDraftDeletes").where({ id: run.ticket.id }).first()).state).toBe("pending");

  const cancelled = await owner.post("/api/chat/estimates/draft-deletions", {
    headers,
    data: command(run.ticket, "cancel"),
  });
  expect(estimateDraftDeleteChatResponseSchema.parse(await cancelled.json()).view.ticket.state)
    .toBe("cancelled");
  expect(await db("estimates").where({ id: saved.id }).first("id")).toBeTruthy();
  expect((await db("chatEstimateDraftDeleteAudit").where({ proposalId: run.ticket.id }).orderBy("createdAt")
    .then(rows => rows.map(row => row.action)))).toEqual(["proposed", "cancelled"]);
});
