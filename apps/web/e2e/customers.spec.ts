import {
  test,
  expect,
  request as requests,
  type APIRequestContext,
} from "@playwright/test";
import { randomUUID } from "node:crypto";
import { createDatabase } from "@salesmora/data";
test.setTimeout(120000);
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
  prefix = `customers-${randomUUID()}`;
const clients: Record<string, APIRequestContext> = {},
  users: Record<string, string> = {};
let workspaceId: string,
  otherWorkspace: string,
  customerId: string,
  leadId: string;
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
const path = () => `/api/customers?workspace=${workspaceId}`;
const detail = (id = customerId) =>
  `/api/customers/${id}?workspace=${workspaceId}`;
async function change(
  action: string,
  extra: Record<string, unknown> = {},
  version?: number,
) {
  const record = await (await clients.owner.get(detail())).json();
  return clients.owner.patch(`/api/customers/${customerId}`, {
    headers,
    data: {
      workspaceId,
      customerId,
      submissionId: randomUUID(),
      expectedVersion: version ?? record.customer.version,
      action,
      ...extra,
    },
  });
}
test("customer API enforces tenant, role, version, duplicate, relationship and deletion boundaries", async () => {
  const input = { workspaceId, submissionId: randomUUID(), values };
  const created = await clients.owner.post("/api/customers", {
    headers,
    data: input,
  });
  expect(created.status()).toBe(201);
  customerId = (await created.json()).customerId;
  expect(
    (
      await clients.owner.post("/api/customers", { headers, data: input })
    ).status(),
  ).toBe(201);
  expect((await (await clients.owner.get(path())).json()).total).toBe(1);
  const duplicate = await clients.owner.post("/api/customers", {
    headers,
    data: { ...input, submissionId: randomUUID() },
  });
  expect(duplicate.status()).toBe(409);
  expect((await duplicate.json()).matches[0].id).toBe(customerId);
  for (const role of ["admin", "office"])
    expect((await clients[role].get(path())).status()).toBe(200);
  expect((await clients.field.get(path())).status()).toBe(404);
  expect((await clients.field.get(detail())).status()).toBe(404);
  expect((await clients.other.get(detail())).status()).toBe(404);
  expect(
    (await clients.owner.post("/api/customers", { data: input })).status(),
  ).toBe(403);
  expect(
    (
      await clients.owner.post("/api/customers", {
        headers,
        data: {
          ...input,
          workspaceId: otherWorkspace,
          submissionId: randomUUID(),
        },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await change("update", { values: { ...values, phone: "(212) 555-0188" } })
    ).status(),
  ).toBe(200);
  expect((await change("update", { values }, 1)).status()).toBe(409);
  expect(
    await (await clients.owner.get(path() + "&q=2125550188")).json(),
  ).toMatchObject({ total: 1 });
  expect(
    await (await clients.owner.get(path() + "&q=%25%25")).json(),
  ).toMatchObject({ total: 0 });
  expect((await change("note", { body: "Call after 3 pm." })).status()).toBe(
    200,
  );
  const replayBody = {
    workspaceId,
    customerId,
    submissionId: randomUUID(),
    expectedVersion: (await (await clients.owner.get(detail())).json()).customer
      .version,
    action: "note",
    body: "Only one note.",
  };
  for (let i = 0; i < 2; i++)
    expect(
      (
        await clients.owner.patch(`/api/customers/${customerId}`, {
          headers,
          data: replayBody,
        })
      ).status(),
    ).toBe(200);
  expect(
    (await (await clients.owner.get(detail())).json()).notes.filter(
      (n: { body: string }) => n.body === "Only one note.",
    ),
  ).toHaveLength(1);
  leadId = randomUUID();
  await db("leads").insert({
    id: leadId,
    workspaceId,
    createdBy: users.owner,
    submissionId: randomUUID(),
    submissionHash: "fixture",
    name: "Jordan Lead Snapshot",
    email: "",
    phone: "",
    service: "Kitchen repair",
    address: "",
    details: "",
    notes: "",
    source: "website",
    stage: "new",
    ownerId: users.field,
  });
  expect(
    (
      await change("link", {
        leadId,
        expectedLeadVersion: 1,
        expectedPreviousCustomerId: null,
        replace: false,
        unlink: false,
      })
    ).status(),
  ).toBe(200);
  const linked = await (await clients.owner.get(detail())).json();
  expect(linked.customer.openLeadCount).toBe(1);
  expect(linked.leads[0].id).toBe(leadId);
  const fieldLead = await (
    await clients.field.get(`/api/leads/${leadId}?workspace=${workspaceId}`)
  ).json();
  expect(fieldLead.relatedCustomer).toMatchObject({
    name: values.name,
    number: linked.customer.number,
    differs: true,
  });
  expect(fieldLead.relatedCustomer).not.toHaveProperty("internalNotes");
  expect(fieldLead.relatedCustomer).not.toHaveProperty("customerId");
  expect(
    (
      await change("delete", {
        typedConfirmation: linked.customer.number,
        unlinkOpenLeads: false,
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await clients.office.patch(`/api/customers/${customerId}`, {
        headers,
        data: {
          workspaceId,
          customerId,
          submissionId: randomUUID(),
          expectedVersion: linked.customer.version,
          action: "archive",
          archived: true,
        },
      })
    ).status(),
  ).toBe(404);
  expect((await change("archive", { archived: true })).status()).toBe(200);
  expect((await (await clients.owner.get(path())).json()).total).toBe(0);
  expect(
    (await (await clients.owner.get(path() + "&archived=true")).json()).total,
  ).toBe(1);
  expect((await change("archive", { archived: false })).status()).toBe(200);
  const exported = await clients.owner.post("/api/customers/export", {
    headers,
    data: {
      query: { workspaceId },
      columns: ["number", "name", "phone"],
      expectedCount: 1,
    },
  });
  expect(exported.status()).toBe(200);
  expect(await exported.text()).toContain(values.name);
  expect(
    (
      await clients.office.post("/api/customers/export", {
        headers,
        data: { query: { workspaceId }, columns: ["name"], expectedCount: 1 },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await change("delete", {
        typedConfirmation: "CU-9999",
        unlinkOpenLeads: true,
      })
    ).status(),
  ).toBe(422);
  await db("leads").insert(
    Array.from({ length: 25 }, (_, i) => ({
      id: randomUUID(),
      workspaceId,
      customerId,
      createdBy: users.owner,
      submissionId: randomUUID(),
      submissionHash: "fixture",
      name: `Linked ${i}`,
      email: "",
      phone: "",
      service: "Repair",
      address: "",
      details: "",
      notes: "",
      source: "website",
      stage: "new",
      ownerId: null,
    })),
  );
  const leadsFirst = await (await clients.owner.get(detail())).json(),
    leadsNext = await (
      await clients.owner.get(detail() + "&leadsPage=2")
    ).json();
  expect(leadsFirst.leads).toHaveLength(20);
  expect(leadsNext.leads).toHaveLength(6);
  expect(
    leadsNext.leads.some((l: { id: string }) =>
      leadsFirst.leads.some((first: { id: string }) => first.id === l.id),
    ),
  ).toBe(false);
  const officeLeadGrants = await db("workspaceRolePolicies")
    .where({ workspaceId, role: "office" })
    .whereIn("permission", [
      "leads.read",
      "leads.update",
      "leads.stage.update",
      "leads.assign",
    ]);
  await db("workspaceRolePolicies")
    .where({ workspaceId, role: "office", permission: "leads.assign" })
    .delete();
  await db("workspaceRolePolicies")
    .where({ workspaceId, role: "office" })
    .whereIn("permission", ["leads.read", "leads.update", "leads.stage.update"])
    .update({ scope: "assigned" });
  const narrowedResponse = await clients.office.get(detail());
  expect(narrowedResponse.status()).toBe(200);
  const narrowed = await narrowedResponse.json();
  expect(narrowed.leads).toHaveLength(0);
  expect(narrowed.customer.openLeadCount).toBe(0);
  expect(
    narrowed.events.every(
      (event: { source: string }) => event.source === "customer",
    ),
  ).toBe(true);
  await db("workspaceRolePolicies")
    .where({ workspaceId, role: "office" })
    .whereIn(
      "permission",
      officeLeadGrants.map((grant) => grant.permission),
    )
    .delete();
  await db("workspaceRolePolicies").insert(officeLeadGrants);
  const before = await (await clients.owner.get(detail())).json();
  await db("customerActivity").insert(
    Array.from({ length: 25 }, (_, i) => ({
      id: randomUUID(),
      workspaceId,
      customerId,
      actorId: users.owner,
      actorName: "Test owner",
      type: "note",
      body: `Paged note ${i}`,
    })),
  );
  const first = await (await clients.owner.get(detail())).json();
  const second = await (
    await clients.owner.get(detail() + "&notesPage=2&activityPage=2")
  ).json();
  expect(first.notes).toHaveLength(20);
  expect(second.notes.length).toBeGreaterThan(0);
  expect(
    second.notes.some((n: { id: string }) =>
      first.notes.some((f: { id: string }) => f.id === n.id),
    ),
  ).toBe(false);
  const foreignLead = randomUUID();
  await db("leads").insert({
    id: foreignLead,
    workspaceId: otherWorkspace,
    createdBy: users.other,
    submissionId: randomUUID(),
    submissionHash: "fixture",
    name: "Other tenant lead",
    email: "",
    phone: "",
    service: "Private",
    address: "",
    details: "",
    notes: "",
    source: "website",
    stage: "new",
    ownerId: null,
  });
  expect(
    (
      await change("link", {
        leadId: foreignLead,
        expectedLeadVersion: 1,
        expectedPreviousCustomerId: null,
        replace: false,
        unlink: false,
      })
    ).status(),
  ).toBe(404);
  expect(
    (await (await clients.owner.get(detail())).json()).customer.version,
  ).toBe(before.customer.version);
  const latest = await (await clients.owner.get(detail())).json();
  const deletion = {
    workspaceId,
    customerId,
    submissionId: randomUUID(),
    expectedVersion: latest.customer.version,
    action: "delete",
    typedConfirmation: latest.customer.number,
    unlinkOpenLeads: true,
  };
  for (let i = 0; i < 2; i++)
    expect(
      (
        await clients.owner.delete(`/api/customers/${customerId}`, {
          headers,
          data: deletion,
        })
      ).status(),
    ).toBe(200);
  expect((await clients.owner.get(detail())).status()).toBe(404);
  expect(
    (await db("leads").where({ id: leadId }).first()).customerId,
  ).toBeNull();
  expect(await db("customerActivity").where({ customerId })).toHaveLength(0);
});
test("approved customer components create, edit, add notes, archive and navigate live", async ({
  page,
}) => {
  await page.context().addCookies((await clients.owner.storageState()).cookies);
  await page.goto(`/customers?workspace=${workspaceId}`);
  await expect(
    page.getByRole("heading", { name: "Customers", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Customers", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page
    .getByRole("button", { name: "Add customer", exact: true })
    .first()
    .click();
  const modal = page.getByRole("dialog");
  await modal
    .getByRole("textbox", { name: /^Full name/ })
    .fill("Casey Live Customer");
  await modal.getByRole("textbox", { name: /^Phone/ }).fill("(212) 555-0166");
  await modal
    .getByRole("button", { name: "Add customer", exact: true })
    .click();
  await expect(modal).not.toBeVisible();
  const row = page.getByRole("row", { name: /Casey Live Customer/ });
  await expect(row).toBeVisible();
  await row.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Open full profile" }).click();
  await expect(
    page.getByRole("heading", { name: "Casey Live Customer", level: 1 }),
  ).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Edit contact", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("textbox", { name: /^Phone/ })
    .fill("(212) 555-0199");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText("(212) 555-0199", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Team note", exact: true })
    .fill("A live team note.");
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await expect(
    page.getByText("A live team note.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Actions for/ }).click();
  await page.getByRole("menuitem", { name: "Archive customer" }).click();
  await page
    .getByRole("button", { name: "Archive customer", exact: true })
    .click();
  await expect(page.getByText("Archived", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to customers" }).click();
  await expect(
    page.getByRole("row", { name: /Casey Live Customer/ }),
  ).toHaveCount(0);
  await page.getByRole("switch", { name: "Show archived" }).check();
  await expect(
    page.getByRole("row", { name: /Casey Live Customer/ }),
  ).toBeVisible();
  await page.context().clearCookies();
  await page.context().addCookies((await clients.field.storageState()).cookies);
  await page.goto(`/home?workspace=${workspaceId}`);
  await expect(
    page.getByRole("link", { name: "Customers", exact: true }),
  ).toHaveCount(0);
});
