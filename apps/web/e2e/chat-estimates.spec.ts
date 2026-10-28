import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, request as requests, test, type APIRequestContext } from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import {
  chatStreamEventSchema, estimateChatFilterSchema, estimateChatQuerySchema,
  type EstimateChatFilters, type EstimateChatResult,
  type EstimateChatReadCard, type EstimateDraftValues, type EstimateRevisionFamily,
} from "@salesmora/contracts";
import type { EstimateDraftSaveResult, EstimateSharingReviewResult } from "@salesmora/data";

test.setTimeout(120000);
const connection = process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith("_test") ||
    !["127.0.0.1", "localhost"].includes(new URL(connection).hostname) ||
    connection === process.env.DATABASE_URL) throw new Error("Use the isolated local test database.");
const db = createDatabase(connection);
const origin = "http://127.0.0.1:3002";
const headers = { Origin: origin };
const clients: Record<string, APIRequestContext> = {};
const users: Record<string, string> = {};
const prefix = randomUUID();
let workspaceId: string;
const jobId = randomUUID(), otherJobId = randomUUID(), leadId = randomUUID(), customerId = randomUUID();
const rows = Array.from({ length: 17 }, (_, index) => ({
  id: randomUUID(), totalCents: 10000 + index * 100, index,
}));
const filters = estimateChatFilterSchema.parse({
  query: "", status: "all", owner: "all", parent: "all", customer: null,
  minTotalCents: null, maxTotalCents: null, validUntilFrom: null, validUntilTo: null,
  includeHidden: false, limit: 20,
});
type EstimateRequest = ReturnType<typeof estimateChatQuerySchema.parse>["request"];

test.beforeAll(async () => {
  await db("rateLimits").where("key", "like", "%/sign-up/email%").delete();
  for (const role of ["owner", "field", "other"]) {
    clients[role] = await requests.newContext({ baseURL: origin });
    const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post("/api/auth/sign-up/email", {
      headers, data: { name: `Estimate ${role}`, email, password: "Fictional-estimate-chat-42!", termsAccepted: true },
    })).status()).toBe(200);
    users[role] = (await db("users").where({ email }).first("id")).id;
  }
  const response = await clients.owner.post("/api/workspaces", { headers, data: {
    business: { businessName: "Estimate assistant fixture", businessType: "plumbing" },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" }, team: { invitations: [] },
  } });
  expect(response.status()).toBe(201);
  workspaceId = (await response.json()).workspaceId;
  await db("workspaceMemberships").insert({ workspaceId, userId: users.field, role: "field" });
  await db("customers").insert({
    id: customerId, workspaceId, name: "Summary Customer", type: "person", companyName: "",
    email: "CUSTOMER_SECRET@example.test", phone: "", location: "", internalNotes: "PRIVATE_CUSTOMER",
  });
  await db("jobs").insert([jobId, otherJobId].map(id => ({
    id, workspaceId, customerId, customerName: "Summary Customer", title: "Summary Job",
    service: "Plumbing", location: "", description: "PRIVATE_JOB", primaryOwnerId: id === jobId ? users.field : users.owner,
    createdBy: users.owner,
  })));
  await db("leads").insert({
    id: leadId, workspaceId, createdBy: users.owner, ownerId: users.owner, name: "Summary Lead",
    submissionId: randomUUID(), submissionHash: "estimate-assistant-fixture", email: "", phone: "",
    service: "Plumbing", address: "", details: "PRIVATE_LEAD", notes: "", stage: "contacted", source: "website",
  });
  const until = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  for (const row of rows) await db("estimates").insert({
    id: row.id, workspaceId, name: `Summary estimate ${String(row.index).padStart(2, "0")}`,
    parentType: row.index === 16 ? "lead" : "job",
    jobId: row.index < 14 ? jobId : row.index < 16 ? otherJobId : null,
    leadId: row.index === 16 ? leadId : null, customerId: row.index === 16 ? null : customerId,
    ownerId: users.owner, createdBy: users.owner, status: row.index === 16 ? "accepted" : "sent",
    totalCents: row.totalCents, validUntil: until, internalNotes: "PRIVATE_ESTIMATE",
    recipientEmail: "RECIPIENT_SECRET@example.test",
    sentAt: new Date(Date.now() - 15 * 86400000),
    archivedAt: row.index === 13 ? new Date() : null,
    decidedAt: row.index === 16 ? new Date() : null, decisionChannel: row.index === 16 ? "phone" : null,
    updatedAt: new Date(Date.now() - row.index * 1000),
  });
});
test.beforeEach(async () => {
  await db("chatTurns").where({ workspaceId }).whereNotIn("state", ["accepted", "running"]).update({ createdAt: new Date(Date.now() - 120000) });
});
test.afterAll(async () => {
  if (workspaceId) await db("workspaces").where({ id: workspaceId }).delete();
  if (Object.values(users).length) await db("users").whereIn("id", Object.values(users)).delete();
  await Promise.all(Object.values(clients).map(client => client.dispose()));
  await db.destroy();
});

async function send(role = "owner", request: EstimateRequest = { operation: "search", input: filters }, patch = {}) {
  const response = await clients[role].post("/api/chat/turns", {
    headers, data: { workspaceId, clientTurnId: randomUUID(), surfaceKey: "home", message: `fixture:estimate:${JSON.stringify(request)}`, ...patch },
  });
  expect(response.status()).toBe(200);
  const body = await response.text();
  const events = body.split("\n\n").filter(line => line.startsWith("data: ")).map(line => chatStreamEventSchema.parse(JSON.parse(line.slice(6))));
  const accepted = events[0];
  if (accepted.type !== "turn.accepted") throw new Error("Estimate chat was not accepted.");
  const resultEvent = events.find(event => event.type === "estimates.result");
  const result: EstimateChatResult | undefined = resultEvent?.type === "estimates.result" ? resultEvent.result : undefined;
  return { accepted, result, events, body };
}
async function history(role: string, threadId: string) {
  return (await clients[role].get(`/api/chat/threads?workspace=${workspaceId}&thread=${threadId}`)).json();
}
async function navigate(role: string, result: EstimateChatResult, estimateId?: string, patch = {}) {
  return clients[role].post("/api/chat/estimates/navigate", { headers, data: {
    workspaceId, turnId: result.turnId, resultId: result.detail?.id ?? result.summaries[0].id, ...(estimateId ? { estimateId } : {}), ...patch,
  } });
}
function requireResult(result: EstimateChatResult | undefined): EstimateChatResult {
  expect(result).toBeDefined();
  if (!result) throw new Error("Estimate summary missing.");
  return result;
}

test("scoped SQL totals, ten rows, durable summaries and private-field redaction", async () => {
  const before = await db("estimates").where({ workspaceId }).select("id", "version", "updatedAt").orderBy("id");
  for (const role of ["owner", "field"]) {
    const run = await send(role);
    expect(run.events.at(-1)?.type).toBe("turn.completed");
    const result = requireResult(run.result);
    const expected = rows.filter(row => row.index !== 13 && (role !== "field" || row.index < 14));
    expect(result.summaries[0]).toMatchObject({
      totalMatches: expected.length,
      totalCents: expected.reduce((sum, row) => sum + row.totalCents, 0),
      scope: role === "field" ? "assigned" : "workspace",
    });
    expect(result.summaries[0].rows).toHaveLength(10);
    expect(result.summaries[0].rows[0].id).toBe(rows[0].id);
    for (const sentinel of ["PRIVATE_", "CUSTOMER_SECRET", "RECIPIENT_SECRET"]) expect(run.body).not.toContain(sentinel);
    const saved = await history(role, run.accepted.threadId);
    expect(saved.turns[0].estimateResult).toEqual(result);
    expect(saved.turns[0].estimateStamp).toMatch(/^[a-f0-9]{32}$/);
  }
  expect(await db("estimates").where({ workspaceId }).select("id", "version", "updatedAt").orderBy("id")).toEqual(before);
});

test("retry replays the completed turn rather than generating or persisting a second summary", async () => {
  const run = await send();
  const turn = await db("chatTurns").where({ id: run.accepted.turnId }).first("clientTurnId", "estimateResult");
  const response = await clients.owner.post("/api/chat/turns", {
    headers, data: {
      workspaceId, clientTurnId: turn.clientTurnId, surfaceKey: "home",
      message: `fixture:estimate:${JSON.stringify({ operation: "search", input: filters })}`,
    },
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ replay: true, state: "completed", turnId: run.accepted.turnId });
  expect((await db("chatTurns").where({ id: run.accepted.turnId }).first("estimateResult")).estimateResult).toEqual(turn.estimateResult);
});

test("navigation rechecks owned turn, saved group membership and exact supported filters", async () => {
  const run = await send();
  const result = requireResult(run.result);
  expect((await navigate("owner", result, rows[0].id)).status()).toBe(200);
  expect((await (await navigate("owner", result)).json()).href).toBe(`/estimates?workspace=${workspaceId}`);
  for (const [role, estimateId, patch] of [
    ["other", rows[0].id, {}], ["owner", rows[15].id, {}],
    ["owner", rows[0].id, { resultId: randomUUID() }],
    ["owner", rows[0].id, { turnId: randomUUID() }],
    ["owner", rows[0].id, { workspaceId: randomUUID() }],
  ] as const) expect((await navigate(role, result, estimateId, patch)).status()).toBe(404);
  expect((await clients.owner.post("/api/chat/estimates/navigate", { data: {
    workspaceId, turnId: result.turnId, resultId: result.summaries[0].id,
  } })).status()).toBe(403);
  expect((await navigate("owner", result, undefined, { href: "/jobs" })).status()).toBe(422);
  const narrow = requireResult((await send("owner", { operation: "search", input: { ...filters, customer: "Summary Customer" } })).result);
  expect(narrow.summaries[0].canOpenList).toBe(false);
  expect((await navigate("owner", narrow)).status()).toBe(404);
});

test("current Awaiting filters, hidden access and aging groups stay faithful to the list", async () => {
  const current: EstimateChatFilters = { ...filters, quickFilter: "awaiting" };
  const run = await send("owner", { operation: "list", input: { useCurrentFilters: true } }, {
    surfaceKey: "estimates.list", estimateFilters: current,
  });
  const result = requireResult(run.result);
  expect(result.summaries[0].totalMatches).toBe(15);
  expect((await (await navigate("owner", result)).json()).href).toContain("quickFilter=awaiting");
  const hidden = await send("field", { operation: "search", input: { ...filters, includeHidden: true } });
  expect(hidden.events.at(-1)).toMatchObject({ type: "turn.failed", code: "access_denied" });
  expect(hidden.result).toBeUndefined();
  const aging = requireResult((await send("owner", { operation: "aging", input: { waitingDays: 7, expiringWithinDays: 7, limit: 20 } })).result);
  expect(aging.summaries.map(summary => summary.totalMatches)).toEqual([15, 15, 1]);
  expect(aging.summaries.map(summary => summary.canOpenList)).toEqual([false, true, false]);
  expect((await navigate("owner", aging)).status()).toBe(404);
});

test("record changes redact retained answers, cards and inherited follow-up text", async () => {
  const run = await send("field");
  const result = requireResult(run.result);
  const follow = await send("field", { operation: "list", input: { useCurrentFilters: false } }, {
    threadId: run.accepted.threadId, message: "fixture:estimate-history",
  });
  expect(follow.body).toContain("Authorized Estimate summary");
  await db("jobs").where({ workspaceId, id: jobId }).update({ primaryOwnerId: users.owner });
  try {
    const saved = await history("field", run.accepted.threadId);
    expect(saved.turns.every((turn: { estimateResult?: unknown; estimateStamp?: string }) => !turn.estimateResult && !turn.estimateStamp)).toBe(true);
    expect(saved.messages.filter((message: { role: string }) => message.role === "assistant").every(
      (message: { text: string }) => !message.text.includes("Summary estimate") && !message.text.includes("Authorized Estimate summary"),
    )).toBe(true);
    expect((await navigate("field", result, rows[0].id)).status()).toBe(404);
  } finally {
    await db("jobs").where({ workspaceId, id: jobId }).update({ primaryOwnerId: users.field });
  }
});

test("empty-result evidence and permission changes invalidate saved summary identities", async () => {
  const empty = await send("owner", { operation: "search", input: { ...filters, query: "Empty epoch sentinel" } });
  expect(requireResult(empty.result).summaries[0]).toMatchObject({ totalMatches: 0, totalCents: 0, rows: [] });
  await db("estimates").where({ workspaceId, id: rows[0].id }).update({ name: "Empty epoch sentinel" });
  try {
    expect((await history("owner", empty.accepted.threadId)).turns[0].estimateResult).toBeUndefined();
  } finally {
    await db("estimates").where({ workspaceId, id: rows[0].id }).update({ name: "Summary estimate 00" });
  }
  const field = await send("field");
  const grant = await db("workspaceRolePolicies").where({ workspaceId, role: "field", permission: "estimates.read" }).first();
  await db("workspaceRolePolicies").where({ workspaceId, role: "field", permission: "estimates.read" }).delete();
  try {
    expect((await clients.field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${field.accepted.threadId}`)).status()).toBe(403);
    expect((await navigate("field", requireResult(field.result))).status()).toBe(404);
  } finally {
    await db("workspaceRolePolicies").insert(grant);
  }
});

test("a change during an empty-result stream blocks later text, result release and restored text", async () => {
  const clientTurnId = randomUUID();
  const pending = clients.owner.post("/api/chat/turns", { headers, data: {
    workspaceId, clientTurnId, surfaceKey: "home",
    message: `fixture:estimate-slow:${JSON.stringify({ operation: "search", input: { ...filters, query: "Stream epoch sentinel" } })}`,
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
  await db("estimates").where({ workspaceId, id: rows[0].id }).update({ name: "Stream epoch sentinel" });
  try {
    const response = await pending;
    const body = await response.text();
    expect(body).toContain("access_denied");
    expect(body).not.toContain("Estimate fixture complete.");
    expect(body).not.toContain("estimates.result");
    if (!turn) throw new Error("Streaming turn missing.");
    const saved = await history("owner", turn.threadId);
    expect(saved.turns[0].estimateResult).toBeUndefined();
    expect(saved.messages.filter((message: { role: string }) => message.role === "assistant").every(
      (message: { text: string }) => !message.text.includes("Authorized Estimate summary"),
    )).toBe(true);
  } finally {
    await db("estimates").where({ workspaceId, id: rows[0].id }).update({ name: "Summary estimate 00" });
  }
});

test("live cards survive reload and navigate through checked list and record destinations", async ({ page }) => {
  await page.context().addCookies((await clients.owner.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await page.getByRole("textbox", { name: "Ask the SalesMora assistant" }).fill(`fixture:estimate:${JSON.stringify({ operation: "search", input: filters })}`);
  await page.getByRole("button", { name: "Ask assistant", exact: true }).click();
  const card = page.getByRole("region", { name: "Estimate summary", exact: true });
  await expect(card).toBeVisible();
  await expect(card.getByText("16", { exact: true })).toBeVisible();
  await expect(card.getByRole("button", { name: /EST-.*Summary estimate/ })).toHaveCount(10);
  await page.reload();
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Open matching list", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/estimates\\?workspace=${workspaceId}`));
  await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
  await card.getByRole("button", { name: /EST-.*Summary estimate 00/ }).click();
  await expect(page).toHaveURL(new RegExp(`/estimates/${rows[0].id}\\?workspace=${workspaceId}`), { timeout: 30000 });
});

test.describe("detailed Estimate reads", () => {
  let draft: EstimateDraftSaveResult;
  let frozen: EstimateDraftSaveResult;
  let published: EstimateDraftSaveResult;
  let newer: EstimateDraftSaveResult;
  let emptyDraft: EstimateDraftSaveResult;
  let leadDraft: EstimateDraftSaveResult;
  const until = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  function values(name: string): EstimateDraftValues {
    return {
      details: {
        name, recipientName: "PRIVATE_RECIPIENT", recipientEmail: "PRIVATE_RECIPIENT@example.test",
        serviceAddress: "PRIVATE_ESTIMATE_ADDRESS", ownerId: users.owner,
      },
      items: [
        { description: "Detailed materials", quantity: "1", unitPrice: "600.00", taxable: true, included: false, unit: "each" },
        { description: "Detailed installation", quantity: "1", unitPrice: "400.00", taxable: false, included: false, unit: "job" },
      ],
      totals: { discount: { type: "percent", value: "10" }, taxRate: "8.875" },
      terms: {
        message: "", validUntil: until, paymentTerms: "", termsNote: "",
        deposit: { type: "percent", value: "25" },
      },
      scope: "Saved repair scope.\n<script>literal scope text</script>",
      internalNotes: "PRIVATE_EDITOR_NOTE",
      paymentLink: "https://example.test/PRIVATE_PAYMENT",
    };
  }
  async function create(input: EstimateDraftValues, parentType: "job" | "lead" = "job"): Promise<EstimateDraftSaveResult> {
    const response = await clients.owner.post("/api/estimates", {
      headers, data: { workspaceId, submissionId: randomUUID(), parentType, parentId: parentType === "job" ? jobId : leadId, values: input },
    });
    expect(response.status()).toBe(201);
    return response.json();
  }
  async function publish(record: EstimateDraftSaveResult) {
    const url = `/api/estimates/${record.id}/sharing?workspace=${workspaceId}`;
    const review: EstimateSharingReviewResult = await (await clients.owner.get(url)).json();
    const response = await clients.owner.post(url, { headers, data: {
      workspaceId, estimateId: record.id, expectedVersion: record.version, snapshotHash: review.snapshotHash,
      submissionId: randomUUID(), mode: "publish",
    } });
    expect(response.status()).toBe(200);
  }
  function requireCard(result: EstimateChatResult | undefined): EstimateChatReadCard {
    expect(result?.detail).toBeDefined();
    if (!result?.detail) throw new Error("Detailed Estimate card missing.");
    return result.detail;
  }
  async function read(operation: "get" | "explain_totals" | "compare_revisions" | "summarize_scope", estimateRef: string, role = "owner", patch = {}) {
    const run = await send(role, { operation, input: { estimateRef } }, patch);
    expect(run.events.at(-1)?.type).toBe("turn.completed");
    for (const secret of ["PRIVATE_", "CUSTOMER_SECRET", "RECIPIENT_SECRET"]) expect(run.body).not.toContain(secret);
    return { ...run, card: requireCard(run.result) };
  }
  test.beforeAll(async () => {
    const settings = await (await clients.owner.get(`/api/settings/estimates?workspace=${workspaceId}`)).json();
    expect((await clients.owner.put("/api/settings/estimates", { headers, data: {
      workspaceId, expectedVersion: settings.record.version,
      profile: {
        ...settings.record.profile, name: "Detailed Estimate Business", address: "1 Fixture Avenue",
        phone: "555-0100", email: "estimates@example.test", requireServiceAddress: true,
      },
    } })).status()).toBe(200);
    draft = await create(values("Detailed Draft"));
    published = await create(values("Detailed Published"));
    await publish(published);
    frozen = await create(values("Detailed Frozen"));
    await publish(frozen);
    const family: EstimateRevisionFamily = await (await clients.owner.get(`/api/estimates/${frozen.id}/revisions?workspace=${workspaceId}`)).json();
    const revisionResponse = await clients.owner.post(`/api/estimates/${frozen.id}/revise`, { headers, data: {
      workspaceId, estimateId: frozen.id, expectedVersion: family.version,
      snapshotHash: family.snapshotHash, submissionId: randomUUID(),
    } });
    expect(revisionResponse.status()).toBe(201);
    newer = await revisionResponse.json();
    const revised = values("Detailed Revised");
    revised.scope = "Revised saved scope.";
    revised.items[1].unitPrice = "800.00";
    revised.items[0].unit = "box";
    expect((await clients.owner.patch(`/api/estimates/${newer.id}`, { headers, data: {
      workspaceId, estimateId: newer.id, expectedVersion: newer.version, values: revised,
    } })).status()).toBe(200);
    emptyDraft = await create({ ...values("Detailed Empty Draft"), items: [] });
    leadDraft = await create(values("Detailed Lead Draft"), "lead");
  });

  test("details and total explanations use canonical Draft/frozen values, safe delivery/history and no writes", async () => {
    const recordsBefore = await db("estimates").where({ workspaceId }).select("id", "version").orderBy("id");
    const activityBefore = await db("estimate_activity").where({ workspaceId }).count("* as count").first();
    for (const role of ["owner", "field"]) for (const estimate of [draft, published]) {
      const run = await read("get", estimate.id, role);
      expect(run.card.kind).toBe("get");
      if (run.card.kind !== "get") throw new Error("Details missing.");
      expect(run.card.pricing.totals).toMatchObject({
        subtotalCents: 100000, discountCents: 10000, taxableDiscountCents: 6000,
        nonTaxableDiscountCents: 4000, taxableAfterDiscountCents: 54000,
        taxCents: 4793, totalCents: 94793, depositCents: 23698, balanceCents: 71095,
      });
      expect(run.card.pricing.source).toBe(estimate.id === published.id ? "frozen_snapshot" : "current_draft");
      expect(run.card.scope).toBe(role === "field" ? "assigned" : "workspace");
      expect(run.card.delivery.email.state).toBe("not-sent");
      expect(run.card.delivery.link.state).toBe(estimate.id === published.id ? "active" : "not-created");
      if (estimate.id === published.id) expect(run.card.history.events.some(event => event.kind === "published")).toBe(true);
      expect((await history(role, run.accepted.threadId)).turns[0].estimateResult).toEqual(run.result);
    }
    const totals = await read("explain_totals", draft.number);
    expect(totals.card).toMatchObject({ kind: "explain_totals", pricing: { totals: { totalCents: 94793 } } });
    expect(await db("estimates").where({ workspaceId }).select("id", "version").orderBy("id")).toEqual(recordsBefore);
    expect(await db("estimate_activity").where({ workspaceId }).count("* as count").first()).toEqual(activityBefore);
  });

  test("comparison returns exact before/after fields, units and signed complete-total difference", async () => {
    const run = await read("compare_revisions", newer.number);
    if (run.card.kind !== "compare_revisions" || !run.card.comparison) throw new Error("Comparison missing.");
    expect(run.card.comparison).toMatchObject({
      from: { estimate: { id: frozen.id, revision: 1 }, source: "frozen_snapshot", totalCents: 94793 },
      to: { estimate: { id: newer.id, revision: 2 }, source: "current_draft", totalCents: 130793 },
      totalDifferenceCents: 36000, lineItemChangeCount: 2,
    });
    expect(run.card.comparison.fields.map(field => field.field)).toEqual(["name", "scope"]);
    expect(run.card.comparison.lineItemChanges[0]).toMatchObject({ before: { unit: "each" }, after: { unit: "box" } });
    for (const record of [frozen, newer]) expect((await navigate("owner", requireResult(run.result), record.id)).status()).toBe(200);
    expect((await navigate("owner", requireResult(run.result), draft.id)).status()).toBe(404);
    const single = await read("compare_revisions", draft.id);
    expect(single.card).toMatchObject({ kind: "compare_revisions", comparison: null });
  });

  test("scope keeps saved text literal and withholds independently restricted parent context", async () => {
    const run = await read("summarize_scope", draft.id, "field");
    expect(run.card).toMatchObject({
      kind: "summarize_scope",
      estimateScope: { text: values("").scope, truncated: false },
      parent: { type: "job", name: "Summary Job", service: { text: "Plumbing" } },
    });
    const officePolicy = () => db("workspaceRolePolicies").where({ workspaceId, role: "office" });
    const grants = await officePolicy();
    await officePolicy().delete();
    await db("workspaceRolePolicies").insert([
      { workspaceId, role: "office", permission: "estimates.read", scope: "workspace" },
      { workspaceId, role: "office", permission: "assistant.use", scope: "enabled" },
    ]);
    await db("workspaceMemberships").insert({ workspaceId, userId: users.other, role: "office" });
    try {
      const restricted = await read("summarize_scope", leadDraft.id, "other");
      expect(restricted.card).toMatchObject({ kind: "summarize_scope", parent: null, estimateScope: { text: values("").scope } });
    } finally {
      await db("workspaceMemberships").where({ workspaceId, userId: users.other }).delete();
      await officePolicy().delete();
      if (grants.length) await db("workspaceRolePolicies").insert(grants);
    }
  });

  test("unavailable and incomplete reads are explicit; navigation rejects missing/forged saved membership", async () => {
    const empty = await read("explain_totals", emptyDraft.id);
    expect(empty.card).toMatchObject({ kind: "explain_totals", pricing: { issues: ["items"], lineItemCount: 0, totals: { totalCents: null } } });
    for (const reference of [randomUUID(), leadDraft.id]) {
      const inaccessible = await read("get", reference, "field");
      expect(inaccessible.card).toMatchObject({ kind: "unavailable", estimate: null });
      expect((await navigate("field", requireResult(inaccessible.result), draft.id)).status()).toBe(404);
    }
    const run = await read("get", draft.id);
    const result = requireResult(run.result);
    expect((await navigate("owner", result, draft.id)).status()).toBe(200);
    for (const [role, recordId, patch] of [
      ["other", draft.id, {}], ["owner", frozen.id, {}],
      ["owner", draft.id, { resultId: randomUUID() }], ["owner", draft.id, { turnId: randomUUID() }],
    ] as const) expect((await navigate(role, result, recordId, patch)).status()).toBe(404);
    expect((await navigate("owner", result)).status()).toBe(404);
  });

  test("retained detailed answers and inherited follow-ups redact after a saved scope change", async () => {
    const run = await read("summarize_scope", draft.id);
    const followup = await send("owner", { operation: "list", input: { useCurrentFilters: false } }, {
      threadId: run.accepted.threadId, message: "fixture:estimate-history",
    });
    expect(followup.body).toContain("Saved repair scope");
    await db("estimates").where({ workspaceId, id: draft.id }).update({ scope: "Changed scope" });
    try {
      const saved = await history("owner", run.accepted.threadId);
      expect(saved.turns.every((turn: { estimateResult?: unknown }) => !turn.estimateResult)).toBe(true);
      expect(saved.messages.filter((message: { role: string }) => message.role === "assistant").every(
        (message: { text: string }) => !message.text.includes("Saved repair scope"),
      )).toBe(true);
      expect((await navigate("owner", requireResult(run.result), draft.id)).status()).toBe(404);
    } finally {
      await db("estimates").where({ workspaceId, id: draft.id }).update({ scope: values("").scope });
    }
  });

  test("a detailed read changed during streaming releases no later text or card", async () => {
    const clientTurnId = randomUUID();
    const pending = clients.owner.post("/api/chat/turns", { headers, data: {
      workspaceId, clientTurnId, surfaceKey: "home",
      message: `fixture:estimate-slow:${JSON.stringify({ operation: "explain_totals", input: { estimateRef: draft.id } })}`,
    } });
    let started = false;
    for (let attempt = 0; attempt < 200; attempt++) {
      const row = await db("chatTurns as t").join("chatMessages as m", "m.turnId", "t.id")
        .where({ "t.clientTurnId": clientTurnId, "m.role": "assistant" }).where("m.text", "<>", "").first("t.id");
      if (row) { started = true; break; }
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    expect(started).toBe(true);
    await db("estimates").where({ workspaceId, id: draft.id }).update({ scope: "Changed while streaming" });
    try {
      const body = await (await pending).text();
      expect(body).toContain("access_denied");
      expect(body).not.toContain("Estimate fixture complete.");
      expect(body).not.toContain("estimates.result");
    } finally {
      await db("estimates").where({ workspaceId, id: draft.id }).update({ scope: values("").scope });
    }
  });

  test("detailed cards restore after reload and navigate both compared revisions through checked endpoints", async ({ page }) => {
    await page.context().addCookies((await clients.owner.storageState()).cookies);
    await page.goto(`/home?workspace=${workspaceId}`);
    await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
    await page.getByRole("textbox", { name: "Ask the SalesMora assistant" }).fill(
      `fixture:estimate:${JSON.stringify({ operation: "compare_revisions", input: { estimateRef: newer.id } })}`,
    );
    await page.getByRole("button", { name: "Ask assistant", exact: true }).click();
    const card = page.getByRole("region", { name: "Estimate revision comparison", exact: true });
    await expect(card).toBeVisible();
    await expect(card.getByText("$360.00", { exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: `Open ${newer.number} · Revision 1`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/estimates/${frozen.id}\\?workspace=${workspaceId}`), { timeout: 30000 });
    await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: `Open ${newer.number} · Revision 2`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/estimates/${newer.id}\\?workspace=${workspaceId}`), { timeout: 30000 });
  });

  test("assistant CSV handoff opens the existing export review and downloads only after explicit confirmation", async ({ page }) => {
    const request = {
      request: {
        operation: "export",
        filters: {
          query: "",
          status: "sent",
          owner: "all",
          parent: "all",
          includeHidden: false,
          quickFilter: null,
        },
      },
    };
    const response = await clients.owner.post("/api/chat/turns", { headers, data: {
      workspaceId,
      clientTurnId: randomUUID(),
      surfaceKey: "home",
      message: `fixture:estimate-export:${JSON.stringify(request)}`,
    } });
    expect(response.status()).toBe(200);
    const body = await response.text();
    const events = body.split("\n\n").filter(line => line.startsWith("data: "))
      .map(line => chatStreamEventSchema.parse(JSON.parse(line.slice(6))));
    const accepted = events.find(event => event.type === "turn.accepted");
    const resultEvent = events.find(event => event.type === "estimates.result");
    if (accepted?.type !== "turn.accepted" || resultEvent?.type !== "estimates.result") {
      throw new Error(`Missing export handoff result: ${body}`);
    }
    expect(resultEvent.result.operation).toBe("export");
    expect(resultEvent.result.summaries[0]).toMatchObject({
      canOpenList: false,
      canReviewExport: true,
      totalMatches: 15,
    });
    for (const sentinel of ["PRIVATE_ESTIMATE", "RECIPIENT_SECRET", "customer@example.test"]) {
      expect(body).not.toContain(sentinel);
    }

    await page.context().addCookies((await clients.owner.storageState()).cookies);
    await page.addInitScript(({ workspace, thread }) => {
      sessionStorage.setItem(`salesmora-chat:${workspace}`, thread);
    }, { workspace: workspaceId, thread: accepted.threadId });
    let downloadCount = 0;
    page.on("download", () => { downloadCount += 1; });
    page.on("request", requestEvent => {
      if (requestEvent.url().includes("/api/estimates/export") && requestEvent.method() === "GET") {
        downloadCount += 1;
      }
    });
    await page.goto(`/home?workspace=${workspaceId}`);
    await page.getByRole("button", { name: "SalesMora assistant How can I help?", exact: true }).click();
    const summary = page.getByRole("region", { name: "Estimate summary", exact: true });
    await expect(summary.getByRole("button", { name: "Review CSV export" })).toBeVisible();
    await summary.getByRole("button", { name: "Review CSV export" }).click();

    const dialog = page.getByRole("alertdialog", { name: "Export estimates", exact: true });
    await expect(dialog).toBeVisible({ timeout: 30000 });
    await expect(dialog.getByRole("status")).toHaveText("15 estimates in this export");
    expect(downloadCount).toBe(0);
    const downloadPromise = page.waitForEvent("download");
    await dialog.getByRole("button", { name: "Download CSV", exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^salesmora-estimates-\d{4}-\d{2}-\d{2}\.csv$/);
    const path = await download.path();
    expect(path).toBeTruthy();
    if (!path) throw new Error("CSV download did not produce a file.");
    const csv = await readFile(path, "utf8");
    expect(csv).toContain("Estimate number");
    expect(csv).toContain("EST-");
    expect(csv).not.toContain("PRIVATE_ESTIMATE");
    expect(csv).not.toContain("RECIPIENT_SECRET");
    expect(downloadCount).toBe(2);
  });
});
