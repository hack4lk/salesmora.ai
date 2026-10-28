import { randomUUID } from "node:crypto";
import {
  expect,
  request as requests,
  test,
  type APIRequestContext,
} from "@playwright/test";
import { createDatabase } from "@salesmora/data";
import {
  chatStreamEventSchema,
  type EstimateChatResult,
} from "@salesmora/contracts";

test.skip(process.env.SALESMORA_LIVE_EVAL !== "1", "Explicit live model evaluation only");
test.setTimeout(120000);

const connection = process.env.TEST_DATABASE_URL;
if (
  !connection ||
  !new URL(connection).pathname.endsWith("_test") ||
  !["127.0.0.1", "localhost"].includes(new URL(connection).hostname) ||
  connection === process.env.DATABASE_URL
) {
  throw new Error("Live Estimate evaluation requires the isolated local test database.");
}
if (
  process.env.SALESMORA_LIVE_EVAL === "1" &&
  (!process.env.OPENAI_API_KEY?.trim() ||
    ["LANGSMITH_TRACING", "LANGCHAIN_TRACING_V2"].some(
      (key) => process.env[key] && process.env[key] !== "false",
    ))
) {
  throw new Error("Live Estimate evaluation requires credentials and disabled tracing.");
}

const db = createDatabase(connection);
const origin = "http://127.0.0.1:3002";
const headers = { Origin: origin };
const customerId = randomUUID();
const jobId = randomUUID();
const estimateId = randomUUID();
const marker = randomUUID();
const estimateName = `Provider acceptance ${marker}`;
const totalCents = 48625;
let workspaceId: string | undefined;
let userId: string | undefined;
let owner: APIRequestContext | undefined;

test.beforeAll(async () => {
  owner = await requests.newContext({ baseURL: origin });
  const email = `estimate-live-${marker}@example.test`;
  const signup = await owner.post("/api/auth/sign-up/email", {
    headers,
    data: {
      name: "Fictional Estimate evaluator",
      email,
      password: "Fictional-estimate-live-42!",
      termsAccepted: true,
    },
  });
  expect(signup.status()).toBe(200);
  const user = await db("users").where({ email }).first("id");
  if (typeof user?.id !== "string") {
    throw new Error("Fictional Estimate evaluator account was not created.");
  }
  const ownerUserId = user.id;
  userId = ownerUserId;

  const workspace = await owner.post("/api/workspaces", {
    headers,
    data: {
      business: { businessName: "Fictional Estimate evaluation", businessType: "plumbing" },
      services: { services: ["repairs"], postalCode: "", serviceRange: "" },
      team: { invitations: [] },
    },
  });
  expect(workspace.status()).toBe(201);
  const createdWorkspaceId = (await workspace.json()).workspaceId;
  if (typeof createdWorkspaceId !== "string") {
    throw new Error("Fictional Estimate evaluator workspace was not created.");
  }
  workspaceId = createdWorkspaceId;
  await db("customers").insert({
    id: customerId,
    workspaceId: createdWorkspaceId,
    name: "Fictional evaluation customer",
    type: "person",
    companyName: "",
    email: `PRIVATE_CUSTOMER_${marker}@example.test`,
    phone: "",
    location: "",
    internalNotes: `PRIVATE_CUSTOMER_NOTE_${marker}`,
  });
  await db("jobs").insert({
    id: jobId,
    workspaceId: createdWorkspaceId,
    customerId,
    customerName: "Fictional evaluation customer",
    title: "Fictional evaluation job",
    service: "Plumbing",
    location: "",
    description: "PRIVATE_JOB_DESCRIPTION",
    primaryOwnerId: ownerUserId,
    createdBy: ownerUserId,
  });
  await db("estimates").insert({
    id: estimateId,
    workspaceId: createdWorkspaceId,
    name: estimateName,
    parentType: "job",
    jobId,
    customerId,
    ownerId: ownerUserId,
    createdBy: ownerUserId,
    status: "sent",
    totalCents,
    internalNotes: `PRIVATE_ESTIMATE_NOTE_${marker}`,
    recipientEmail: `PRIVATE_RECIPIENT_${marker}@example.test`,
    sentAt: new Date(),
  });
});

test.afterAll(async () => {
  if (workspaceId) await db("workspaces").where({ id: workspaceId }).delete();
  if (userId) await db("users").where({ id: userId }).delete();
  if (owner) await owner.dispose();
  await db.destroy();
});

test("live model searches fictional Estimates without changing business records", async () => {
  if (!owner || !workspaceId || !userId) {
    throw new Error("Estimate live fixture was not initialized.");
  }
  const before = await db("estimates")
    .where({ workspaceId })
    .select("id", "version", "updatedAt", "archivedAt");
  const response = await owner.post("/api/chat/turns", {
    headers,
    data: {
      workspaceId,
      clientTurnId: randomUUID(),
      surfaceKey: "home",
      message: `Search the Estimates list for the exact name "${estimateName}". Report its current status and exact total using the retrieved result.`,
    },
  });
  expect(response.status()).toBe(200);

  const events = (await response.text())
    .split("\n\n")
    .filter((frame) => frame.startsWith("data:"))
    .map((frame) => chatStreamEventSchema.parse(JSON.parse(frame.slice(5))));
  const accepted = events[0];
  if (accepted?.type !== "turn.accepted") {
    throw new Error("Live Estimate chat was not accepted.");
  }
  const completion = events.at(-1);
  if (completion?.type === "turn.failed") {
    throw new Error(
      `Live Estimate provider turn failed: ${completion.code} (${events.map((event) => event.type).join(", ")})`,
    );
  }
  expect(completion?.type).toBe("turn.completed");

  const resultEvent = events.find((event) => event.type === "estimates.result");
  if (resultEvent?.type !== "estimates.result") {
    throw new Error("Live model did not retrieve an Estimate result.");
  }
  const result: EstimateChatResult = resultEvent.result;
  expect(result.operation).toBe("search");
  expect(result.summaries).toHaveLength(1);
  expect(result.summaries[0].totalMatches).toBe(1);
  expect(result.summaries[0].totalCents).toBe(totalCents);
  expect(result.summaries[0].rows[0]).toMatchObject({
    id: estimateId,
    name: estimateName,
    status: "sent",
    totalCents,
  });
  const body = events.map((event) => JSON.stringify(event)).join("\n");
  for (const sentinel of [
    `PRIVATE_CUSTOMER_${marker}`,
    `PRIVATE_CUSTOMER_NOTE_${marker}`,
    "PRIVATE_JOB_DESCRIPTION",
    `PRIVATE_ESTIMATE_NOTE_${marker}`,
    `PRIVATE_RECIPIENT_${marker}`,
  ]) {
    expect(body).not.toContain(sentinel);
  }

  const usage = await db("aiUsageCalls").where({
    workspaceId,
    userId,
    turnId: accepted.turnId,
  });
  expect(usage.map((call) => call.phase)).toEqual(expect.arrayContaining(["answer", "planning"]));
  expect(usage.every((call) => call.outcome === "completed")).toBe(true);
  const after = await db("estimates")
    .where({ workspaceId })
    .select("id", "version", "updatedAt", "archivedAt");
  expect(after).toEqual(before);
});
