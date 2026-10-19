import {
  test,
  expect,
  request as requests,
  type APIRequestContext,
} from "@playwright/test";
import {
  chatStreamEventSchema,
  type CustomerChatDraft,
} from "@salesmora/contracts";
import { randomUUID } from "node:crypto";
import { createDatabase } from "@salesmora/data";
test.setTimeout(180000);
const connection = process.env.TEST_DATABASE_URL;
if (
  !connection ||
  !new URL(connection).pathname.endsWith("_test") ||
  connection === process.env.DATABASE_URL
)
  throw Error("Use the isolated test database.");
const db = createDatabase(connection),
  origin = "http://127.0.0.1:3002",
  headers = { Origin: origin },
  prefix = `customer-chat-${randomUUID()}`;
const clients: Record<string, APIRequestContext> = {},
  users: Record<string, string> = {};
let workspaceId: string, otherWorkspace: string;
const values = {
  name: "Jordan Customer Test",
  type: "person",
  companyName: "",
  email: "jordan@example.test",
  phone: "(212) 555-0134",
  location: "Brooklyn",
  internalNotes: "Private customer note",
  ownerId: "",
};
test.beforeAll(async () => {
  await db("rateLimits").delete();
  for (const role of ["owner", "admin", "office", "field", "other"]) {
    clients[role] = await requests.newContext({ baseURL: origin });
    const email = `${prefix}-${role}@example.test`;
    expect(
      (
        await clients[role].post("/api/auth/sign-up/email", {
          headers,
          data: {
            name: `Customer test ${role}`,
            email,
            password: "Fictional-test-password-42!",
            termsAccepted: true,
          },
        })
      ).status(),
    ).toBe(200);
    users[role] = (await db("users").where({ email }).first()).id;
  }
  const business = {
    business: {
      businessName: "Customer Test Workspace",
      businessType: "plumbing",
    },
    services: { services: ["repairs"], postalCode: "", serviceRange: "" },
    team: { invitations: [] },
  };
  const a = await clients.owner.post("/api/workspaces", {
      headers,
      data: business,
    }),
    b = await clients.other.post("/api/workspaces", {
      headers,
      data: business,
    });
  expect(a.status()).toBe(201);
  expect(b.status()).toBe(201);
  workspaceId = (await a.json()).workspaceId;
  otherWorkspace = (await b.json()).workspaceId;
  await db("workspaceMemberships").insert(
    ["admin", "office", "field"].map((role) => ({
      workspaceId,
      userId: users[role],
      role,
    })),
  );
});
test.afterAll(async () => {
  if (Object.values(users).length)
    await db("users").whereIn("id", Object.values(users)).delete();
  await Promise.all(Object.values(clients).map((c) => c.dispose()));
  await db.destroy();
});

const filters = {
  q: "",
  relationship: "all",
  owner: "all",
  type: "all",
  sort: "name",
  archived: false,
};
async function ask(
  role: string,
  operation: string,
  input: unknown,
  extra: Record<string, unknown> = {},
) {
  await db("chatTurns")
    .where({ workspaceId })
    .whereNotIn("state", ["accepted", "running"])
    .update({ createdAt: new Date(Date.now() - 120000) });
  const response = await clients[role].post("/api/chat/turns", {
    headers,
    data: {
      workspaceId,
      clientTurnId: randomUUID(),
      surfaceKey: "home",
      message:
        "fixture:customer:" +
        JSON.stringify({
          tool: [
            "related_contact",
            "search",
            "details",
            "history",
            "linked_leads",
            "lead_candidates",
            "members",
          ].includes(operation)
            ? "customers_query"
            : "customers_propose_action",
          request: { operation, input },
        }),
      ...extra,
    },
  });
  expect(response.status()).toBe(200);
  const events = (await response.text())
    .split("\n\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => chatStreamEventSchema.parse(JSON.parse(line.slice(6))));
  const result = events.find((e) => e.type === "customers.result");
  const accepted = events.find((e) => e.type === "turn.accepted");
  return {
    events,
    result: result?.type === "customers.result" ? result.result : undefined,
    threadId:
      accepted?.type === "turn.accepted" ? accepted.threadId : undefined,
    turnId: accepted?.turnId,
  };
}
async function decide(
  role: string,
  draft: CustomerChatDraft,
  extra: Record<string, unknown> = {},
) {
  return clients[role].post("/api/chat/customers/actions", {
    headers,
    data: {
      workspaceId,
      draftId: draft.id,
      inputHash: draft.inputHash,
      decision: "confirm",
      ...extra,
    },
  });
}
async function seed() {
  const res = await clients.owner.post("/api/customers", {
    headers,
    data: {
      workspaceId,
      submissionId: randomUUID(),
      values: { ...values, name: "Customer " + randomUUID(), email: "" },
      allowDuplicate: true,
    },
  });
  expect(res.status()).toBe(201);
  return (await res.json()).customerId as string;
}
async function lead(
  customerId: string | null = null,
  ownerId: string | null = null,
) {
  const id = randomUUID();
  await db("leads").insert({
    id,
    workspaceId,
    customerId,
    createdBy: users.owner,
    submissionId: randomUUID(),
    submissionHash: "fixture",
    name: "Lead for customer chat",
    email: "lead@example.test",
    phone: "2125550100",
    service: "Repair",
    address: "",
    details: "",
    notes: "",
    source: "website",
    stage: "new",
    ownerId,
  });
  return id;
}
test("customer assistant reads and confirms create, multi-field edits, assignment, notes, links, lifecycle, export and deletion", async () => {
  const proposal = await ask("owner", "create", {
    values: { ...values, ownerId: "Customer test owner" },
    allowDuplicate: false,
  });
  const draft = proposal.result?.draft;
  expect(draft?.action).toBe("create");
  expect(
    await db("customers").where({ workspaceId, name: values.name }),
  ).toHaveLength(0);
  let response = await decide("owner", draft!);
  expect(response.status()).toBe(200);
  const created = (await response.json()).draft;
  const id = created.customer.id;
  expect((await decide("owner", draft!)).status()).toBe(200);
  expect(
    await db("customers").where({ workspaceId, name: values.name }),
  ).toHaveLength(1);
  const duplicate = await ask("owner", "create", {
    values,
    allowDuplicate: false,
  });
  expect(duplicate.result?.draft).toBeUndefined();
  expect(duplicate.result?.records[0].id).toBe(id);
  const duplicateOverride = await ask("owner", "create", {
    values,
    allowDuplicate: true,
  });
  expect(duplicateOverride.result?.draft?.impact).toContain(
    "possible duplicates",
  );
  expect(
    (
      await decide("owner", duplicateOverride.result!.draft!, {
        decision: "cancel",
      })
    ).status(),
  ).toBe(200);
  expect(
    await db("customers").where({ workspaceId, name: values.name }),
  ).toHaveLength(1);
  const search = await ask("owner", "search", {
    filters: { ...filters, q: values.name },
  });
  expect(search.result?.records[0].id).toBe(id);
  const details = await ask(
    "owner",
    "details",
    { customerRef: "" },
    { surfaceKey: "customer.detail", recordRefs: [{ type: "customer", id }] },
  );
  expect(details.result?.fields.some((f) => f.value === values.phone)).toBe(
    true,
  );
  const update = await ask("owner", "update", {
    customerRef: id,
    changes: [
      { field: "phone", value: "2125550199" },
      { field: "location", value: "Queens" },
    ],
  });
  expect(update.result?.draft?.changes).toHaveLength(2);
  expect((await decide("owner", update.result!.draft!)).status()).toBe(200);
  const members = await ask("owner", "members", { query: "office" });
  expect(
    members.result?.fields.some((f) => f.value.includes(users.office)),
  ).toBe(true);
  const assign = await ask("owner", "assign", {
    customerRef: id,
    teammateRef: users.office,
  });
  expect((await decide("owner", assign.result!.draft!)).status()).toBe(200);
  expect((await db("customers").where({ id }).first()).ownerId).toBe(
    users.office,
  );
  const note = await ask("office", "add_note", {
    customerRef: id,
    body: "Please call after three.",
  });
  expect((await decide("office", note.result!.draft!)).status()).toBe(200);
  const history = await ask("office", "history", {
    customerRef: id,
    mode: "notes",
    page: 1,
  });
  expect(history.result?.entries[0].text).toBe("Please call after three.");
  const beyond = await ask("office", "history", {
    customerRef: id,
    mode: "notes",
    page: 2,
  });
  expect(beyond.result?.kind).toBe("outcome");
  expect(beyond.result?.entries).toHaveLength(0);
  const leadId = await lead();
  const candidates = await ask("owner", "lead_candidates", {
    customerRef: id,
    query: "Lead for",
  });
  expect(candidates.result?.records.some((r) => r.id === leadId)).toBe(true);
  const link = await ask("owner", "link_lead", {
    customerRef: id,
    leadRef: leadId,
    replace: false,
  });
  expect((await decide("owner", link.result!.draft!)).status()).toBe(200);
  const linked = await ask("owner", "linked_leads", {
    customerRef: id,
    page: 1,
  });
  expect(linked.result?.records[0].id).toBe(leadId);
  const unlink = await ask("owner", "unlink_lead", {
    customerRef: id,
    leadRef: leadId,
  });
  expect((await decide("owner", unlink.result!.draft!)).status()).toBe(200);
  expect(
    (await db("leads").where({ id: leadId }).first()).customerId,
  ).toBeNull();
  const archive = await ask("owner", "set_archived", {
    customerRef: id,
    archived: true,
  });
  expect((await decide("owner", archive.result!.draft!)).status()).toBe(200);
  const restore = await ask("owner", "set_archived", {
    customerRef: id,
    archived: false,
  });
  expect((await decide("owner", restore.result!.draft!)).status()).toBe(200);
  const exporting = await ask("owner", "export_csv", {
    mode: "customer",
    customerRef: id,
    filters,
    columns: ["number", "name", "phone"],
  });
  response = await decide("owner", exporting.result!.draft!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/csv");
  expect(await response.text()).toContain("2125550199");
  await db("leads").where({ id: leadId }).update({ customerId: id });
  const deletion = await ask("owner", "delete", { customerRef: id });
  const deletionDraft = deletion.result!.draft!;
  expect(deletionDraft.unlinkLeadCount).toBe(1);
  expect(
    (
      await decide("owner", deletionDraft, {
        typedConfirmation: "wrong",
        unlinkOpenLeads: true,
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await decide("owner", deletionDraft, {
        typedConfirmation: deletionDraft.customer.number,
        unlinkOpenLeads: false,
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await decide("owner", deletionDraft, {
        typedConfirmation: deletionDraft.customer.number,
        unlinkOpenLeads: true,
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await decide("owner", deletionDraft, {
        typedConfirmation: deletionDraft.customer.number,
        unlinkOpenLeads: true,
      })
    ).status(),
  ).toBe(200);
  expect(await db("customers").where({ id })).toHaveLength(0);
  expect(
    (await db("leads").where({ id: leadId }).first()).customerId,
  ).toBeNull();
  const retained = await db("chatCustomerDrafts")
    .where({ id: deletionDraft.id })
    .first();
  expect(retained.payload).toEqual({ kind: "deleted" });
  expect(retained.review.customer.name).toBe("");
});
test("customer assistant denies forged, cross-workspace, stale and revoked approvals; Field only reads assigned minimal contacts", async () => {
  const id = await seed(),
    leadId = await lead(id, users.field);
  for (const operation of ["details", "delete"]) {
    const denied = await ask("field", operation, { customerRef: id });
    expect(denied.result).toBeUndefined();
    expect(denied.events.at(-1)?.type).toBe("turn.failed");
  }
  const related = await ask("field", "related_contact", { leadRef: leadId });
  expect(related.result?.fields.map((f) => f.label)).toEqual([
    "Customer number",
    "Name",
    "Email",
    "Phone",
  ]);
  expect(JSON.stringify(related.result)).not.toContain("Private customer note");
  await db("leads")
    .where({ id: leadId })
    .update({ ownerId: users.owner, version: db.raw("version+1") });
  expect(
    (await ask("field", "related_contact", { leadRef: leadId })).result,
  ).toBeUndefined();
  const foreign = await clients.other.post("/api/customers", {
    headers,
    data: {
      workspaceId: otherWorkspace,
      submissionId: randomUUID(),
      values,
      allowDuplicate: false,
    },
  });
  const foreignId = (await foreign.json()).customerId;
  expect(
    (await ask("owner", "details", { customerRef: foreignId })).result,
  ).toBeUndefined();
  const stale = await ask("owner", "update", {
    customerRef: id,
    changes: [{ field: "phone", value: "2125550111" }],
  });
  await db("customers")
    .where({ id })
    .update({ version: db.raw("version+1") });
  expect((await decide("owner", stale.result!.draft!)).status()).toBe(404);
  const draft = await ask("office", "update", {
    customerRef: id,
    changes: [{ field: "phone", value: "2125550111" }],
  });
  expect((await decide("owner", draft.result!.draft!)).status()).toBe(404);
  expect(
    (
      await decide("office", {
        ...draft.result!.draft!,
        inputHash: "f".repeat(64),
      })
    ).status(),
  ).toBe(409);
  await db("workspaceRolePolicies")
    .where({ workspaceId, role: "office" })
    .whereIn("permission", ["customers.update"])
    .delete();
  expect((await decide("office", draft.result!.draft!)).status()).toBe(404);
  const replay = await clients.office.get(
    `/api/chat/threads?workspace=${workspaceId}&thread=${draft.threadId}`,
  );
  expect(replay.status()).toBe(200);
  expect((await replay.json()).turns[0].customerResult).toBeUndefined();
  expect((await db("customers").where({ id }).first()).phone).not.toBe(
    "2125550111",
  );
});
test("live customer chat cards use current profile context, confirm edits, survive refresh and redirect after typed deletion", async ({
  page,
}) => {
  const id = await seed();
  const customer = await db("customers").where({ id }).first();
  await page.context().addCookies((await clients.owner.storageState()).cookies);
  await page.goto(`/customers/${id}?workspace=${workspaceId}`);
  await page
    .getByRole("button", {
      name: "SalesMora assistant How can I help?",
      exact: true,
    })
    .click();
  const composer = page.getByRole("textbox", {
    name: "Ask the SalesMora assistant",
    exact: true,
  });
  await composer.fill(
    "fixture:customer:" +
      JSON.stringify({
        tool: "customers_propose_action",
        request: {
          operation: "update",
          input: {
            customerRef: "",
            changes: [
              { field: "phone", value: "2125550188" },
              { field: "location", value: "Manhattan" },
            ],
          },
        },
      }),
  );
  await page
    .getByRole("button", { name: "Ask assistant", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Update customer", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByRole("dialog").getByText("Manhattan", { exact: true }),
  ).toBeVisible();
  expect((await db("customers").where({ id }).first()).phone).not.toBe(
    "2125550188",
  );
  await page
    .getByRole("button", { name: "Confirm change", exact: true })
    .click();
  await expect(
    page.getByText("Change confirmed", { exact: true }),
  ).toBeVisible();
  expect((await db("customers").where({ id }).first()).phone).toBe(
    "2125550188",
  );
  await page.getByRole("button", { name: "Close chat", exact: true }).click();
  await expect(
    page
      .getByRole("region", { name: "Contact details", exact: true })
      .getByText("2125550188", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await page.reload();
  await page
    .getByRole("button", {
      name: "SalesMora assistant How can I help?",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Change confirmed", { exact: true }),
  ).toBeVisible();
  await composer.fill(
    "fixture:customer:" +
      JSON.stringify({
        tool: "customers_propose_action",
        request: { operation: "delete", input: { customerRef: "" } },
      }),
  );
  await page
    .getByRole("button", { name: "Ask assistant", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Delete customer permanently",
      exact: true,
    }),
  ).toBeVisible();
  const number = "CU-" + String(customer.customerNumber).padStart(4, "0");
  await page
    .getByRole("textbox", {
      name: `Type ${number} to confirm deletion`,
      exact: true,
    })
    .fill(number);
  await page
    .getByRole("button", { name: "Confirm change", exact: true })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/customers\\?workspace=${workspaceId}`),
    { timeout: 30000 },
  );
  expect(await db("customers").where({ id })).toHaveLength(0);
});
