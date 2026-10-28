import { createHash, randomUUID } from "node:crypto";
import { expect, request as requests, test, type APIRequestContext, type Page } from "@playwright/test";
import { createDatabase, processEstimateEmails } from "@salesmora/data";
import { startEstimateEmails } from "../../worker/src/estimate-emails";
import { startEstimateExpiry } from "../../worker/src/estimate-expiry";
import type { EstimateDraftSaveResult, EstimateSharingReviewResult } from "@salesmora/data";
import type { EstimateArchiveReceipt, EstimateDecisionReview, EstimateLifecycleRead, EstimateListResult, EstimateRevisionFamily, RelatedEstimatesResult } from "@salesmora/contracts";

test.setTimeout(120_000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") ||
    !["127.0.0.1", "localhost"].includes(new URL(connection).hostname) || connection === process.env.DATABASE_URL) {
  throw new Error("Use the isolated local test database.");
}
const db = createDatabase(connection);
const origin = "http://127.0.0.1:3002";
const headers = { Origin: origin };
const prefix = `estimate-sharing-${randomUUID()}`;
const users: string[] = [];
const rateKey = `estimate-public:${createHash("sha256").update("estimate-public-local").digest("hex")}`;
let owner: APIRequestContext;
let other: APIRequestContext;
let anonymous: APIRequestContext;
let workspaceId: string;
let ownerId: string;
let otherId: string;
let jobId: string;
const originalAppOrigin = process.env.BETTER_AUTH_URL;

test.beforeAll(async () => {
  process.env.BETTER_AUTH_URL = origin;
  owner = await requests.newContext({ baseURL: origin });
  other = await requests.newContext({ baseURL: origin });
  anonymous = await requests.newContext({ baseURL: origin });
  for (const [role, client] of [["owner", owner], ["other", other]] as const) {
    const email = `${prefix}-${role}@example.test`;
    const response = await client.post("/api/auth/sign-up/email", {
      headers, data: { name: `Fixture ${role}`, email, password: "Fictional-estimate-password-42!", termsAccepted: true },
    });
    expect(response.status()).toBe(200);
    const user = await db("users").where({ email }).first("id");
    users.push(user.id);
    if (role === "owner") ownerId = user.id;
    else otherId = user.id;
  }
  const workspace = await owner.post("/api/workspaces", {
    headers,
    data: {
      business: { businessName: "Sharing Fixture Business", businessType: "plumbing" },
      services: { services: ["repairs"], postalCode: "", serviceRange: "" },
      team: { invitations: [] },
    },
  });
  expect(workspace.status()).toBe(201);
  workspaceId = (await workspace.json()).workspaceId;
  const customer = await owner.post("/api/customers", {
    headers, data: {
      workspaceId, submissionId: randomUUID(),
      values: { name: "Fixture Customer", type: "person", companyName: "", email: "", phone: "", location: "", internalNotes: "", ownerId: "" },
    },
  });
  expect(customer.status()).toBe(201);
  const { context: deadline } = await (await owner.get(`/api/jobs/creation-deadline?workspace=${workspaceId}`)).json();
  const job = await owner.post("/api/jobs", {
    headers, data: {
      workspaceId, submissionId: randomUUID(), customerId: (await customer.json()).customerId,
      completionDeadline: deadline.projectedDate, deadlineIntent: { mode: "workspace", revision: deadline.revision }, deadlinePreview: { revision: deadline.revision, createdDate: deadline.createdDate, resolvedDate: deadline.projectedDate, timezone: deadline.timezone },
      title: "Sharing fixture job", primaryOwnerId: ownerId, teamUserIds: [], service: "Plumbing",
    },
  });
  expect(job.status()).toBe(201);
  jobId = (await job.json()).jobId;
  const settings = await (await owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
  const saved = await owner.put("/api/settings/estimates", {
    headers, data: {
      workspaceId, expectedVersion: settings.record.version,
      profile: {
        ...settings.record.profile, name: "Sharing Fixture Business", address: "1 Fixture Avenue",
        phone: "555-0100", email: "estimates@example.test", requireServiceAddress: true,
      },
    },
  });
  expect(saved.status()).toBe(200);
  await db("rateLimits").where({ key: rateKey }).delete();
});

test.afterAll(async () => {
  if (originalAppOrigin === undefined) delete process.env.BETTER_AUTH_URL;
  else process.env.BETTER_AUTH_URL = originalAppOrigin;
  if (workspaceId) {
    await db("estimate_operation_receipts").where({ workspaceId }).delete();
    await db("estimates").where({ workspaceId }).delete();
    await db("workspaces").where({ id: workspaceId }).delete();
  }
  if (users.length) await db("users").whereIn("id", users).delete();
  await db("rateLimits").where({ key: rateKey }).delete();
  await Promise.all([owner, other, anonymous].filter(Boolean).map(client => client.dispose()));
  await db.destroy();
});

type DraftParent = { type: "lead" | "job"; id: string; customerId?: string };
async function draft(name: string, email: string, paymentLink = "", parent?: DraftParent): Promise<EstimateDraftSaveResult> {
  const until = new Date();
  until.setUTCDate(until.getUTCDate() + 30);
  const response = await owner.post("/api/estimates", {
    headers, data: {
      workspaceId, submissionId: randomUUID(), parentType: parent?.type ?? "job", parentId: parent?.id ?? jobId,
      ...(parent?.customerId ? { customerId: parent.customerId } : {}),
      values: {
        details: { name, recipientName: "Fixture Customer", recipientEmail: email, serviceAddress: "2 Fixture Avenue", ownerId },
        items: [{ description: "Fixture installation", quantity: "1", unitPrice: "100.00", taxable: false, included: false }],
        totals: { discount: { type: "none" }, taxRate: "0" },
        terms: {
          message: "Customer message", validUntil: until.toISOString().slice(0, 10),
          paymentTerms: "Due within 60 days.", termsNote: "Fixture customer terms.", deposit: { type: "none" },
        },
        scope: "Customer fixture scope", internalNotes: "STAFF_ONLY_ESTIMATE_HTTP_FIXTURE",
        paymentLink,
      },
    },
  });
  expect(response.status()).toBe(201);
  return response.json();
}

async function selectEstimateAction(page: Page, name: string, action: string) {
  await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
  await page.getByRole("menuitem", { name: action, exact: true }).click();
}

test("staff confirmations enforce origin, access, version and retries; public reads withhold inactive paper", async () => {
  const saved = await draft("API sharing fixture", "customer@example.test");
  const url = `/api/estimates/${saved.id}/sharing?workspace=${workspaceId}`;
  const review: EstimateSharingReviewResult = await (await owner.get(url)).json();
  expect(review.canSend).toBe(true);
  expect(review.issues).toEqual([]);
  expect(review.draftPaper?.state).toBe("snapshot");
  expect((await anonymous.get(url)).status()).toBe(401);
  expect((await other.get(url)).status()).toBe(404);
  const input = {
    mode: "send", workspaceId, estimateId: saved.id, expectedVersion: saved.version,
    snapshotHash: review.snapshotHash, submissionId: randomUUID(),
    recipientEmail: "customer@example.test", subject: review.subject,
  };
  expect((await owner.post(url, { headers: { Origin: "https://other.example" }, data: input })).status()).toBe(403);
  expect((await other.post(url, { headers, data: input })).status()).toBe(404);
  expect((await owner.post(url, { headers, data: { ...input, subject: "Subject\nBcc: other@example.test" } })).status()).toBe(422);
  expect((await owner.post(url, { headers, data: { ...input, expectedVersion: saved.version + 1 } })).status()).toBe(409);
  const confirmed = await owner.post(url, { headers, data: input });
  expect(confirmed.status()).toBe(200);
  const retry = await owner.post(url, { headers, data: input });
  expect(await retry.json()).toEqual(await confirmed.json());
  const deliveries = await db("estimate_deliveries").where({ workspaceId, estimateId: saved.id });
  expect(deliveries).toHaveLength(1);
  expect(deliveries[0].status).toBe("queued");
  expect(deliveries[0].sentAt).toBeNull();
  expect(deliveries[0].attemptCount).toBe(0);
  const link = await (await owner.get(`/api/estimates/${saved.id}/sharing/link?workspace=${workspaceId}`)).json();
  const token = link.path.slice(3);
  const publicUrl = `/api/public/estimates/${token}`;
  const publicRead = await anonymous.get(publicUrl);
  expect(publicRead.status()).toBe(200);
  expect(publicRead.headers()["cache-control"]).toContain("no-store");
  expect(publicRead.headers()["referrer-policy"]).toBe("no-referrer");
  expect(publicRead.headers()["x-robots-tag"]).toContain("noindex");
  expect(publicRead.headers()["set-cookie"]).toBeUndefined();
  const paper = await publicRead.json();
  expect(paper.snapshot.content.paymentTerms).toBe("Due within 60 days.");
  expect(JSON.stringify(paper)).not.toContain("STAFF_ONLY");
  await anonymous.get(publicUrl);
  expect(await db("estimate_activity").where({ workspaceId, estimateId: saved.id, type: "viewed" })).toHaveLength(1);
  await db("estimate_share_tokens").where({ workspaceId, estimateId: saved.id }).update({ revokedAt: new Date() });
  const inactive = await anonymous.get(publicUrl);
  expect(inactive.status()).toBe(410);
  expect(await inactive.json()).toEqual({ state: "revoked" });
  expect((await anonymous.get("/api/public/estimates/not-a-token")).status()).toBe(404);
  await db("rateLimits").where({ key: rateKey }).update({ count: 59, lastRequest: Date.now() });
  expect((await anonymous.get("/api/public/estimates/not-a-token", { headers: { "x-forwarded-for": "192.0.2.1" } })).status()).toBe(404);
  const limited = await anonymous.get("/api/public/estimates/not-a-token", { headers: { "x-forwarded-for": "192.0.2.2" } });
  expect(limited.status()).toBe(429);
  expect(limited.headers()["retry-after"]).toBe("60");
  await db("rateLimits").where({ key: rateKey }).delete();
});

async function shareForWithdrawal(name: string, mode: "send" | "publish", parent?: DraftParent) {
  const saved = await draft(name, mode === "send" ? "withdrawal@example.test" : "", "", parent);
  const sharingUrl = `/api/estimates/${saved.id}/sharing?workspace=${workspaceId}`;
  const review: EstimateSharingReviewResult = await (await owner.get(sharingUrl)).json();
  const response = await owner.post(sharingUrl, {
    headers, data: {
      workspaceId, estimateId: saved.id, expectedVersion: saved.version,
      submissionId: randomUUID(), mode, snapshotHash: review.snapshotHash,
      ...(mode === "send" ? { recipientEmail: "withdrawal@example.test", subject: review.subject } : {}),
    },
  });
  expect(response.status()).toBe(200);
  const receipt = await response.json();
  const link = await (await owner.get(`/api/estimates/${saved.id}/sharing/link?workspace=${workspaceId}`)).json();
  return { ...saved, version: receipt.version as number, token: link.path.slice(3) as string };
}

async function revisionOf(id: string) {
  const review: EstimateRevisionFamily = await (await owner.get(`/api/estimates/${id}/revisions?workspace=${workspaceId}`)).json();
  const input = {
    workspaceId, estimateId: id, expectedVersion: review.version, snapshotHash: review.snapshotHash, submissionId: randomUUID(),
  };
  const response = await owner.post(`/api/estimates/${id}/revise`, { headers, data: input });
  expect(response.status()).toBe(201);
  return response.json() as Promise<EstimateDraftSaveResult>;
}

test("revision APIs enforce scope, origin, strict cursors, one pending Draft and durable identities", async () => {
  const source = await shareForWithdrawal("Revision API fixture", "publish");
  const url = `/api/estimates/${source.id}/revisions?workspace=${workspaceId}`;
  const response = await owner.get(url);
  const review: EstimateRevisionFamily = await response.json();
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(review.canRevise).toBe(true);
  expect(review.revisions).toHaveLength(1);
  expect((await anonymous.get(url)).status()).toBe(401);
  expect((await other.get(url)).status()).toBe(404);
  for (const cursor of ["0", "-1", "1.5", "x", "", "99999999999999999999999"]) {
    expect((await owner.get(`${url}&beforeRevision=${cursor}`)).status()).toBe(422);
  }
  const input = {
    workspaceId, estimateId: source.id, expectedVersion: review.version, snapshotHash: review.snapshotHash, submissionId: randomUUID(),
  };
  const reviseUrl = `/api/estimates/${source.id}/revise`;
  expect((await owner.post(reviseUrl, { data: input })).status()).toBe(403);
  expect((await anonymous.post(reviseUrl, { headers, data: input })).status()).toBe(401);
  expect((await other.post(reviseUrl, { headers, data: input })).status()).toBe(404);
  expect((await owner.post(`/api/estimates/${randomUUID()}/revise`, { headers, data: input })).status()).toBe(400);
  expect((await owner.post(reviseUrl, { headers, data: { ...input, revision: 100 } })).status()).toBe(422);
  expect((await owner.post(reviseUrl, { headers, data: { ...input, expectedVersion: review.version + 1 } })).status()).toBe(409);
  expect((await owner.post(reviseUrl, { headers, data: { ...input, snapshotHash: "b".repeat(64) } })).status()).toBe(409);
  const created = await owner.post(reviseUrl, { headers, data: input });
  expect(created.status()).toBe(201);
  const pending: EstimateDraftSaveResult = await created.json();
  expect(pending.number).toBe(source.number);
  expect(pending.revision).toBe(2);
  expect(await (await owner.post(reviseUrl, { headers, data: input })).json()).toEqual(pending);
  expect((await revisionOf(source.id)).id).toBe(pending.id);
  const oldPaper = await anonymous.get(`/api/public/estimates/${source.token}`);
  expect((await oldPaper.json()).state).toBe("ready");
  expect((await db("estimates").where({ id: source.id }).first()).status).toBe("published");
  const removed = await owner.delete(`/api/estimates/${pending.id}`, {
    headers, data: { workspaceId, estimateId: pending.id, expectedVersion: pending.version, typedConfirmation: pending.number },
  });
  expect(removed.status()).toBe(200);
  const next = await revisionOf(source.id);
  expect(next.revision).toBe(3);
  expect((await (await anonymous.get(`/api/public/estimates/${source.token}`)).json()).state).toBe("ready");
});

for (const mode of ["publish", "send"] as const) {
  test(`live revision ${mode} keeps the predecessor active until confirmation and shows authorized family history`, async ({ browser }) => {
    const name = `Revision browser ${mode}`;
    const paymentLink = "https://payments.example.test/revision-fixture";
    const source = await draft(name, "revisions@example.test", paymentLink);
    const sharingUrl = `/api/estimates/${source.id}/sharing?workspace=${workspaceId}`;
    const initial: EstimateSharingReviewResult = await (await owner.get(sharingUrl)).json();
    const shared = await owner.post(sharingUrl, {
      headers, data: {
        mode: "publish", workspaceId, estimateId: source.id, expectedVersion: source.version,
        snapshotHash: initial.snapshotHash, submissionId: randomUUID(),
      },
    });
    expect(shared.status()).toBe(200);
    const oldPath = (await (await owner.get(`/api/estimates/${source.id}/sharing/link?workspace=${workspaceId}`)).json()).path;
    const frozen = await db("estimate_snapshots").where({ estimateId: source.id }).first();
    const context = await browser.newContext({ storageState: await owner.storageState(), viewport: { width: mode === "send" ? 320 : 1440, height: 1000 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.goto(`${origin}/estimates/${source.id}?workspace=${workspaceId}`);
      await expect(page.getByRole("button", { name: "Create revision", exact: true })).toBeEnabled();
      await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
      await page.getByRole("menuitem", { name: "Create revision", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Define your estimate" })).toBeVisible();
      const pending = await db("estimates").where({ workspaceId, estimateNumber: Number(source.number.slice(4)), status: "draft" }).first();
      expect(pending.revision).toBe(2);
      expect(pending.internalNotes).toBe("");
      await expect(page).toHaveURL(new RegExp(`/estimates/${pending.id}\\?`));
      await expect(page.getByRole("textbox", { name: "Payment link (optional)", exact: true })).toHaveValue(paymentLink);
      const history = page.getByRole("region", { name: "Revision history", exact: true });
      await expect(history.getByRole("heading", { name: "Revision 2", exact: true })).toBeVisible();
      await expect(history.getByText("Viewing", { exact: true })).toBeVisible();
      expect((await (await anonymous.get(`/api/public/estimates/${oldPath.slice(3)}`)).json()).state).toBe("ready");
      await page.getByRole("link", { name: `Open ${source.number} revision 1` }).click();
      await page.getByRole("button", { name: "Create revision", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/estimates/${pending.id}\\?`));
      await page.getByRole("textbox", { name: /^Unit price/ }).fill("250.00");
      await page.getByRole("button", { name: "Continue to review", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Review and confirm", exact: true })).toBeVisible();
      const check = page.getByRole("checkbox", { name: "I checked this payment link against the current revision's amount and terms." });
      await expect(check).not.toBeChecked();
      await expect(page.getByRole("button", { name: "Confirm and continue" })).toBeDisabled();
      await check.check();
      await expect(page.getByRole("button", { name: "Confirm and continue" })).toBeEnabled();
      await page.getByRole("button", { name: "Confirm and continue" }).click();
      await expect(page.getByRole("heading", { name: "Send to your client" })).toBeVisible();
      await expect(page.getByRole("link", { name: /^Pay Now/ })).toHaveCount(0);
      await expect(page.getByRole("checkbox", { name: /I checked this payment link/ })).toHaveCount(0);
      await page.getByRole("button", { name: "Back to review" }).click();
      await expect(check).not.toBeChecked();
      await expect(page.getByRole("button", { name: "Confirm and continue" })).toBeDisabled();
      await check.check();
      await page.getByRole("button", { name: "Confirm and continue" }).click();
      await page.getByRole("button", { name: mode === "publish" ? "Publish without email" : "Send estimate", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Send to your client" })).toHaveCount(0);
      const replaced = await db("estimates").where({ id: source.id }).first();
      expect(replaced.status).toBe("superseded");
      expect(replaced.supersededById).toBe(pending.id);
      expect((await db("estimate_snapshots").where({ estimateId: source.id }).first()).contentHash).toBe(frozen.contentHash);
      const newSnapshot = await db("estimate_snapshots").where({ estimateId: pending.id }).first();
      expect(newSnapshot.content.amounts.totalCents).toBe(25000);
      expect((await (await anonymous.get(`/api/public/estimates/${oldPath.slice(3)}`)).json()).state).toBe("replaced");
      const newPath = (await (await owner.get(`/api/estimates/${pending.id}/sharing/link?workspace=${workspaceId}`)).json()).path;
      const customer = await (await anonymous.get(`/api/public/estimates/${newPath.slice(3)}`)).json();
      expect(customer.state).toBe("ready");
      expect(customer.snapshot.content.revision).toBe(2);
      expect(customer.snapshot.content.paymentLink).toBe(paymentLink);
      expect(JSON.stringify(customer)).not.toContain("STAFF_ONLY");
      await expect(history.getByText("Superseded", { exact: true })).toBeVisible();
      expect(await db("estimate_deliveries").where({ estimateId: pending.id })).toHaveLength(mode === "send" ? 1 : 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.emulateMedia({ media: "print" });
      await expect(history).not.toBeVisible();
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}

test("revision sharing rechecks an accepted predecessor after staff review and leaves the Draft unshared", async ({ browser }) => {
  const source = await shareForWithdrawal("Revision acceptance race", "publish");
  const pending = await revisionOf(source.id);
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/estimates/${pending.id}?workspace=${workspaceId}`);
    await page.getByRole("button", { name: "Continue to review", exact: true }).click();
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    const url = `/api/estimates/${source.id}/decision?workspace=${workspaceId}`;
    const decision: EstimateDecisionReview = await (await owner.get(url)).json();
    const accepted = await owner.post(url, {
      headers, data: {
        mode: "record", workspaceId, estimateId: source.id, expectedVersion: decision.estimate.version,
        snapshotHash: decision.snapshotHash, submissionId: randomUUID(), expectedDecisionId: null,
        outcome: "accepted", decisionDate: decision.today, channel: "phone", note: "",
      },
    });
    expect(accepted.status()).toBe(200);
    await page.getByRole("button", { name: "Publish without email" }).click();
    await expect(page.getByText("The previous revision can no longer be replaced. Reload its current status.", { exact: true })).toBeVisible();
    expect((await db("estimates").where({ id: source.id }).first()).status).toBe("accepted");
    expect((await db("estimates").where({ id: pending.id }).first()).status).toBe("draft");
    expect(await db("estimate_snapshots").where({ estimateId: pending.id })).toHaveLength(0);
    expect((await (await anonymous.get(`/api/public/estimates/${source.token}`)).json()).state).toBe("ready");
  } finally { await context.close(); }
});

test("live revision history pages, retries failures and clears all rows and Revise on access loss", async ({ browser }) => {
  const source = await shareForWithdrawal("Revision family paging", "publish");
  await revisionOf(source.id);
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  const url = `**/api/estimates/${source.id}/revisions?*`;
  const family: EstimateRevisionFamily = await (await owner.get(`/api/estimates/${source.id}/revisions?workspace=${workspaceId}`)).json();
  try {
    await page.route(url, async route => {
      const before = new URL(route.request().url()).searchParams.get("beforeRevision");
      await route.fulfill({ json: {
        ...family, revisions: before ? family.revisions.slice(1) : family.revisions.slice(0, 1),
        nextBeforeRevision: before ? null : family.revisions[0].revision,
      } });
    });
    await page.goto(`${origin}/estimates/${source.id}?workspace=${workspaceId}`);
    const panel = page.getByRole("region", { name: "Revision history", exact: true });
    await expect(panel.getByRole("heading", { name: "Revision 2", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Load older revisions", exact: true }).click();
    await expect(panel.getByRole("heading", { name: "Revision 1", exact: true })).toBeVisible();
    await page.unroute(url);
    await page.route(url, route => route.fulfill({ status: 503, json: { error: "Fixture family temporarily unavailable." } }));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(panel.getByText("Fixture family temporarily unavailable.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create revision", exact: true })).toHaveCount(0);
    await page.unroute(url);
    await page.getByRole("button", { name: "Retry revisions" }).click();
    await expect(panel.getByRole("heading", { name: "Revision 1", exact: true })).toBeVisible();
    await page.route(url, route => route.fulfill({ status: 404, json: { error: "Fixture access lost." } }));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(panel.getByText("Revision history is unavailable. Your access may have changed.")).toBeVisible();
    await expect(panel.getByRole("list")).toHaveCount(0);
    await expect(panel.getByRole("link")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Create revision", exact: true })).toHaveCount(0);
  } finally { await context.close(); }
});

test("scheduled expiry persists worker history, stops queued mail and leaves decisions and frozen paper unchanged across restart", async ({ browser }) => {
  const sent = await shareForWithdrawal("Scheduled expiry Sent fixture", "send");
  const published = await shareForWithdrawal("Scheduled expiry Published fixture", "publish");
  const accepted = await shareForWithdrawal("Scheduled expiry Accepted fixture", "publish");
  const declined = await shareForWithdrawal("Scheduled expiry Declined fixture", "publish");
  const valid = await shareForWithdrawal("Scheduled expiry valid-today fixture", "publish");
  for (const [saved, outcome] of [[accepted, "accepted"], [declined, "declined"]] as const) {
    const url = `/api/estimates/${saved.id}/decision?workspace=${workspaceId}`;
    const review: EstimateDecisionReview = await (await owner.get(url)).json();
    const response = await owner.post(url, {
      headers, data: {
        mode: "record", workspaceId, estimateId: saved.id, expectedVersion: review.estimate.version,
        snapshotHash: review.snapshotHash, submissionId: randomUUID(), expectedDecisionId: null,
        outcome, decisionDate: review.today, channel: "phone", note: "",
      },
    });
    expect(response.status()).toBe(200);
  }
  const review: EstimateSharingReviewResult = await (await owner.get(`/api/estimates/${valid.id}/sharing?workspace=${workspaceId}`)).json();
  const yesterday = new Date(`${review.today}T12:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const past = yesterday.toISOString().slice(0, 10);
  const ids = [sent.id, published.id, accepted.id, declined.id, valid.id];
  const frozenBefore = await db("estimate_snapshots").whereIn("estimateId", ids).orderBy("id");
  const tokensBefore = await db("estimate_share_tokens").whereIn("estimateId", ids).orderBy("id");
  await db("estimates").whereIn("id", [sent.id, published.id, accepted.id, declined.id]).update({ validUntil: past });
  await db("estimates").where({ id: valid.id }).update({ validUntil: review.today });
  const versionsBefore = await db("estimates").whereIn("id", ids).select("id", "version");
  const deliveryBefore = await db("estimate_deliveries").where({ estimateId: sent.id }).first();
  const stop = await startEstimateExpiry(db);
  await stop();
  for (const saved of [sent, published]) {
    const row = await db("estimates").where({ id: saved.id }).first();
    expect(row.status).toBe("expired");
    expect(row.version).toBe(versionsBefore.find(value => value.id === saved.id)!.version + 1);
    const events = await db("estimate_activity").where({ estimateId: saved.id, type: "expired" });
    expect(events).toHaveLength(1);
    expect(events[0].source).toBe("worker");
    expect(events[0].actorId).toBeNull();
    const publicRead = await anonymous.get(`/api/public/estimates/${saved.token}`);
    expect(await publicRead.json()).toEqual({ state: "expired" });
  }
  for (const [saved, status] of [[accepted, "accepted"], [declined, "declined"], [valid, "published"]] as const) {
    const row = await db("estimates").where({ id: saved.id }).first();
    expect(row.status).toBe(status);
    expect(row.version).toBe(versionsBefore.find(value => value.id === saved.id)!.version);
    expect(await db("estimate_activity").where({ estimateId: saved.id, type: "expired" })).toHaveLength(0);
  }
  const delivery = await db("estimate_deliveries").where({ id: deliveryBefore.id }).first();
  expect(delivery.status).toBe("failed");
  expect(delivery.sentAt).toBeNull();
  expect(delivery.attemptCount).toBe(deliveryBefore.attemptCount);
  expect(await db("estimate_deliveries").whereIn("estimateId", [published.id, accepted.id, declined.id, valid.id])).toHaveLength(0);
  expect(await db("estimate_snapshots").whereIn("estimateId", ids).orderBy("id")).toEqual(frozenBefore);
  expect(await db("estimate_share_tokens").whereIn("estimateId", ids).orderBy("id")).toEqual(tokensBefore);
  const after = await db("estimates").whereIn("id", ids).orderBy("id");
  await (await startEstimateExpiry(db))();
  expect(await db("estimates").whereIn("id", ids).orderBy("id")).toEqual(after);
  for (const saved of [sent, published]) {
    expect(await db("estimate_activity").where({ estimateId: saved.id, type: "expired" })).toHaveLength(1);
  }
  const context = await browser.newContext({ storageState: await owner.storageState() });
  try {
    const page = await context.newPage();
    await page.goto(`${origin}/estimates/${published.id}?workspace=${workspaceId}`);
    const history = page.getByRole("region", { name: "Estimate history", exact: true });
    await expect(history.getByText("Estimate expired", { exact: true })).toBeVisible();
    await expect(history.getByText("System automation", { exact: true })).toBeVisible();
    await expect(history.getByText("Expired", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create revision", exact: true })).toBeEnabled();
    const status = page.getByRole("region", { name: "Estimate status", exact: true });
    await expect(status.getByText("Expired", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark accepted", exact: true })).toHaveCount(0);
    await page.reload();
    await expect(history.getByText("Estimate expired", { exact: true })).toHaveCount(1);
  } finally { await context.close(); }
});

test("Void and history APIs enforce authority, origin, version and confirmation replay", async () => {
  const saved = await shareForWithdrawal("API withdrawal fixture", "send");
  const url = `/api/estimates/${saved.id}/void?workspace=${workspaceId}`;
  const historyUrl = `/api/estimates/${saved.id}/lifecycle?workspace=${workspaceId}`;
  expect((await anonymous.get(historyUrl)).status()).toBe(401);
  expect((await other.get(historyUrl)).status()).toBe(404);
  expect((await owner.get(historyUrl + "&beforeAt=invalid")).status()).toBe(422);
  const read = await owner.get(historyUrl);
  expect(read.headers()["cache-control"]).toContain("no-store");
  expect((await read.json()).canVoid).toBe(true);
  const command = {
    workspaceId, estimateId: saved.id, expectedVersion: saved.version,
    submissionId: randomUUID(), reason: "PRIVATE_API_WITHDRAWAL_REASON",
  };
  expect((await owner.post(url, { headers: { Origin: "https://other.example" }, data: command })).status()).toBe(403);
  expect((await anonymous.post(url, { headers, data: command })).status()).toBe(401);
  expect((await other.post(url, { headers, data: command })).status()).toBe(404);
  expect((await owner.post(url, { headers, data: { ...command, reason: " " } })).status()).toBe(422);
  expect((await owner.post(url, { headers, data: { ...command, expectedVersion: saved.version - 1 } })).status()).toBe(409);
  expect((await owner.post(url, { headers, data: { ...command, estimateId: randomUUID() } })).status()).toBe(400);
  const confirmed = await owner.post(url, { headers, data: command });
  expect(confirmed.status()).toBe(200);
  expect(await (await owner.post(url, { headers, data: command })).json()).toEqual(await confirmed.json());
  expect((await owner.post(url, { headers, data: { ...command, reason: "Different command" } })).status()).toBe(409);
  const history: EstimateLifecycleRead = await (await owner.get(historyUrl)).json();
  expect(history.events.filter(event => event.kind === "voided")).toHaveLength(1);
  expect(JSON.stringify(history)).toContain(command.reason);
  expect(JSON.stringify(history)).not.toContain("STAFF_ONLY_ESTIMATE_HTTP_FIXTURE");
  const publicRead = await anonymous.get(`/api/public/estimates/${saved.token}`);
  expect(publicRead.status()).toBe(410);
  expect(await publicRead.json()).toEqual({ state: "withdrawn" });
  const logo = await anonymous.get(`/api/public/estimates/${saved.token}/logo`);
  expect(logo.status()).toBe(410);
  expect((await owner.get(`/api/estimates/${saved.id}/sharing/link?workspace=${workspaceId}`)).status()).toBe(404);
  const delivery = await db("estimate_deliveries").where({ workspaceId, estimateId: saved.id }).first();
  expect(delivery.status).toBe("failed"); expect(delivery.failureCode).toBe("inactive");
});

test("Archive and Restore APIs enforce current authority, strict confirmations, conflicts and exact replay", async () => {
  const saved = await shareForWithdrawal("Archive API fixture", "send");
  const decisionUrl = `/api/estimates/${saved.id}/decision?workspace=${workspaceId}`;
  const decision: EstimateDecisionReview = await (await owner.get(decisionUrl)).json();
  const declined = await owner.post(decisionUrl, { headers, data: {
    workspaceId, estimateId: saved.id, expectedVersion: saved.version, snapshotHash: decision.snapshotHash,
    submissionId: randomUUID(), mode: "record", expectedDecisionId: null,
    outcome: "declined", decisionDate: decision.today, channel: "phone", note: "PRIVATE_ARCHIVE_DECISION",
  } });
  expect(declined.status()).toBe(200);
  const rowBefore = await db("estimates").where({ id: saved.id }).first();
  const snapshots = await db("estimate_snapshots").where({ estimateId: saved.id });
  const decisions = await db("estimate_decisions").where({ estimateId: saved.id });
  const tokenBefore = await db("estimate_share_tokens").where({ estimateId: saved.id }).first();
  const deliveries = await db("estimate_deliveries").where({ estimateId: saved.id });
  const command = {
    workspaceId, estimateId: saved.id, expectedVersion: rowBefore.version, submissionId: randomUUID(), mode: "archive",
  };
  const url = `/api/estimates/${saved.id}/archive`;
  expect((await owner.post(url, { data: command })).status()).toBe(403);
  expect((await anonymous.post(url, { headers, data: command })).status()).toBe(401);
  expect((await other.post(url, { headers, data: command })).status()).toBe(404);
  expect((await owner.post("/api/estimates/invalid/archive", { headers, data: command })).status()).toBe(404);
  expect((await owner.post(`/api/estimates/${randomUUID()}/archive`, { headers, data: command })).status()).toBe(400);
  expect((await owner.post(url, { headers, data: { ...command, workspaceId: randomUUID() } })).status()).toBe(404);
  expect((await owner.post(url, { headers, data: { ...command, archivedBy: ownerId } })).status()).toBe(422);
  expect((await owner.post(url, { headers, data: { ...command, mode: "delete" } })).status()).toBe(422);
  expect((await owner.post(url, { headers, data: { ...command, expectedVersion: rowBefore.version - 1 } })).status()).toBe(409);
  expect((await owner.post(url, { headers, data: { ...command, mode: "restore" } })).status()).toBe(422);
  const response = await owner.post(url, { headers, data: command });
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["vary"]).toContain("Cookie");
  const archived: EstimateArchiveReceipt = await response.json();
  expect(archived).toMatchObject({ estimateId: saved.id, version: rowBefore.version + 1, archived: true });
  expect(await (await owner.post(url, { headers, data: command })).json()).toEqual(archived);
  const listUrl = `/api/estimates?workspace=${workspaceId}&q=${saved.number}`;
  const list: EstimateListResult = await (await owner.get(listUrl)).json();
  expect(list.rows).toHaveLength(0);
  const included: EstimateListResult = await (await owner.get(`${listUrl}&includeHidden=true`)).json();
  expect(included.canArchive).toBe(true);
  expect(included.rows).toHaveLength(1);
  expect(included.rows[0]).toMatchObject({ id: saved.id, archived: true, status: "declined" });
  const restore = { ...command, mode: "restore", expectedVersion: archived.version, submissionId: randomUUID() };
  const restoredResponse = await owner.post(url, { headers, data: restore });
  expect(restoredResponse.status()).toBe(200);
  const restored: EstimateArchiveReceipt = await restoredResponse.json();
  expect(restored).toMatchObject({ estimateId: saved.id, version: archived.version + 1, archived: false });
  expect(await (await owner.post(url, { headers, data: restore })).json()).toEqual(restored);
  expect((await owner.post(url, { headers, data: command })).status()).toBe(409);
  expect((await owner.post(url, { headers, data: { ...restore, mode: "archive" } })).status()).toBe(409);
  expect(await db("estimates").where({ id: saved.id }).first()).toEqual({
    ...rowBefore, version: restored.version, updatedAt: new Date(restored.updatedAt),
  });
  expect(await db("estimate_snapshots").where({ estimateId: saved.id })).toEqual(snapshots);
  expect(await db("estimate_decisions").where({ estimateId: saved.id })).toEqual(decisions);
  expect(await db("estimate_share_tokens").where({ estimateId: saved.id }).first()).toEqual(tokenBefore);
  expect(await db("estimate_deliveries").where({ estimateId: saved.id })).toEqual(deliveries);
  expect(await db("estimate_activity").where({ estimateId: saved.id, type: "archived" })).toHaveLength(1);
  expect(await db("estimate_activity").where({ estimateId: saved.id, type: "restored" })).toHaveLength(1);
  const visible: EstimateListResult = await (await owner.get(listUrl)).json();
  expect(visible.rows).toHaveLength(1);
  expect(visible.rows[0]).toMatchObject({ id: saved.id, archived: false, status: "declined" });
  expect(visible.metrics).toEqual(list.metrics);
  const publicRead = await anonymous.get(`/api/public/estimates/${saved.token}`);
  expect(publicRead.status()).toBe(200);
  expect(JSON.stringify(await publicRead.json())).not.toContain("PRIVATE_ARCHIVE_DECISION");
});

async function closedEstimate(name: string) {
  const saved = await shareForWithdrawal(name, "publish");
  const response = await owner.post(`/api/estimates/${saved.id}/void`, { headers, data: {
    workspaceId, estimateId: saved.id, expectedVersion: saved.version, submissionId: randomUUID(), reason: "Fixture closure",
  } });
  expect(response.status()).toBe(200);
  return { ...saved, version: (await response.json()).version as number };
}

for (const firstSurface of ["editor", "list"] as const) {
  test(`live ${firstSurface} archives and the other surface restores without changing frozen paper or closed links`, async ({ browser }) => {
    const name = `Live archive ${firstSurface}`;
    const saved = await closedEstimate(name);
    const before = await db("estimate_snapshots").where({ estimateId: saved.id });
    const tokens = await db("estimate_share_tokens").where({ estimateId: saved.id });
    const context = await browser.newContext({
      storageState: await owner.storageState(), viewport: { width: firstSurface === "list" ? 390 : 1440, height: 1000 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      const editorUrl = `${origin}/estimates/${saved.id}?workspace=${workspaceId}`;
      const listUrl = `${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(name)}`;
      await page.goto(firstSurface === "editor" ? editorUrl : listUrl);
      await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
      await page.getByRole("menuitem", { name: "Archive estimate", exact: true }).click();
      let dialog = page.getByRole("alertdialog", { name: "Archive this estimate?", exact: true });
      await expect(dialog.getByRole("button", { name: "Archive estimate", exact: true })).toBeEnabled();
      await expect(dialog.getByText(name, { exact: true })).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      expect((await db("estimates").where({ id: saved.id }).first()).archivedAt).toBeNull();
      await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
      await page.getByRole("menuitem", { name: "Archive estimate", exact: true }).click();
      dialog = page.getByRole("alertdialog", { name: "Archive this estimate?", exact: true });
      await dialog.getByRole("button", { name: "Archive estimate", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(page.getByText("Estimate archived. Use Include archived and superseded to find it in the list.", { exact: true })).toBeVisible();
      if (firstSurface === "editor") {
        const history = page.getByRole("region", { name: "Estimate history", exact: true });
        await expect(history.getByText("Estimate archived", { exact: true })).toBeVisible();
        await page.goto(listUrl);
        await expect(page.getByRole("button", { name: `Actions for ${name}`, exact: true })).toHaveCount(0);
        await page.getByRole("switch", { name: "Include archived and superseded", exact: true }).click();
      } else {
        await expect(page.getByRole("button", { name: `Actions for ${name}`, exact: true })).toHaveCount(0);
        await page.goto(editorUrl);
      }
      await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
      await expect(page.getByRole("menuitem", { name: "Archive estimate", exact: true })).toHaveCount(0);
      await page.getByRole("menuitem", { name: "Restore estimate", exact: true }).click();
      dialog = page.getByRole("alertdialog", { name: "Restore this estimate?", exact: true });
      await expect(dialog.getByRole("button", { name: "Restore estimate", exact: true })).toBeEnabled();
      await dialog.getByRole("button", { name: "Restore estimate", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(page.getByText("Estimate restored. Its status and customer-link validity are unchanged.", { exact: true })).toBeVisible();
      await page.goto(editorUrl);
      const history = page.getByRole("region", { name: "Estimate history", exact: true });
      await expect(history.getByText("Estimate archived", { exact: true })).toBeVisible();
      await expect(history.getByText("Estimate restored", { exact: true })).toBeVisible();
      await expect(page.getByRole("region", { name: "Estimate status", exact: true }).getByText("Void", { exact: true })).toBeVisible();
      await page.reload();
      await expect(history.getByText("Estimate restored", { exact: true })).toHaveCount(1);
      expect(await db("estimate_snapshots").where({ estimateId: saved.id })).toEqual(before);
      expect(await db("estimate_share_tokens").where({ estimateId: saved.id })).toEqual(tokens);
      expect(await (await anonymous.get(`/api/public/estimates/${saved.token}`)).json()).toEqual({ state: "withdrawn" });
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}

test("live archive review retries a lost response once, reloads conflicts and clears private details on access loss", async ({ browser }) => {
  const name = "Archive conflict fixture";
  const saved = await closedEstimate(name);
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  const url = `/api/estimates/${saved.id}/archive`;
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
    await page.getByRole("menuitem", { name: "Archive estimate", exact: true }).click();
    let dialog = page.getByRole("alertdialog", { name: "Archive this estimate?", exact: true });
    await expect(dialog.getByRole("button", { name: "Archive estimate", exact: true })).toBeEnabled();
    await db("estimates").where({ id: saved.id }).increment("version", 1);
    await dialog.getByRole("button", { name: "Archive estimate", exact: true }).click();
    await expect(dialog.getByText("This estimate changed. Reload its current details before saving.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Archive estimate", exact: true })).toBeDisabled();
    await dialog.getByRole("button", { name: "Reload estimate and review", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Archive estimate", exact: true })).toBeEnabled();
    let requests = 0;
    const submissions: string[] = [];
    await page.route(`**/api/estimates/${saved.id}/archive*`, async route => {
      submissions.push(route.request().postDataJSON().submissionId);
      requests++;
      if (requests === 1) {
        expect((await route.fetch()).status()).toBe(200);
        await route.fulfill({ status: 503, json: { error: "Fixture response lost. Retry this confirmation." } });
      } else await route.continue();
    });
    await dialog.getByRole("button", { name: "Archive estimate", exact: true }).click();
    await expect(dialog.getByText("Fixture response lost. Retry this confirmation.")).toBeVisible();
    await dialog.getByRole("button", { name: "Archive estimate", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(submissions).toHaveLength(2); expect(submissions[1]).toBe(submissions[0]);
    expect(await db("estimate_activity").where({ estimateId: saved.id, type: "archived" })).toHaveLength(1);
    await page.unroute(`**/api/estimates/${saved.id}/archive*`);
    await page.reload();
    await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
    await page.getByRole("menuitem", { name: "Restore estimate", exact: true }).click();
    dialog = page.getByRole("alertdialog", { name: "Restore this estimate?", exact: true });
    await expect(dialog.getByRole("button", { name: "Restore estimate", exact: true })).toBeEnabled();
    await page.route(`**${url}*`, route => route.fulfill({ status: 404, json: { error: "This estimate or workspace is unavailable." } }));
    await dialog.getByRole("button", { name: "Restore estimate", exact: true }).click();
    await expect(dialog.getByText("This estimate is unavailable. Your access may have changed.")).toBeVisible();
    await expect(dialog.getByText(name, { exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Restore estimate", exact: true })).toBeDisabled();
  } finally { await context.close(); }
});

test("Office archive review retries a failed read, rechecks a revoked grant and hides unauthorized actions on reload", async ({ browser }) => {
  const name = "Office archive fixture";
  const saved = await closedEstimate(name);
  const grantQuery = () => db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.archive" });
  const grant = await grantQuery().first();
  await db("workspaceMemberships").insert({ workspaceId, userId: otherId, role: "office" });
  const context = await browser.newContext({ storageState: await other.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await page.route(`**/api/estimates/${saved.id}?*`, route =>
      route.fulfill({ status: 503, json: { error: "Fixture review temporarily unavailable." } }), { times: 1 });
    await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
    await page.getByRole("menuitem", { name: "Archive estimate", exact: true }).click();
    const dialog = page.getByRole("alertdialog", { name: "Archive this estimate?", exact: true });
    await expect(dialog.getByText("Fixture review temporarily unavailable.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Archive estimate", exact: true })).toBeDisabled();
    await dialog.getByRole("button", { name: "Reload estimate and review", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Archive estimate", exact: true })).toBeEnabled();
    await grantQuery().delete();
    await dialog.getByRole("button", { name: "Archive estimate", exact: true }).click();
    await expect(dialog.getByText("This estimate is unavailable. Your access may have changed.")).toBeVisible();
    await expect(dialog.getByText(name, { exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Archive estimate", exact: true })).toBeDisabled();
    expect((await db("estimates").where({ id: saved.id }).first()).archivedAt).toBeNull();
    expect(await db("estimate_activity").where({ estimateId: saved.id, type: "archived" })).toHaveLength(0);
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.reload();
    await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
    await expect(page.getByRole("menuitem", { name: "Archive estimate", exact: true })).toHaveCount(0);
    await page.goto(`${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(name)}`);
    await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
    await expect(page.getByRole("menuitem", { name: "Archive estimate", exact: true })).toHaveCount(0);
  } finally {
    if (grant && !(await grantQuery().first())) await db("workspaceRolePolicies").insert(grant);
    await db("workspaceMemberships").where({ workspaceId, userId: otherId }).delete();
    await context.close();
  }
});

test("archiving the final row on a later list page returns to the last populated page", async ({ browser }) => {
  const search = "Archive paging fixture";
  for (let index = 1; index <= 25; index++) await draft(`${search} ${index}`, "");
  const name = `${search} last`;
  const saved = await closedEstimate(name);
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  try {
    await page.goto(`${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(search)}&page=2&pageSize=25&sort=estimateNumber&direction=asc`);
    await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
    await page.getByRole("menuitem", { name: "Archive estimate", exact: true }).click();
    const dialog = page.getByRole("alertdialog", { name: "Archive this estimate?", exact: true });
    await dialog.getByRole("button", { name: "Archive estimate", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: `Actions for ${name}`, exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Actions for Archive paging fixture/ })).toHaveCount(25);
    expect(new URL(page.url()).searchParams.get("page")).not.toBe("2");
    expect((await db("estimates").where({ id: saved.id }).first()).archivedAt).not.toBeNull();
  } finally { await context.close(); }
});

for (const width of [390, 1440]) {
  test(`list Duplicate and typed-number Delete work at ${width}px without modifying the source`, async ({ browser }) => {
    const name = `List duplicate fixture ${width}`;
    const source = await draft(name, "customer@example.test", "https://payments.example.test/source-only");
    const before = await db("estimates").where({ id: source.id }).first();
    const context = await browser.newContext({ storageState: await owner.storageState(), viewport: { width, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      const listUrl = `${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(name)}`;
      await page.goto(listUrl);
      const duplicated = page.waitForResponse(response => response.url().includes(`/api/estimates/${source.id}/duplicate`) &&
        response.request().method() === "POST");
      await selectEstimateAction(page, name, "Duplicate estimate");
      const response = await duplicated;
      expect(response.status()).toBe(201);
      const copy: EstimateDraftSaveResult = await response.json();
      await page.waitForURL(`**/estimates/${copy.id}?*`);
      await expect(page.getByRole("button", { name: "Delete draft", exact: true })).toBeEnabled();
      expect(copy.number).not.toBe(source.number);
      const seed = await (await owner.get(`/api/estimates/${copy.id}?workspace=${workspaceId}`)).json();
      expect(seed.estimate.values.details).toMatchObject({ name: `${name} (copy)`, recipientName: "", recipientEmail: "" });
      expect(seed.estimate.values.terms.validUntil).toBe("");
      expect(seed.estimate.values.paymentLink).toBe("");
      await page.goto(listUrl);
      await selectEstimateAction(page, `${name} (copy)`, "Delete draft");
      let dialog = page.getByRole("alertdialog", { name: "Permanently delete this draft?" });
      await expect(dialog.getByRole("textbox", { name: "Estimate number" })).toBeEnabled();
      await expect(dialog.getByText("Not set on this draft", { exact: true })).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      expect(await db("estimates").where({ id: copy.id }).first()).toBeDefined();
      await selectEstimateAction(page, `${name} (copy)`, "Delete draft");
      dialog = page.getByRole("alertdialog", { name: "Permanently delete this draft?" });
      const confirm = dialog.getByRole("button", { name: "Delete draft permanently" });
      const typed = dialog.getByRole("textbox", { name: "Estimate number" });
      await expect(typed).toBeEnabled();
      await typed.fill(`${copy.number} `);
      await expect(confirm).toBeDisabled();
      await typed.fill(copy.number);
      await expect(confirm).toBeEnabled();
      await confirm.click();
      await expect(dialog).toHaveCount(0);
      await expect(page.getByText("Draft permanently deleted. Its estimate number will not be reused.", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: `Actions for ${name} (copy)`, exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: `Actions for ${name}`, exact: true })).toBeVisible();
      expect(await db("estimates").where({ id: copy.id }).first()).toBeUndefined();
      expect(await db("estimate_items").where({ estimateId: copy.id })).toHaveLength(0);
      expect(await db("estimates").where({ id: source.id }).first()).toEqual(before);
      expect(new URL(page.url()).searchParams.get("q")).toBe(name);
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}

test("list Create revision opens the one pending Draft; deleting it leaves the shared predecessor and link unchanged", async ({ browser }) => {
  const name = "List revision fixture";
  const source = await shareForWithdrawal(name, "publish");
  const before = await db("estimates").where({ id: source.id }).first();
  const snapshot = await db("estimate_snapshots").where({ estimateId: source.id });
  const tokens = await db("estimate_share_tokens").where({ estimateId: source.id })
    .select("id", "tokenHash", "encryptedToken", "expiresAt", "revokedAt", "snapshotId");
  const context = await browser.newContext({ storageState: await owner.storageState(), viewport: { width: 390, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  try {
    const listUrl = `${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(name)}&includeHidden=true`;
    await page.goto(listUrl);
    const revised = page.waitForResponse(response => response.url().includes(`/api/estimates/${source.id}/revise`) &&
      response.request().method() === "POST");
    await selectEstimateAction(page, name, "Create revision");
    const response = await revised;
    expect(response.status()).toBe(201);
    const revision: EstimateDraftSaveResult = await response.json();
    await page.waitForURL(`**/estimates/${revision.id}?*`);
    expect(revision.number).toBe(source.number);
    expect(revision.revision).toBe(2);
    expect(await db("estimates").where({ id: source.id }).first()).toEqual(before);
    expect((await anonymous.get(`/api/public/estimates/${source.token}`)).status()).toBe(200);
    await page.goto(listUrl);
    const sourceMenu = page.getByRole("button", { name: `Actions for ${name}`, exact: true });
    await expect(sourceMenu).toHaveCount(2);
    // Newest revision is first; the predecessor remains available with Include hidden.
    await sourceMenu.nth(1).click();
    await page.getByRole("menuitem", { name: "Create revision", exact: true }).click();
    await page.waitForURL(`**/estimates/${revision.id}?*`);
    expect(await db("estimates").where({ workspaceId, estimateNumber: before.estimateNumber, status: "draft" })).toHaveLength(1);
    await page.goto(listUrl);
    await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).first().click();
    await page.getByRole("menuitem", { name: "Delete draft", exact: true }).click();
    const dialog = page.getByRole("alertdialog", { name: "Permanently delete this draft?" });
    await expect(dialog.getByRole("textbox", { name: "Estimate number" })).toBeEnabled();
    await dialog.getByRole("textbox", { name: "Estimate number" }).fill(revision.number);
    await dialog.getByRole("button", { name: "Delete draft permanently" }).click();
    await expect(dialog).toHaveCount(0);
    expect(await db("estimates").where({ id: revision.id }).first()).toBeUndefined();
    expect(await db("estimates").where({ id: source.id }).first()).toEqual(before);
    expect(await db("estimate_snapshots").where({ estimateId: source.id })).toEqual(snapshot);
    expect(await db("estimate_share_tokens").where({ estimateId: source.id })
      .select("id", "tokenHash", "encryptedToken", "expiresAt", "revokedAt", "snapshotId")).toEqual(tokens);
    expect((await anonymous.get(`/api/public/estimates/${source.token}`)).status()).toBe(200);
  } finally { await context.close(); }
});

for (const action of ["duplicate", "revise"] as const) {
  test(`list ${action} retries a lost committed response with the same submission and only one Draft`, async ({ browser }) => {
    const name = `List retry ${action} fixture`;
    const source = action === "duplicate" ? await draft(name, "customer@example.test") : await shareForWithdrawal(name, "publish");
    const context = await browser.newContext({ storageState: await owner.storageState() });
    const page = await context.newPage();
    const submissions: string[] = [];
    let copyId = "";
    try {
      await page.goto(`${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(name)}`);
      await page.route(`**/api/estimates/${source.id}/${action}*`, async route => {
        submissions.push(route.request().postDataJSON().submissionId);
        if (submissions.length === 1) {
          const response = await route.fetch();
          expect(response.status()).toBe(201);
          copyId = (await response.json()).id;
          await route.fulfill({ status: 503, json: { error: "Fixture copy response lost. Retry the same action." } });
        } else await route.continue();
      });
      const label = action === "duplicate" ? "Duplicate estimate" : "Create revision";
      await selectEstimateAction(page, name, label);
      await expect(page.getByText("Fixture copy response lost. Retry the same action.", { exact: true })).toBeVisible();
      await selectEstimateAction(page, name, label);
      await page.waitForURL(`**/estimates/${copyId}?*`);
      expect(submissions).toHaveLength(2);
      expect(submissions[1]).toBe(submissions[0]);
      expect(await db("estimates").where({ workspaceId, status: "draft", name: action === "duplicate" ? `${name} (copy)` : name })).toHaveLength(1);
    } finally { await context.close(); }
  });
}

for (const action of ["Duplicate estimate", "Create revision"] as const) {
  test(`list ${action} rejects a stale row until explicit reload`, async ({ browser }) => {
    const name = `Stale listing ${action}`;
    const source = action === "Duplicate estimate" ? await draft(name, "customer@example.test") : await shareForWithdrawal(name, "publish");
    const context = await browser.newContext({ storageState: await owner.storageState() });
    const page = await context.newPage();
    try {
      await page.goto(`${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(name)}`);
      await expect(page.getByRole("button", { name: `Actions for ${name}`, exact: true })).toBeVisible();
      await db("estimates").where({ id: source.id }).increment("version", 1);
      await selectEstimateAction(page, name, action);
      await expect(page.getByRole("button", { name: "Reload latest list", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: `Actions for ${name}`, exact: true })).toBeDisabled();
      expect(await db("estimates").where({ workspaceId, name: `${name} (copy)` })).toHaveLength(0);
      await page.getByRole("button", { name: "Reload latest list", exact: true }).click();
      await expect(page.getByRole("button", { name: `Actions for ${name}`, exact: true })).toBeEnabled();
      await selectEstimateAction(page, name, action);
      await page.waitForURL(url => /\/estimates\/[^/]+$/.test(url.pathname) && !url.pathname.endsWith(source.id));
    } finally { await context.close(); }
  });
}

test("list deletion retries a failed read and requires a fresh typed review after version conflict", async ({ browser }) => {
  const name = "List delete conflict fixture";
  const source = await draft(name, "customer@example.test");
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(name)}`);
    await page.route(`**/api/estimates/${source.id}?*`, route =>
      route.fulfill({ status: 503, json: { error: "Fixture deletion review temporarily unavailable." } }), { times: 1 });
    await selectEstimateAction(page, name, "Delete draft");
    const dialog = page.getByRole("alertdialog", { name: "Permanently delete this draft?" });
    await expect(dialog.getByText("Fixture deletion review temporarily unavailable.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Delete draft permanently" })).toBeDisabled();
    await dialog.getByRole("button", { name: "Reload estimate and review", exact: true }).click();
    const typed = dialog.getByRole("textbox", { name: "Estimate number" });
    await expect(typed).toBeEnabled();
    await typed.fill(source.number);
    await db("estimates").where({ id: source.id }).increment("version", 1);
    await dialog.getByRole("button", { name: "Delete draft permanently" }).click();
    await expect(dialog.getByText("This estimate changed. Reload its current details before saving.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Delete draft permanently" })).toBeDisabled();
    await dialog.getByRole("button", { name: "Reload estimate and review", exact: true }).click();
    await expect(typed).toHaveValue("");
    await expect(dialog.getByRole("button", { name: "Delete draft permanently" })).toBeDisabled();
    await typed.fill(source.number);
    await dialog.getByRole("button", { name: "Delete draft permanently" }).click();
    await expect(dialog).toHaveCount(0);
    expect(await db("estimates").where({ id: source.id }).first()).toBeUndefined();
  } finally { await context.close(); }
});

test("list deletion clears private review on revoked Office access and removes unauthorized row actions after reload", async ({ browser }) => {
  const name = "Office listing grants fixture";
  const source = await draft(name, "customer@example.test");
  const grantQuery = () => db("workspaceRolePolicies").where({ workspaceId, role: "office" })
    .whereIn("permission", ["estimates.create", "estimates.update", "estimates.delete"]);
  const grants = await grantQuery();
  await db("workspaceMemberships").insert({ workspaceId, userId: otherId, role: "office" });
  const context = await browser.newContext({ storageState: await other.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(name)}`);
    await selectEstimateAction(page, name, "Delete draft");
    const dialog = page.getByRole("alertdialog", { name: "Permanently delete this draft?" });
    const typed = dialog.getByRole("textbox", { name: "Estimate number" });
    await expect(typed).toBeEnabled();
    await typed.fill(source.number);
    await grantQuery().delete();
    await dialog.getByRole("button", { name: "Delete draft permanently" }).click();
    await expect(dialog.getByText("This estimate is unavailable. Your access may have changed.")).toBeVisible();
    await expect(dialog.getByText(name, { exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Delete draft permanently" })).toBeDisabled();
    expect(await db("estimates").where({ id: source.id }).first()).toBeDefined();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.reload();
    await page.getByRole("button", { name: `Actions for ${name}`, exact: true }).click();
    await expect(page.getByRole("menuitem", { name: "Open estimate", exact: true })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Duplicate estimate", exact: true })).toHaveCount(0);
    await expect(page.getByRole("menuitem", { name: "Delete draft", exact: true })).toHaveCount(0);
    const list: EstimateListResult = await (await other.get(`/api/estimates?workspace=${workspaceId}&q=${encodeURIComponent(name)}`)).json();
    expect(list.rows[0]).toMatchObject({ canDuplicate: false, canRevise: false, canDelete: false });
  } finally {
    await context.close();
    await grantQuery().delete();
    if (grants.length) await db("workspaceRolePolicies").insert(grants);
    await db("workspaceMemberships").where({ workspaceId, userId: otherId }).delete();
  }
});

test("deleting the final Draft on a later list page returns to the last populated page", async ({ browser }) => {
  let saved!: EstimateDraftSaveResult;
  for (let index = 0; index < 26; index++) saved = await draft(`Delete paging fixture ${index}`, "");
  const name = "Delete paging fixture 25";
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/estimates?workspace=${workspaceId}&q=Delete%20paging%20fixture&sort=estimateNumber&direction=asc&page=2`);
    await selectEstimateAction(page, name, "Delete draft");
    const dialog = page.getByRole("alertdialog", { name: "Permanently delete this draft?" });
    const typed = dialog.getByRole("textbox", { name: "Estimate number" });
    await expect(typed).toBeEnabled();
    await typed.fill(saved.number);
    await dialog.getByRole("button", { name: "Delete draft permanently" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: `Actions for ${name}`, exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Actions for Delete paging fixture/ })).toHaveCount(25);
    expect(new URL(page.url()).searchParams.get("page")).not.toBe("2");
    expect(await db("estimates").where({ id: saved.id }).first()).toBeUndefined();
  } finally { await context.close(); }
});

test("decision APIs enforce origin, snapshot/version binding, permissions and exact retry receipts", async () => {
  const saved = await shareForWithdrawal("Decision API fixture", "send");
  const url = `/api/estimates/${saved.id}/decision?workspace=${workspaceId}`;
  expect((await anonymous.get(url)).status()).toBe(401);
  expect((await other.get(url)).status()).toBe(404);
  const response = await owner.get(url);
  expect(response.headers()["cache-control"]).toContain("no-store");
  const review: EstimateDecisionReview = await response.json();
  const command = {
    workspaceId, estimateId: saved.id, submissionId: randomUUID(), expectedVersion: saved.version,
    snapshotHash: review.snapshotHash, expectedDecisionId: null, mode: "record",
    outcome: "accepted", decisionDate: review.today, channel: "phone", note: "PRIVATE_API_DECISION_NOTE",
  };
  expect((await owner.post(url, { headers: { Origin: "https://other.example" }, data: command })).status()).toBe(403);
  expect((await anonymous.post(url, { headers, data: command })).status()).toBe(401);
  expect((await other.post(url, { headers, data: command })).status()).toBe(404);
  expect((await owner.post(url, { headers, data: { ...command, decisionDate: "9999-12-31" } })).status()).toBe(422);
  expect((await owner.post(url, { headers, data: { ...command, decisionDate: "2026-02-30" } })).status()).toBe(422);
  expect((await owner.post(url, { headers, data: { ...command, acceptedTotalCents: 1 } })).status()).toBe(422);
  expect((await owner.post(url, { headers, data: { ...command, expectedVersion: 1 } })).status()).toBe(409);
  expect((await owner.post(url, { headers, data: { ...command, snapshotHash: "0".repeat(64) } })).status()).toBe(409);
  expect((await owner.post(url, { headers, data: { ...command, estimateId: randomUUID() } })).status()).toBe(400);
  const committed = await owner.post(url, { headers, data: command });
  expect(committed.status()).toBe(200);
  const receipt = await committed.json();
  expect(await (await owner.post(url, { headers, data: command })).json()).toEqual(receipt);
  expect((await owner.post(url, { headers, data: { ...command, note: "Different command" } })).status()).toBe(409);
  const correction = {
    ...command, mode: "correct", expectedVersion: receipt.version, expectedDecisionId: receipt.decisionId,
    submissionId: randomUUID(), outcome: "declined", reason: "PRIVATE_API_CORRECTION",
  };
  expect((await owner.post(url, { headers, data: { ...correction, reason: " " } })).status()).toBe(422);
  const corrected = await owner.post(url, { headers, data: correction });
  expect(corrected.status()).toBe(200);
  expect(await (await owner.post(url, { headers, data: correction })).json()).toEqual(await corrected.json());
  expect((await owner.post(url, { headers, data: command })).status()).toBe(409);
  const history: EstimateLifecycleRead = await (await owner.get(`/api/estimates/${saved.id}/lifecycle?workspace=${workspaceId}`)).json();
  expect(history.events.filter(event => event.kind === "decision-recorded")).toHaveLength(1);
  expect(history.events.filter(event => event.kind === "decision-corrected")).toHaveLength(1);
  const publicPaper = await anonymous.get(`/api/public/estimates/${saved.token}`);
  expect(publicPaper.status()).toBe(200);
  expect(JSON.stringify(await publicPaper.json())).not.toContain("PRIVATE_API");
  expect((await db("estimate_deliveries").where({ estimateId: saved.id }).first()).status).toBe("failed");
});

test("live Accept, Decline and metadata corrections retain history, frozen paper and the converted Job", async ({ browser }) => {
  const saved = await shareForWithdrawal("Decision browser fixture", "publish");
  const url = `/api/estimates/${saved.id}/decision?workspace=${workspaceId}`;
  const review: EstimateDecisionReview = await (await owner.get(url)).json();
  const frozen = await db("estimate_snapshots").where({ estimateId: saved.id }).first();
  const token = await db("estimate_share_tokens").where({ estimateId: saved.id }).first();
  const jobsBefore = await db("jobs").where({ workspaceId }).count({ n: "*" }).first();
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  const customer = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await page.getByRole("button", { name: "Mark accepted", exact: true }).click();
    let dialog = page.getByRole("alertdialog", { name: "Record customer decision", exact: true });
    await expect(dialog.getByRole("combobox", { name: "Customer decision" })).toHaveValue("accepted");
    await expect(dialog.getByLabel("Decision date", { exact: true })).toHaveValue(review.today);
    await expect(dialog.getByRole("button", { name: "Confirm decision", exact: true })).toBeDisabled();
    await dialog.getByRole("combobox", { name: "How the decision was received" }).selectOption("phone");
    await dialog.getByRole("textbox", { name: "Decision note (optional)" }).fill("PRIVATE_BROWSER_ACCEPT");
    await dialog.getByRole("button", { name: "Confirm decision", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText("Customer decision recorded. No customer email was sent and no job was created.", { exact: true })).toBeVisible();
    const rail = page.getByRole("region", { name: "Estimate status", exact: true });
    await expect(rail.getByText("PRIVATE_BROWSER_ACCEPT")).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark accepted" })).toHaveCount(0);
    await db("jobs").where({ id: jobId }).update({ acceptedEstimateId: saved.id });
    const linkedJobBefore = await db("jobs").where({ id: jobId }).first();
    await page.reload();
    await expect(rail.getByText("Job unchanged:", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Correct decision", exact: true }).click();
    dialog = page.getByRole("alertdialog", { name: "Correct customer decision", exact: true });
    await expect(dialog.getByRole("button", { name: "Confirm correction", exact: true })).toBeDisabled();
    await expect(dialog.getByText("Job unchanged:", { exact: false })).toBeVisible();
    await dialog.getByRole("combobox", { name: "Customer decision" }).selectOption("declined");
    await dialog.getByRole("textbox", { name: /^Reason for correction/ }).fill("PRIVATE_BROWSER_CORRECTION");
    await dialog.getByRole("textbox", { name: "Decision note (optional)" }).fill("PRIVATE_BROWSER_DECLINE");
    await dialog.getByRole("button", { name: "Confirm correction", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(rail.getByText("PRIVATE_BROWSER_DECLINE")).toBeVisible();
    await page.getByRole("button", { name: "Correct decision", exact: true }).click();
    dialog = page.getByRole("alertdialog", { name: "Correct customer decision", exact: true });
    await dialog.getByRole("combobox", { name: "How the decision was received" }).selectOption("email");
    await dialog.getByRole("textbox", { name: /^Reason for correction/ }).fill("PRIVATE_METADATA_REASON");
    await dialog.getByRole("button", { name: "Confirm correction", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    const history = page.getByRole("region", { name: "Estimate history", exact: true });
    await expect(history.getByText("PRIVATE_BROWSER_ACCEPT")).toBeVisible();
    await expect(history.getByText("PRIVATE_BROWSER_CORRECTION")).toBeVisible();
    await expect(history.getByText("PRIVATE_METADATA_REASON")).toBeVisible();
    expect(await db("jobs").where({ id: jobId }).first()).toEqual(linkedJobBefore);
    expect(await db("jobs").where({ workspaceId }).count({ n: "*" }).first()).toEqual(jobsBefore);
    const current: EstimateDecisionReview = await (await owner.get(url)).json();
    expect(current.estimate.decision).toMatchObject({ outcome: "declined", channel: "email" });
    expect(await db("estimate_snapshots").where({ estimateId: saved.id }).first()).toEqual(frozen);
    expect((await db("estimate_share_tokens").where({ estimateId: saved.id }).first()).expiresAt).toEqual(token.expiresAt);
    await customer.goto(`${origin}/e/${saved.token}`);
    await expect(customer.getByRole("article")).toBeVisible();
    expect(await customer.content()).not.toContain("PRIVATE_BROWSER");
    await page.emulateMedia({ media: "print" });
    await expect(rail).toBeHidden();
    await expect(history).toBeHidden();
    await page.emulateMedia({ media: "screen" });
    await page.getByRole("button", { name: "Actions for Decision browser fixture", exact: true }).click();
    await page.getByRole("menuitem", { name: "Preview", exact: true }).click();
    await expect(page.getByRole("article")).toBeVisible();
    expect(await page.content()).not.toContain("PRIVATE_BROWSER");
    expect(await page.content()).not.toContain("PRIVATE_METADATA_REASON");
    expect(errors).toEqual([]);
  } finally {
    await db("jobs").where({ id: jobId }).update({ acceptedEstimateId: null });
    await context.close();
  }
});

test("record Declined, handle a stale correction review and recheck a revoked decision grant", async ({ browser }) => {
  const saved = await shareForWithdrawal("Decision conflict fixture", "publish");
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  const grantQuery = () => db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.decide" });
  const grant = await grantQuery().first();
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await page.getByRole("button", { name: "Mark declined", exact: true }).click();
    let dialog = page.getByRole("alertdialog", { name: "Record customer decision", exact: true });
    await expect(dialog.getByRole("combobox", { name: "Customer decision" })).toHaveValue("declined");
    await dialog.getByRole("combobox", { name: "How the decision was received" }).selectOption("other");
    await dialog.getByRole("button", { name: "Confirm decision", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole("button", { name: "Correct decision", exact: true }).click();
    dialog = page.getByRole("alertdialog", { name: "Correct customer decision", exact: true });
    await dialog.getByRole("textbox", { name: /^Reason for correction/ }).fill("Before conflict");
    await db("estimates").where({ id: saved.id }).increment("version", 1);
    await dialog.getByRole("button", { name: "Confirm correction", exact: true }).click();
    await expect(dialog.getByText("This estimate changed. Reload its current details before saving.")).toBeVisible();
    await dialog.getByRole("button", { name: "Reload estimate and review", exact: true }).click();
    await expect(dialog.getByRole("textbox", { name: /^Reason for correction/ })).toHaveValue("");
    await dialog.getByRole("textbox", { name: /^Reason for correction/ }).fill("After fresh review");
    await dialog.getByRole("button", { name: "Confirm correction", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await db("workspaceMemberships").insert({ workspaceId, userId: otherId, role: "office" });
    const officeContext = await browser.newContext({ storageState: await other.storageState() });
    try {
      const officePage = await officeContext.newPage();
      await officePage.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
      await officePage.getByRole("button", { name: "Correct decision", exact: true }).click();
      const officeDialog = officePage.getByRole("alertdialog", { name: "Correct customer decision", exact: true });
      await officeDialog.getByRole("textbox", { name: /^Reason for correction/ }).fill("Not authorized after revoke");
      await expect(officeDialog.getByRole("button", { name: "Confirm correction", exact: true })).toBeEnabled();
      await grantQuery().delete();
      await officeDialog.getByRole("button", { name: "Confirm correction", exact: true }).click();
      await expect(officeDialog.getByText("This estimate is unavailable. Your access may have changed.")).toBeVisible();
      await expect(officeDialog.getByRole("textbox")).toHaveCount(0);
    } finally { await officeContext.close(); }
    expect(await db("estimate_decisions").where({ estimateId: saved.id })).toHaveLength(2);
  } finally {
    if (grant && !(await grantQuery().first())) await db("workspaceRolePolicies").insert(grant);
    await db("workspaceMemberships").where({ workspaceId, userId: otherId }).delete();
    await context.close();
  }
});

test("live editor withdraws Sent and the list withdraws Published with retained staff history", async ({ browser }) => {
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const publicContext = await browser.newContext();
  const page = await context.newPage();
  const customer = await publicContext.newPage();
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.setDefaultTimeout(15_000);
  try {
    for (const mode of ["send", "publish"] as const) {
      const saved = await shareForWithdrawal(`Browser withdrawal ${mode}`, mode);
      const historyUrl = `/api/estimates/${saved.id}/lifecycle?workspace=${workspaceId}`;
      if (mode === "send") {
        await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
        await expect(page.getByRole("heading", { name: "Estimate history" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Estimate status", exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "Void estimate", exact: true })).toHaveCount(0);
        await page.getByRole("button", { name: `Actions for Browser withdrawal ${mode}`, exact: true }).click();
        await page.getByRole("menuitem", { name: "Void estimate", exact: true }).click();
      } else {
        await page.goto(`${origin}/estimates?workspace=${workspaceId}&q=${encodeURIComponent(`Browser withdrawal ${mode}`)}`);
        await page.getByRole("button", { name: `Actions for Browser withdrawal ${mode}`, exact: true }).click();
        await page.getByRole("menuitem", { name: "Void estimate", exact: true }).click();
      }
      const dialog = page.getByRole("alertdialog", { name: "Withdraw this estimate?" });
      const confirm = dialog.getByRole("button", { name: "Void estimate", exact: true });
      await expect(confirm).toBeDisabled();
      await dialog.getByRole("textbox", { name: /^Reason/ }).fill(`PRIVATE_BROWSER_WITHDRAWAL_${mode}`);
      await expect(confirm).toBeEnabled();
      // A concurrent version change must force a new review, not silently overwrite it.
      if (mode === "send") {
        await db("estimates").where({ id: saved.id }).increment("version", 1);
        await confirm.click();
        await expect(dialog.getByText("This estimate changed. Reload its current details before saving.")).toBeVisible();
        await dialog.getByRole("button", { name: "Reload estimate and review" }).click();
        await expect(dialog.getByRole("textbox", { name: /^Reason/ })).toHaveValue("");
        await dialog.getByRole("textbox", { name: /^Reason/ }).fill(`PRIVATE_BROWSER_WITHDRAWAL_${mode}`);
      }
      await confirm.click();
      await expect(dialog).toHaveCount(0);
      await expect(page.getByText("Estimate withdrawn. Its customer link is no longer available.", { exact: true })).toBeVisible();
      const history: EstimateLifecycleRead = await (await owner.get(historyUrl)).json();
      expect(history.estimate.status).toBe("void");
      expect(history.events.filter(event => event.kind === "voided")).toHaveLength(1);
      if (mode === "publish") {
        await page.getByRole("button", { name: `Actions for Browser withdrawal ${mode}`, exact: true }).click();
        await page.getByRole("menuitem", { name: "Open estimate", exact: true }).click();
      }
      await expect(page.getByText(`PRIVATE_BROWSER_WITHDRAWAL_${mode}`, { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Void estimate", exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Copy customer link", exact: true })).toHaveCount(0);
      await customer.goto(`${origin}/e/${saved.token}`);
      await expect(customer.getByRole("heading", { name: "This estimate has been withdrawn", exact: true })).toBeVisible();
      expect(await customer.content()).not.toContain("PRIVATE_BROWSER_WITHDRAWAL");
      await page.emulateMedia({ media: "print" });
      await expect(page.getByRole("heading", { name: "Estimate history" })).toBeHidden();
      await page.emulateMedia({ media: "screen" });
      expect(await db("estimate_snapshots").where({ estimateId: saved.id })).toHaveLength(1);
      await page.getByRole("button", { name: `Actions for Browser withdrawal ${mode}`, exact: true }).click();
      await expect(page.getByRole("menuitem", { name: "Void estimate", exact: true })).toHaveCount(0);
      await page.getByRole("menuitem", { name: "Preview", exact: true }).click();
      await expect(page.getByText("Review the frozen customer paper.", { exact: false })).toBeVisible();
      await expect(page.getByRole("article").getByRole("heading", { name: `Browser withdrawal ${mode}`, exact: true })).toBeVisible();
      expect(await page.content()).not.toContain(`PRIVATE_BROWSER_WITHDRAWAL_${mode}`);
    }
    expect(errors).toEqual([]);
  } finally { await context.close(); await publicContext.close(); }
});

test("detail Actions menu duplicates a shared estimate into a separate Draft", async ({ browser }) => {
  const saved = await shareForWithdrawal("Detail actions duplicate fixture", "publish");
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await expect(page.getByRole("button", { name: "Duplicate", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Actions for Detail actions duplicate fixture", exact: true }).click();
    await expect(page.getByRole("menuitem")).toHaveCount(4);
    const duplicated = page.waitForResponse(response =>
      response.url().includes(`/api/estimates/${saved.id}/duplicate`) && response.request().method() === "POST");
    await page.getByRole("menuitem", { name: "Duplicate", exact: true }).click();
    const response = await duplicated;
    expect(response.status()).toBe(201);
    const result: EstimateDraftSaveResult = await response.json();
    expect(result.id).not.toBe(saved.id);
    await expect(page).toHaveURL(new RegExp(`/estimates/${result.id}\\?workspace=`));
    await expect(page.getByRole("navigation", { name: "Estimate creation progress" })).toBeVisible();
    expect(await db("estimates").where({ id: result.id, workspaceId }).first("status")).toMatchObject({ status: "draft" });
    expect(await db("estimates").where({ id: saved.id, workspaceId }).first("status")).toMatchObject({ status: "published" });
    expect(await db("estimate_snapshots").where({ estimateId: result.id })).toHaveLength(0);
  } finally { await context.close(); }
});

test("duplicating a Draft opens a clean copy that can be deleted without saving", async ({ browser }) => {
  const saved = await draft("Draft duplicate deletion fixture", "fixture@example.test");
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await expect(page.getByRole("button", { name: "Delete draft", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Actions for Draft duplicate deletion fixture", exact: true }).click();
    const duplicated = page.waitForResponse(response =>
      response.url().includes(`/api/estimates/${saved.id}/duplicate`) && response.request().method() === "POST");
    await page.getByRole("menuitem", { name: "Duplicate", exact: true }).click();
    const response = await duplicated;
    expect(response.status()).toBe(201);
    const result: EstimateDraftSaveResult = await response.json();
    await expect(page).toHaveURL(new RegExp(`/estimates/${result.id}\\?workspace=`));
    const deleteDraft = page.getByRole("button", { name: "Delete draft", exact: true });
    await expect(deleteDraft).toBeEnabled();
    await expect(page.getByText("Unsaved changes", { exact: true })).toHaveCount(0);
    await deleteDraft.click();
    const dialog = page.getByRole("alertdialog", { name: "Permanently delete this draft?" });
    await dialog.getByRole("textbox", { name: "Estimate number" }).fill(result.number);
    await dialog.getByRole("button", { name: "Delete draft permanently", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/estimates\\?workspace=`));
    expect(await db("estimates").where({ id: result.id, workspaceId }).first()).toBeUndefined();
    expect(await db("estimates").where({ id: saved.id, workspaceId }).first("status")).toMatchObject({ status: "draft" });
  } finally { await context.close(); }
});

test("staff history pages, retries errors and clears on access loss; Void rechecks a revoked grant", async ({ browser }) => {
  const saved = await shareForWithdrawal("History permission fixture", "publish");
  await db("estimate_activity").insert(Array.from({ length: 50 }, () => ({
    id: randomUUID(), workspaceId, estimateId: saved.id, actorId: ownerId, actorName: "Fixture owner",
    source: "ui", type: "draft.saved", changes: JSON.stringify({
      fields: ["paymentLink", "internalNotes"], paymentLink: "PRIVATE_HISTORY_PAYMENT", internalNotes: "PRIVATE_HISTORY_NOTE",
    }),
  })));
  await db("workspaceMemberships").insert({ workspaceId, userId: otherId, role: "office" });
  const grantQuery = () => db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.void" });
  const grant = await grantQuery().first();
  const context = await browser.newContext({ storageState: await other.storageState() });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    const history = page.getByRole("region", { name: "Estimate history", exact: true });
    await expect(history.getByText("25 of 52 events loaded")).toBeVisible();
    expect(await history.textContent()).not.toContain("PRIVATE_HISTORY");
    await page.route(`**/api/estimates/${saved.id}/lifecycle?**`, route => route.fulfill({
      status: 503, contentType: "application/json", body: JSON.stringify({ error: "Fixture temporary history failure." }),
    }), { times: 1 });
    await history.getByRole("button", { name: "Load older activity" }).click();
    await expect(history.getByText("Fixture temporary history failure.")).toBeVisible();
    await expect(history.getByText("Previously loaded activity is shown below.", { exact: false })).toBeVisible();
    await history.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(history.getByText("25 of 52 events loaded")).toBeVisible();
    await history.getByRole("button", { name: "Load older activity" }).click();
    await expect(history.getByText("50 of 52 events loaded")).toBeVisible();
    await history.getByRole("button", { name: "Load older activity" }).click();
    await expect(history.getByText("52 of 52 events loaded")).toBeVisible();
    await expect(history.getByRole("button", { name: "Load older activity" })).toHaveCount(0);
    await page.getByRole("button", { name: "Actions for History permission fixture", exact: true }).click();
    await page.getByRole("menuitem", { name: "Void estimate", exact: true }).click();
    const dialog = page.getByRole("alertdialog", { name: "Withdraw this estimate?" });
    await dialog.getByRole("textbox", { name: /^Reason/ }).fill("Not permitted after grant change");
    await expect(dialog.getByRole("button", { name: "Void estimate", exact: true })).toBeEnabled();
    await grantQuery().delete();
    await dialog.getByRole("button", { name: "Void estimate", exact: true }).click();
    await expect(dialog.getByText("This estimate is unavailable. Your access may have changed.", { exact: true })).toBeVisible();
    expect((await db("estimates").where({ id: saved.id }).first()).status).toBe("published");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await db("workspaceMemberships").where({ workspaceId, userId: otherId }).delete();
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(history.getByText("Estimate history is unavailable. Your access may have changed.")).toBeVisible();
    await expect(history.getByRole("list")).toHaveCount(0);
  } finally {
    await context.close();
    await db("workspaceMemberships").where({ workspaceId, userId: otherId }).delete();
    if (grant && !await grantQuery().first()) await db("workspaceRolePolicies").insert(grant);
  }
});

test("live Publish review freezes the paper, copies a working signed-out link and preserves terms in print", async ({ browser }) => {
  const saved = await draft("Browser publication fixture", "");
  const context = await browser.newContext({
    storageState: await owner.storageState(), permissions: ["clipboard-read", "clipboard-write"],
  });

  const publicContext = await browser.newContext();
  const page = await context.newPage();
  const customer = await publicContext.newPage();
  page.setDefaultTimeout(10_000);
  customer.setDefaultTimeout(10_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  customer.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await page.getByRole("button", { name: "Continue to review", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Review and confirm", exact: true })).toBeVisible();
    await expect(page.locator("article aside")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Confirm and continue" })).toBeEnabled();
    expect(await db("estimate_snapshots").where({ workspaceId, estimateId: saved.id })).toHaveLength(0);
    await page.getByRole("button", { name: "Back to details", exact: true }).click();
    expect(await db("estimate_snapshots").where({ workspaceId, estimateId: saved.id })).toHaveLength(0);
    await page.getByRole("button", { name: "Continue to review", exact: true }).click();
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await expect(page.getByRole("heading", { name: "Send to your client" })).toBeVisible();
    expect(await db("estimate_snapshots").where({ workspaceId, estimateId: saved.id })).toHaveLength(0);
    await page.getByRole("button", { name: "Publish without email" }).click();
    await expect(page.getByText("Estimate published. Its customer link is ready to copy.", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy customer link" })).toBeEnabled();
    await page.getByRole("button", { name: "Copy customer link" }).click();
    await expect(page.getByText("Customer link copied.", { exact: true })).toBeVisible();
    const copied: string = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied.startsWith(`${origin}/e/`)).toBe(true);
    await expect(page.getByRole("button", { name: "Save draft", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Publish link", exact: true })).toHaveCount(0);
    const response = await customer.goto(copied);
    expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
    // Next's dev renderer overrides page Cache-Control; production mode verifies no-store.
    expect(response?.headers()["cache-control"]).toContain(
      process.env.SALESMORA_E2E_PRODUCTION === "1" ? "no-store" : "must-revalidate",
    );
    await expect(customer.getByRole("heading", { name: "Browser publication fixture", exact: true })).toBeVisible();
    await expect(customer.getByText("Due within 60 days.", { exact: true })).toBeVisible();
    await expect(customer.getByRole("button", { name: "Print", exact: true })).toBeEnabled();
    await expect(customer.getByRole("navigation")).toHaveCount(0);
    await expect(customer.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    expect(await customer.content()).not.toContain("STAFF_ONLY_ESTIMATE_HTTP_FIXTURE");
    const settings = await (await owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
    const profile = await owner.put("/api/settings/estimates", {
      headers, data: {
        workspaceId, expectedVersion: settings.record.version,
        profile: { ...settings.record.profile, name: "Changed after publication" },
      },
    });
    expect(profile.status()).toBe(200);
    await customer.reload();
    await expect(customer.getByText("Sharing Fixture Business", { exact: true })).toBeVisible();
    await expect(customer.getByText("Changed after publication", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Actions for Browser publication fixture", exact: true }).click();
    await page.getByRole("menuitem", { name: "Preview", exact: true }).click();
    await expect(page.getByText("Review the frozen customer paper.", { exact: false })).toBeVisible();
    await expect(page.getByText("Fixture customer terms.", { exact: true })).toBeVisible();
    await page.emulateMedia({ media: "print" });
    await expect(page.getByText("Due within 60 days.", { exact: true })).toBeVisible();
    expect(await db("estimate_deliveries").where({ workspaceId, estimateId: saved.id })).toHaveLength(0);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await publicContext.close();
  }
});

test("live Send and corrected-email Resend reach Mailpit and update delivery status without reload", async ({ browser }) => {
  const paymentLink = "https://payments.example.test/checkout?token=frozen-fixture&estimate=one";
  const saved = await draft("Browser send fixture", "original@example.test", paymentLink);
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await expect(page.getByRole("button", { name: "Continue to review", exact: true })).toBeEnabled();
    await page.getByRole("textbox", { name: /^Estimate name/ }).fill("Saved browser send fixture");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByText("Draft saved.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Continue to review", exact: true }).click();
    await expect(page.locator("article").getByRole("heading", { name: "Saved browser send fixture", exact: true })).toBeVisible();
    await expect(page.locator("article").getByRole("link", { name: /^Pay Now/ })).toHaveAttribute("href", paymentLink);
    await expect(page.getByText("Go back to Details to make changes. Confirming this review does not send or publish.", { exact: true })).toHaveCount(0);
    const previewTab = context.waitForEvent("page");
    await page.getByRole("link", { name: "Print Preview", exact: true }).click();
    const printPreview = await previewTab;
    await expect(printPreview).toHaveURL(new RegExp(`/estimates/${saved.id}/preview\\?workspace=`));
    await expect(printPreview.getByRole("button", { name: "Print", exact: true })).toBeEnabled();
    await expect(printPreview.locator("article").getByRole("link", { name: /^Pay Now/ })).toHaveAttribute("href", paymentLink);
    await printPreview.emulateMedia({ media: "print" });
    await expect(printPreview.getByRole("navigation")).toHaveCount(0);
    await expect(printPreview.getByRole("button", { name: "Print", exact: true })).not.toBeVisible();
    await expect(printPreview.locator("article").getByText(paymentLink, { exact: true })).toBeVisible();
    expect(await printPreview.locator("body").innerText()).not.toContain("STAFF_ONLY");
    await printPreview.close();
    await expect(page.getByRole("heading", { name: "Review and confirm", exact: true })).toBeVisible();
    const settings = await (await owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
    const updated = await owner.put("/api/settings/estimates", {
      headers, data: {
        workspaceId, expectedVersion: settings.record.version,
        profile: { ...settings.record.profile, name: "Updated during send review" },
      },
    });

    expect(updated.status()).toBe(200);
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await expect(page.getByText(/The reviewed customer paper changed/)).toBeVisible();
    expect(await db("estimate_snapshots").where({ workspaceId, estimateId: saved.id })).toHaveLength(0);
    expect(await db("estimate_deliveries").where({ workspaceId, estimateId: saved.id })).toHaveLength(0);
    await expect(page.getByText("Updated during send review", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await expect(page.getByRole("heading", { name: "Send to your client" })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Pay Now/ })).toHaveCount(0);
    expect(await db("estimate_deliveries").where({ workspaceId, estimateId: saved.id })).toHaveLength(0);
    await page.getByRole("textbox", { name: /^Delivery email/ }).fill("delivery-only@example.test");
    await page.getByRole("button", { name: "Send estimate", exact: true }).click();
    await expect(page.getByText("Queued", { exact: true })).toBeVisible();
    await expect(page.getByText(/Email queued for delivery/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Review resend", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Save draft", exact: true })).toHaveCount(0);
    const first = await db("estimate_deliveries").where({ workspaceId, estimateId: saved.id }).first();
    expect(first.sentAt).toBeNull();
    expect(first.attemptCount).toBe(0);
    const stopFirst = await startEstimateEmails(db);
    try {
      await expect(page.getByText("Sent", { exact: true })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/Email queued for delivery/)).toHaveCount(0);
    } finally { await stopFirst(); }
    const sent = await db("estimate_deliveries").where({ id: first.id }).first();
    expect(sent.status).toBe("sent"); expect(sent.attemptCount).toBe(1);
    expect(sent.providerMessageId).toBe(`<estimate-delivery-${first.id}@salesmora.test>`);
    const search = new URL("http://127.0.0.1:18025/api/v1/search");
    search.searchParams.set("query", `message-id:estimate-delivery-${first.id}@salesmora.test`);
    const found = await (await fetch(search)).json();
    expect(found.messages_count).toBe(1);
    const message = await (await fetch(`http://127.0.0.1:18025/api/v1/message/${found.messages[0].ID}`)).json();
    expect(message.Subject).toBe(first.subject);
    expect(message.To[0].Address).toBe("delivery-only@example.test");
    expect(message.ReplyTo[0].Address).toBe("estimates@example.test");
    expect(message.Text).toContain("$100.00");
    expect(message.Text).toContain(`${origin}/e/`);
    expect(message.Text).toContain(paymentLink);
    expect(message.Text).not.toContain("The business has provided an external payment option for this estimate.");
    expect(message.HTML).toContain(">Pay Now</a>");
    expect(message.Text).toMatch(/This estimate was created in SalesMora\.ai\. Learn more: https:\/\/salesmora\.ai$/);
    expect(message.HTML).not.toContain("STAFF_ONLY");
    // Replaying after SMTP success but before the database commit recovers the same receipt.
    await db("estimate_deliveries").where({ id: first.id }).update({
      status: "queued", sentAt: null, providerMessageId: null,
    });
    const stopReplay = await startEstimateEmails(db);
    try {
      await expect.poll(async () => (await db("estimate_deliveries").where({ id: first.id }).first()).status).toBe("sent");
      expect((await (await fetch(search)).json()).messages_count).toBe(1);
    } finally { await stopReplay(); }
    await page.getByRole("button", { name: "Review resend", exact: true }).click();
    const dialog = page.getByRole("alertdialog");
    await dialog.getByRole("textbox", { name: /^Delivery email/ }).fill("corrected@example.test");
    await expect(dialog.locator("article").getByText("original@example.test", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Confirm resend", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("Queued", { exact: true })).toBeVisible();
    const deliveries = await db("estimate_deliveries").where({ workspaceId, estimateId: saved.id }).orderBy("queuedAt");
    expect(deliveries.map(row => row.recipient)).toEqual(["delivery-only@example.test", "corrected@example.test"]);
    expect(deliveries[1].status).toBe("queued");
    expect(deliveries[1].sentAt).toBeNull();
    await processEstimateEmails(db, ["estimates.read", "estimates.send"], async () => {
      throw new Error("Fictional transient SMTP outage");
    });
    await expect(page.getByText("1 of 5 delivery attempts completed. The email remains queued for retry.")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Next automatic attempt/)).toBeVisible();
    await db("estimate_deliveries").where({ id: deliveries[1].id }).update({ nextAttemptAt: new Date(Date.now() - 1000) });
    const stopSecond = await startEstimateEmails(db);
    try { await expect(page.getByText("Sent", { exact: true })).toBeVisible({ timeout: 15_000 }); }
    finally { await stopSecond(); }
    const second = await db("estimate_deliveries").where({ id: deliveries[1].id }).first();
    expect(second.status).toBe("sent"); expect(second.attemptCount).toBe(2);
    const snapshots = await db("estimate_snapshots").where({ workspaceId, estimateId: saved.id });
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].content.content.recipientEmail).toBe("original@example.test");
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test("new drafts continue into saved review, require fresh review after edits and print the frozen payment", async ({ browser }) => {
  const context = await browser.newContext({ storageState: await owner.storageState(), viewport: { width: 1440, height: 1000 } });
  const customerContext = await browser.newContext({ viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  const customer = await customerContext.newPage();
  const name = `New three-step fixture ${randomUUID()}`;
  const firstLink = "https://payments.example.test/checkout?token=new-fictional&version=1";
  const finalLink = firstLink.replace("version=1", "version=2");
  try {
    await page.goto(`${origin}/estimates/new?workspace=${workspaceId}&jobId=${jobId}`);
    await expect(page.locator('[aria-current="step"]')).toContainText("Details");
    await page.getByRole("textbox", { name: /^Estimate name/ }).fill(name);
    await page.getByRole("textbox", { name: /^Recipient name/ }).fill("New Fixture Customer");
    await page.getByRole("textbox", { name: /^Service address/ }).fill("9 Fixture Avenue");
    await page.getByRole("textbox", { name: "Payment link (optional)", exact: true }).fill(firstLink);
    await page.getByRole("button", { name: "Add custom line", exact: true }).click();
    await page.getByRole("textbox", { name: /^Description/ }).fill("New fixture installation");
    await page.getByRole("textbox", { name: /^Unit price/ }).fill("250.00");
    await page.getByRole("button", { name: "Continue to review" }).click();
    await expect(page).toHaveURL(/\/estimates\/[0-9a-f-]+\?workspace=.*&review=1$/);
    await expect(page.getByRole("heading", { name: "Review and confirm", exact: true })).toBeVisible();
    await expect(page.locator("article").getByRole("link", { name: /^Pay Now/ })).toHaveAttribute("href", firstLink);
    const rows = await db("estimates").where({ workspaceId, name });
    expect(rows).toHaveLength(1);
    const id = rows[0].id;
    expect(rows[0].paymentLink).toBe(firstLink);
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await expect(page.getByRole("heading", { name: "Send to your client" })).toBeVisible();
    expect(await db("estimate_snapshots").where({ workspaceId, estimateId: id })).toHaveLength(0);
    await page.getByRole("button", { name: "Back to review" }).click();
    await page.getByRole("button", { name: "Back to details" }).click();
    await page.getByRole("textbox", { name: "Payment link (optional)", exact: true }).fill("http://unsafe.example.test");
    await page.getByRole("button", { name: "Continue to review" }).click();
    await expect(page.getByRole("heading", { name: "Define your estimate" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Payment link (optional)", exact: true })).toHaveAttribute("aria-invalid", "true");
    await page.getByRole("textbox", { name: "Payment link (optional)", exact: true }).fill(finalLink);
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByText("Draft saved.", { exact: true })).toBeVisible();
    await page.goto(`${origin}/estimates/${id}?workspace=${workspaceId}`);
    await expect(page.getByRole("textbox", { name: "Payment link (optional)", exact: true })).toHaveValue(finalLink);
    await page.getByRole("button", { name: "Continue to review" }).click();
    await expect(page.locator("article").getByRole("link", { name: /^Pay Now/ })).toHaveAttribute("href", finalLink);
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await page.getByRole("button", { name: "Send estimate", exact: true }).click();
    await expect(page.getByRole("textbox", { name: /^Delivery email/ })).toHaveAttribute("aria-invalid", "true");
    await page.getByRole("button", { name: "Publish without email" }).click();
    await expect(page.getByText("Estimate published. Its customer link is ready to copy.", { exact: true })).toBeVisible();
    const path = await (await owner.get(`/api/estimates/${id}/sharing/link?workspace=${workspaceId}`)).json();
    await customer.goto(`${origin}${path.path}`);
    await expect(customer.locator("article").getByRole("link", { name: /^Pay Now/ })).toHaveAttribute("href", finalLink);
    await expect(customer.getByText("The business has provided an external payment option for this estimate.", { exact: true })).toHaveCount(0);
    await expect(customer.getByText(finalLink, { exact: true })).toBeVisible();
    expect(await customer.locator("body").innerText()).not.toMatch(/Not a contract or invoice|This page is read-only/);
    expect(await customer.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await customer.emulateMedia({ media: "print" });
    await expect(customer.locator("article").getByText(finalLink, { exact: true })).toBeVisible();
    expect(await db("estimate_deliveries").where({ workspaceId, estimateId: id })).toHaveLength(0);
    expect(await db("estimate_snapshots").where({ workspaceId, estimateId: id })).toHaveLength(1);
  } finally {
    await context.close(); await customerContext.close();
  }
});

async function relatedLead(customerId?: string) {
  const id = randomUUID();
  await db("leads").insert({
    id, workspaceId, createdBy: ownerId, submissionId: randomUUID(), submissionHash: id,
    name: `Related lead ${id}`, email: "", phone: "", service: "Related estimate repair",
    address: "", details: "", notes: "", source: "website", stage: "contacted",
    ownerId, customerId: customerId ?? null,
  });
  return id;
}

test("lead-linked Send offers an explicit Estimate sent review and Keep open leaves the lead unchanged", async ({ browser }) => {
  const leadId = await relatedLead();
  const saved = await draft("Lead send suggestion fixture", "lead-send@example.test", "", { type: "lead", id: leadId });
  const before = await db("leads").where({ id: leadId }).first("stage");
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await page.getByRole("button", { name: "Continue to review", exact: true }).click();
    await page.getByRole("button", { name: "Confirm and continue", exact: true }).click();
    await page.getByRole("textbox", { name: /^Delivery email/ }).fill("lead-send@example.test");
    await page.getByRole("button", { name: "Send estimate", exact: true }).click();
    const nextStep = page.getByRole("region", { name: "Lead next step", exact: true });
    await expect(nextStep.getByRole("button", { name: "Review move to Estimate sent", exact: true })).toBeVisible();
    await expect(nextStep.getByRole("button", { name: "Not now", exact: true })).toBeVisible();
    await expect(nextStep.getByText("This does not confirm email delivery.", { exact: false })).toBeVisible();
    await nextStep.getByRole("button", { name: "Not now", exact: true }).click();
    await expect(page.getByRole("button", { name: "Review move to Estimate sent", exact: true })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Lead next step", exact: true })).toHaveCount(0);
    expect((await db("leads").where({ id: leadId }).first("stage")).stage).toBe(before.stage);
  } finally {
    await context.close();
  }
});

test("Declined decisions on lead-linked estimates offer Lost review and confirm one explicit lead-stage move", async ({ browser }) => {
  const leadId = await relatedLead();
  const saved = await shareForWithdrawal("Lead decline suggestion fixture", "publish", { type: "lead", id: leadId });
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/estimates/${saved.id}?workspace=${workspaceId}`);
    await expect(page.getByRole("region", { name: "Lead next step", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Mark declined", exact: true }).click();
    const decision = page.getByRole("alertdialog", { name: "Record customer decision", exact: true });
    await decision.getByRole("combobox", { name: "How the decision was received" }).selectOption("phone");
    await decision.getByRole("textbox", { name: "Decision note (optional)" }).fill("PRIVATE_DECLINE_SUGGESTION");
    await decision.getByRole("button", { name: "Confirm decision", exact: true }).click();
    await expect(decision).toHaveCount(0);
    const nextStep = page.getByRole("region", { name: "Lead next step", exact: true });
    await expect(nextStep.getByRole("button", { name: "Review move to Lost", exact: true })).toBeVisible();
    await expect(nextStep.getByRole("button", { name: "Keep lead open", exact: true })).toBeVisible();
    await nextStep.getByRole("button", { name: "Review move to Lost", exact: true }).click();
    const review = page.getByRole("alertdialog", { name: "Move this lead?", exact: true });
    await expect(review.getByRole("combobox", { name: "New stage", exact: true })).toHaveValue("lost");
    await expect(review.getByRole("option", { name: "Estimate sent", exact: true })).toHaveCount(0);
    await review.getByRole("textbox", { name: "Lost reason (optional)", exact: true }).fill("Customer chose another provider.");
    await review.getByRole("button", { name: "Confirm move", exact: true }).click();
    await expect(review).toHaveCount(0);
    await expect(page.getByText("Lead stage updated. The estimate is unchanged.", { exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Lead next step", exact: true })).toHaveCount(0);
    const lead = await db("leads").where({ id: leadId }).first("stage");
    expect(lead.stage).toBe("lost");
    const estimate = await db("estimates").where({ id: saved.id }).first("status");
    expect(estimate.status).toBe("declined");
  } finally {
    await context.close();
  }
});

test("related API reads require exact authorized records and withhold private editor fields", async () => {
  const leadId = await relatedLead();
  const saved = await draft("Related API fixture", "", "", { type: "lead", id: leadId });
  const url = `/api/estimates/related?workspace=${workspaceId}&recordType=lead&recordId=${leadId}`;
  expect((await anonymous.get(url)).status()).toBe(401);
  expect((await other.get(url)).status()).toBe(404);
  expect((await owner.get(url.replace(workspaceId, randomUUID()))).status()).toBe(404);
  expect((await owner.get(url.replace(leadId, randomUUID()))).status()).toBe(404);
  expect((await owner.get(`${url}&page=0`)).status()).toBe(422);
  expect((await owner.get(`${url}&includeHidden=invalid`)).status()).toBe(422);
  const response = await owner.get(url);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  const body: RelatedEstimatesResult = await response.json();
  expect(body.total).toBe(1);
  expect(body.rows[0]).toMatchObject({ id: saved.id, name: "Related API fixture", status: "draft", archived: false });
  expect(Object.keys(body.rows[0]).sort()).toEqual(["archived", "href", "id", "name", "number", "parent", "revision", "status", "totalCents"]);
  expect(JSON.stringify(body)).not.toContain("STAFF_ONLY_ESTIMATE_HTTP_FIXTURE");
});

test("lead header and Estimates card start the same parent-seeded editor without creating a Draft", async ({ browser }) => {
  const leadId = await relatedLead();
  const source = await shareForWithdrawal("Related lead open warning", "publish", { type: "lead", id: leadId });
  const count = Number((await db("estimates").where({ workspaceId }).count({ n: "*" }).first())?.n);
  const context = await browser.newContext({ storageState: await owner.storageState(), viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  try {
    for (const entry of ["header", "card"]) {
      await page.goto(`${origin}/leads/${leadId}?workspace=${workspaceId}`);
      const card = page.getByRole("region", { name: "Estimates", exact: true });
      await expect(card.getByText(source.number, { exact: false })).toBeVisible();
      await expect(card.getByText("Published · not sent", { exact: true })).toBeVisible();
      const action = entry === "card" ? card.getByRole("button", { name: "Create estimate", exact: true })
        : page.getByRole("button", { name: "Create estimate", exact: true }).first();
      await expect(action).toBeEnabled();
      await action.click();
      await expect(page).toHaveURL(new RegExp(`/estimates/new\\?workspace=${workspaceId}&leadId=${leadId}$`));
      await expect(page.getByText("This lead already has an open estimate")).toBeVisible();
      await expect(page.getByRole("link", { name: /Open existing estimate/ })).toHaveAttribute("href", `/estimates/${source.id}?workspace=${workspaceId}`);
      await expect(page.getByRole("textbox", { name: /^Estimate name/ })).toBeVisible();
      expect(Number((await db("estimates").where({ workspaceId }).count({ n: "*" }).first())?.n)).toBe(count);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

test("Job Estimates card supports current/older revisions, Load more, Open and direct Create", async ({ browser }) => {
  const source = await shareForWithdrawal("Related Job family", "publish");
  const revision = await revisionOf(source.id);
  for (let index = 0; index < 10; index++) await draft(`Related Job paging ${index}`, "");
  const result: RelatedEstimatesResult = await (await owner.get(`/api/estimates/related?workspace=${workspaceId}&recordType=job&recordId=${jobId}`)).json();
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/jobs/${jobId}?workspace=${workspaceId}`);
    const card = page.getByRole("region", { name: "Estimates", exact: true });
    await expect(card.getByRole("link", { name: /^Open estimate EST-/ })).toHaveCount(10);
    await card.getByRole("button", { name: "Load more estimates" }).click();
    await expect(card.getByRole("link", { name: /^Open estimate EST-/ })).toHaveCount(Math.min(20, result.total));
    await card.getByRole("switch", { name: "Include archived and older revisions" }).check();
    await expect(card.getByRole("switch")).toBeChecked();
    await expect(card.getByRole("link", { name: /^Open estimate EST-/ })).toHaveCount(10);
    await card.getByRole("button", { name: "Create estimate", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/estimates/new\\?workspace=${workspaceId}&jobId=${jobId}$`));
    await expect(page.getByRole("textbox", { name: /^Estimate name/ })).toBeVisible();
    await page.goto(`${origin}/estimates/${revision.id}?workspace=${workspaceId}`);
    await expect(page.getByRole("textbox", { name: /^Estimate name/ })).toHaveValue("Related Job family");
  } finally { await context.close(); }
});

test("related lead card opens the current revision and reveals older paper only through its history filter", async ({ browser }) => {
  const leadId = await relatedLead();
  const source = await shareForWithdrawal("Related lead revision history", "publish", { type: "lead", id: leadId });
  const revision = await revisionOf(source.id);
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/leads/${leadId}?workspace=${workspaceId}`);
    const card = page.getByRole("region", { name: "Estimates", exact: true });
    await expect(card.getByRole("link", { name: /^Open estimate/ })).toHaveCount(1);
    await expect(card.getByText(`${source.number} · Revision 2`, { exact: true })).toBeVisible();
    await card.getByRole("link", { name: /^Open estimate/ }).click();
    await expect(page).toHaveURL(`${origin}/estimates/${revision.id}?workspace=${workspaceId}`);
    await expect(page.getByRole("textbox", { name: /^Estimate name/ })).toHaveValue("Related lead revision history");
    await page.goto(`${origin}/leads/${leadId}?workspace=${workspaceId}`);
    await card.getByRole("switch", { name: "Include archived and older revisions" }).check();
    await expect(card.getByRole("link", { name: /^Open estimate/ })).toHaveCount(2);
    await card.getByRole("link", { name: `Open estimate ${source.number}, revision 1`, exact: true }).click();
    await expect(page).toHaveURL(`${origin}/estimates/${source.id}?workspace=${workspaceId}`);
    await expect(page.getByRole("heading", { name: "Estimate history", exact: true })).toBeVisible();
  } finally { await context.close(); }
});

test("customer Estimates creation chooses only linked parents and saves one parent-seeded Draft", async ({ browser }) => {
  const { customerId } = await db("jobs").where({ id: jobId }).first("customerId");
  const leadId = await relatedLead(customerId);
  const source = await draft("Related customer lead fixture", "", "", { type: "lead", id: leadId, customerId });
  const count = Number((await db("estimates").where({ workspaceId }).count({ n: "*" }).first())?.n);
  const context = await browser.newContext({ storageState: await owner.storageState(), viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/customers/${customerId}?workspace=${workspaceId}`);
    const card = page.getByRole("region", { name: "Estimates", exact: true });
    await expect(card.getByText("Related customer lead fixture", { exact: true })).toBeVisible();
    await card.getByRole("button", { name: "Create estimate", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/estimates/new\\?workspace=${workspaceId}&customerId=${customerId}$`));
    const parents = await (await owner.get(`/api/estimates/parents?workspace=${workspaceId}&customerId=${customerId}&type=lead`)).json();
    expect(parents.some((parent: { id: string }) => parent.id === leadId)).toBe(true);
    const unrelated = await relatedLead();
    expect(parents.some((parent: { id: string }) => parent.id === unrelated)).toBe(false);
    const parent = parents.find((parent: { id: string }) => parent.id === leadId);
    await page.getByRole("button", { name: new RegExp(`Create estimate for lead ${parent.number}`) }).click();
    await expect(page).toHaveURL(new RegExp(`leadId=${leadId}&customerId=${customerId}$`));
    await expect(page.getByText("This lead already has an open estimate")).toBeVisible();
    expect(Number((await db("estimates").where({ workspaceId }).count({ n: "*" }).first())?.n)).toBe(count);
    const name = `Customer-bound browser Draft ${randomUUID()}`;
    await page.getByRole("textbox", { name: /^Estimate name/ }).fill(name);
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page).toHaveURL(/\/estimates\/[0-9a-f-]+\?workspace=/);
    const rows = await db("estimates").where({ workspaceId, name });
    expect(rows).toHaveLength(1); expect(rows[0].leadId).toBe(leadId);
    expect(rows[0].customerId).toBe(customerId);
    expect(rows[0].id).not.toBe(source.id);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});

test("customer creation rejects forged, unlinked and changed parent contexts without writing a Draft", async ({ browser }) => {
  const { customerId } = await db("jobs").where({ id: jobId }).first("customerId");
  const leadId = await relatedLead(customerId);
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  try {
    expect((await anonymous.get(`/api/estimates/parents?workspace=${workspaceId}&customerId=${customerId}&type=lead`)).status()).toBe(401);
    expect((await owner.get(`/api/estimates/parents?workspace=${workspaceId}&customerId=${randomUUID()}&type=lead`)).status()).toBe(404);
    await page.goto(`${origin}/estimates/new?workspace=${workspaceId}&leadId=${leadId}&customerId=${customerId}`);
    const name = `Unlinked customer Draft ${randomUUID()}`;
    await page.getByRole("textbox", { name: /^Estimate name/ }).fill(name);
    await db("leads").where({ id: leadId }).update({ customerId: null });
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByText("This estimate or workspace is unavailable.", { exact: true })).toBeVisible();
    expect(await db("estimates").where({ workspaceId, name })).toHaveLength(0);
    const response = await page.goto(`${origin}/estimates/new?workspace=${workspaceId}&leadId=${leadId}&customerId=${customerId}`);
    expect(response?.status()).toBe(404);
    const forged = await page.goto(`${origin}/estimates/new?workspace=${workspaceId}&customerId=forged`);
    expect(forged?.status()).toBe(404);
  } finally { await context.close(); }
});

test("related paging discards stale cached rows when the authorized read version changes", async ({ browser }) => {
  for (let index = 0; index < 11; index++) await draft(`Related version paging ${index}`, "");
  const context = await browser.newContext({ storageState: await owner.storageState() });
  const page = await context.newPage();
  const saved = await draft("Related stale paging fixture", "");
  try {
    await page.goto(`${origin}/jobs/${jobId}?workspace=${workspaceId}`);
    const card = page.getByRole("region", { name: "Estimates", exact: true });
    await expect(card.getByText("Related stale paging fixture", { exact: true })).toBeVisible();
    await db("estimates").where({ id: saved.id }).update({ name: "Related fresh paging fixture", version: saved.version + 1 });
    await card.getByRole("button", { name: "Load more estimates" }).click();
    await expect(card.getByText("Related fresh paging fixture", { exact: true })).toBeVisible();
    await expect(card.getByText("Related stale paging fixture", { exact: true })).toHaveCount(0);
    await expect(card.getByRole("link", { name: /^Open estimate EST-/ })).toHaveCount(10);
  } finally { await context.close(); }
});

test("related card hides cached rows and Create after Office access is withdrawn during paging", async ({ browser }) => {
  for (let index = 0; index < 11; index++) await draft(`Related revoked paging ${index}`, "");
  const membership = await db("workspaceMemberships").where({ workspaceId, userId: otherId }).first();
  const grants = await db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.create" });
  await db("workspaceMemberships").insert({ workspaceId, userId: otherId, role: "office" })
    .onConflict(["workspaceId", "userId"]).merge({ role: "office" });
  const context = await browser.newContext({ storageState: await other.storageState() });
  const page = await context.newPage();
  try {
    await db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.create" }).delete();
    await page.goto(`${origin}/jobs/${jobId}?workspace=${workspaceId}`);
    const card = page.getByRole("region", { name: "Estimates", exact: true });
    await expect(card.getByRole("link", { name: /^Open estimate EST-/ })).toHaveCount(10);
    await expect(card.getByRole("button", { name: "Create estimate", exact: true })).toHaveCount(0);
    await db("workspaceMemberships").where({ workspaceId, userId: otherId }).delete();
    await card.getByRole("button", { name: "Load more estimates" }).click();
    await expect(card.getByText("Related estimates are unavailable. Your access may have changed.")).toBeVisible();
    await expect(card.getByRole("link")).toHaveCount(0);
    await expect(card.getByRole("list")).toHaveCount(0);
    await expect(card.getByRole("button")).toHaveCount(0);
  } finally {
    await context.close();
    await db("workspaceRolePolicies").where({ workspaceId, role: "office", permission: "estimates.create" }).delete();
    if (grants.length) await db("workspaceRolePolicies").insert(grants);
    await db("workspaceMemberships").where({ workspaceId, userId: otherId }).delete();
    if (membership) await db("workspaceMemberships").insert(membership);
  }
});
