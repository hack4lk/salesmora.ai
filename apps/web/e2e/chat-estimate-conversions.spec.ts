import { randomUUID } from "node:crypto";
import { expect, request as requests, test, type APIRequestContext, type Page } from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import { chatStreamEventSchema } from "@salesmora/contracts";
import { estimateConvertCardData } from "../src/features/estimates/estimate-convert-card/estimate-convert-card.data";
import { estimateConvertDialogData } from "../src/features/estimates/estimate-convert-dialog/estimate-convert-dialog.data";

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
let workspaceId: string;
let ownerId: string;

test.beforeAll(async () => {
  await db("rateLimits").where("key", "like", "%/sign-up/email%").delete();
  owner = await requests.newContext({ baseURL: origin });
  const email = `${prefix}-owner@example.test`;
  expect((await owner.post("/api/auth/sign-up/email", { headers, data: {
    name: "Conversion assistant owner",
    email,
    password: "Fictional-conversion-assistant-42!",
    termsAccepted: true,
  } })).status()).toBe(200);
  ownerId = (await db("users").where({ email }).first("id")).id;
  const workspace = await owner.post("/api/workspaces", { headers, data: {
    business: { businessName: "Assistant Conversion Fixture", businessType: "plumbing" },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" },
    team: { invitations: [] },
  } });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json()).workspaceId;
  const settings = await (await owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
  expect((await owner.put("/api/settings/estimates", { headers, data: {
    workspaceId,
    expectedVersion: settings.record.version,
    profile: {
      ...settings.record.profile,
      name: "Assistant Conversion Fixture",
      address: "1 Fixture Avenue",
      phone: "555-0100",
      email: "estimates@example.test",
      requireServiceAddress: true,
    },
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
  if (ownerId) await db("users").where({ id: ownerId }).delete();
  await owner?.dispose();
  await db.destroy();
});

async function acceptedLeadEstimate() {
  const customerId = randomUUID();
  const leadId = randomUUID();
  await db("customers").insert({
    id: customerId,
    workspaceId,
    name: "Private conversion customer",
    type: "person",
    companyName: "",
    email: "customer@example.test",
    phone: "",
    location: "",
    internalNotes: "PRIVATE_CUSTOMER_NOTE",
  });
  await db("leads").insert({
    id: leadId,
    workspaceId,
    createdBy: ownerId,
    submissionId: randomUUID(),
    submissionHash: randomUUID(),
    name: "Conversion source lead",
    email: "",
    phone: "",
    service: "Plumbing",
    address: "2 Fixture Avenue",
    details: "",
    notes: "",
    source: "website",
    stage: "contacted",
    ownerId,
    customerId,
  });
  const created = await owner.post("/api/estimates", { headers, data: {
    workspaceId,
    submissionId: randomUUID(),
    parentType: "lead",
    parentId: leadId,
    values: {
      details: {
        name: "Conversion fixture estimate",
        recipientName: "Private conversion customer",
        recipientEmail: "customer@example.test",
        serviceAddress: "2 Fixture Avenue",
        ownerId,
      },
      items: [{
        description: "Repair work",
        quantity: "1",
        unitPrice: "100.00",
        taxable: false,
        included: false,
      }],
      totals: { discount: { type: "none" }, taxRate: "0" },
      terms: {
        message: "Customer message",
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        paymentTerms: "Due on completion.",
        termsNote: "Customer terms.",
        deposit: { type: "none" },
      },
      scope: "Repair the fixture and verify operation.",
      internalNotes: "PRIVATE_ESTIMATE_NOTE",
      paymentLink: "",
    },
  } });
  expect(created.status()).toBe(201);
  const estimate = await created.json();
  const sharing = await (await owner.get(
    `/api/estimates/${estimate.id}/sharing?workspace=${workspaceId}`,
  )).json();
  expect((await owner.post(`/api/estimates/${estimate.id}/sharing?workspace=${workspaceId}`, {
    headers,
    data: {
      workspaceId,
      estimateId: estimate.id,
      expectedVersion: estimate.version,
      snapshotHash: sharing.snapshotHash,
      submissionId: randomUUID(),
      mode: "publish",
    },
  })).status()).toBe(200);
  const decision = await (await owner.get(
    `/api/estimates/${estimate.id}/decision?workspace=${workspaceId}`,
  )).json();
  expect((await owner.post(`/api/estimates/${estimate.id}/decision?workspace=${workspaceId}`, {
    headers,
    data: {
      workspaceId,
      estimateId: estimate.id,
      submissionId: randomUUID(),
      expectedVersion: decision.estimate.version,
      snapshotHash: decision.snapshotHash,
      mode: "record",
      expectedDecisionId: null,
      outcome: "accepted",
      decisionDate: decision.today,
      channel: "phone",
      note: "",
    },
  })).status()).toBe(200);
  return { estimateId: estimate.id, leadId };
}

const request = (estimateRef: string) => ({ operation: "convert", estimateRef });
const message = (estimateRef: string) =>
  `fixture:estimate-convert:${JSON.stringify({ request: request(estimateRef) })}`;

async function propose(estimateRef: string) {
  const response = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId,
    surfaceKey: "home",
    clientTurnId: randomUUID(),
    message: message(estimateRef),
  } });
  expect(response.status()).toBe(200);
  const text = await response.text();
  const events = text.split("\n\n").filter(frame => frame.startsWith("data: "))
    .map(frame => chatStreamEventSchema.parse(JSON.parse(frame.slice(6))));
  const card = events.find(event => event.type === "estimates.convert");
  const accepted = events.find(event => event.type === "turn.accepted");
  if (card?.type !== "estimates.convert" || accepted?.type !== "turn.accepted") {
    throw new Error(`Missing conversion proposal: ${text}`);
  }
  return { ticket: card.result, threadId: accepted.threadId, text };
}

async function showThread(page: Page, threadId: string) {
  await page.context().addCookies((await owner.storageState()).cookies);
  await page.addInitScript(({ workspace, thread }) => {
    sessionStorage.setItem(`salesmora-chat:${workspace}`, thread);
  }, { workspace: workspaceId, thread: threadId });
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Ask the SalesMora assistant" }))
    .toBeEnabled({ timeout: 15000 });
}

test("conversion proposal opens the protected Job form but creates nothing until its explicit confirmation", async ({ page }) => {
  const cancelledSource = await acceptedLeadEstimate();
  const cancelled = await propose(cancelledSource.estimateId);
  expect(cancelled.text).not.toContain("customer@example.test");
  expect(cancelled.text).not.toContain("PRIVATE_ESTIMATE_NOTE");
  expect(cancelled.text).not.toContain("PRIVATE_CUSTOMER_NOTE");
  const history = await owner.post("/api/chat/turns", { headers, data: {
    workspaceId,
    surfaceKey: "home",
    threadId: cancelled.threadId,
    clientTurnId: randomUUID(),
    message: "fixture:estimate-convert-history",
  } });
  expect(history.status()).toBe(200);
  const historyText = await history.text();
  expect(historyText).toContain(
    "Verified pending conversion proposal and Estimate reference only; no Job creation receipt exists.",
  );
  expect(historyText).not.toContain("customer@example.test");
  expect(historyText).not.toContain("PRIVATE_ESTIMATE_NOTE");
  const initialJobs = Number((await db("jobs").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0);
  const initialWorkOrders = Number((await db("workOrders").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0);

  await showThread(page, cancelled.threadId);
  await expect(page.getByRole("button", { name: estimateConvertCardData.review, exact: true })).toBeVisible();
  await page.getByRole("button", { name: estimateConvertCardData.cancel, exact: true }).click();
  await expect(page.getByText(estimateConvertCardData.states.cancelled, { exact: true })).toBeVisible();
  expect(Number((await db("jobs").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0))
    .toBe(initialJobs);

  const source = await acceptedLeadEstimate();
  const run = await propose(source.estimateId);
  const before = await db("estimates").where({ id: source.estimateId }).first();
  const leadBefore = await db("leads").where({ id: source.leadId }).first();
  const deliveriesBefore = await db("estimate_deliveries").where({ estimateId: source.estimateId }).count({ n: "*" }).first();
  const conversionPosts: string[] = [];
  page.on("request", outgoing => {
    if (outgoing.method() === "POST" && outgoing.url().includes(`/api/estimates/${source.estimateId}/convert`)) {
      conversionPosts.push(outgoing.url());
    }
  });
  await showThread(page, run.threadId);
  await expect(page.getByRole("button", { name: estimateConvertCardData.review, exact: true })).toBeVisible();
  await page.getByRole("button", { name: estimateConvertCardData.review, exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: estimateConvertDialogData.title })).toBeVisible();
  await expect(dialog.getByRole("button", { name: estimateConvertDialogData.confirm, exact: true })).toBeEnabled();
  expect(conversionPosts).toHaveLength(0);
  expect(Number((await db("jobs").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0))
    .toBe(initialJobs);
  expect(Number((await db("workOrders").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0))
    .toBe(initialWorkOrders);
  expect((await db("leads").where({ id: source.leadId }).first()).stage).toBe(leadBefore.stage);
  expect(Number((await db("estimate_deliveries").where({ estimateId: source.estimateId }).count({ n: "*" }).first())?.n ?? 0))
    .toBe(Number(deliveriesBefore?.n ?? 0));
  const proposal = await db("chatEstimateConversions").where({ workspaceId, id: run.ticket.id }).first();
  expect(proposal.state).toBe("pending");
  expect((await db("chatEstimateConversionAudit").where({
    proposalId: run.ticket.id,
    action: "review-opened",
  })).length).toBe(1);

  await dialog.getByRole("button", { name: estimateConvertDialogData.confirm, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/jobs/[0-9a-f-]+\\?workspace=${workspaceId}`));
  expect(conversionPosts).toHaveLength(1);
  const job = await db("jobs").where({
    workspaceId,
    acceptedEstimateId: source.estimateId,
    sourceLeadId: source.leadId,
  }).first();
  expect(job).toBeTruthy();
  expect((await db("jobs").where({ workspaceId, acceptedEstimateId: source.estimateId })).length).toBe(1);
  expect(Number((await db("workOrders").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0))
    .toBe(initialWorkOrders);
  expect((await db("leads").where({ id: source.leadId }).first()).stage).toBe(leadBefore.stage);
  expect(Number((await db("estimate_deliveries").where({ estimateId: source.estimateId }).count({ n: "*" }).first())?.n ?? 0))
    .toBe(Number(deliveriesBefore?.n ?? 0));
  expect((await db("estimates").where({ id: source.estimateId }).first()).status).toBe("accepted");
  expect(Number((await db("jobs").where({ workspaceId }).count({ n: "*" }).first())?.n ?? 0))
    .toBe(initialJobs + 1);
  expect(before.status).toBe("accepted");
});
