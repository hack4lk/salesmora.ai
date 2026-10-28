import type { Knex } from "knex";

const permissionGrants: [string, string, string][] = [
  ["owner", "estimates.decide", "workspace"],
  ["admin", "estimates.decide", "workspace"],
  ["office", "estimates.decide", "workspace"],
  ["field", "estimates.decide", "assigned_job"],
  ["owner", "estimates.void", "workspace"],
  ["admin", "estimates.void", "workspace"],
  ["office", "estimates.void", "workspace"],
  ["owner", "estimates.archive", "workspace"],
  ["admin", "estimates.archive", "workspace"],
  ["office", "estimates.archive", "workspace"],
  ["owner", "estimates.delete", "workspace"],
  ["admin", "estimates.delete", "workspace"],
  ["office", "estimates.delete", "workspace"],
  ["owner", "estimates.export", "workspace"],
  ["admin", "estimates.export", "workspace"],
];

export async function up(db: Knex) {
  const rolePolicyChecks = await db.raw(
    `SELECT conname, pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid = '"workspaceRolePolicies"'::regclass AND contype = 'c'`,
  );
  for (const check of rolePolicyChecks.rows as {
    conname: string;
    definition: string;
  }[]) {
    if (
      check.definition.includes("export") &&
      check.definition.includes("delete") &&
      check.definition.includes("archive")
    ) {
      await db.raw(
        'ALTER TABLE "workspaceRolePolicies" DROP CONSTRAINT ??',
        [check.conname],
      );
    }
  }
  await db.raw(`ALTER TABLE "workspaceRolePolicies"
    ADD CONSTRAINT "workspaceRolePolicies_admin_actions_check"
    CHECK (
      (permission NOT LIKE '%.export' AND permission NOT LIKE '%.delete' AND permission NOT LIKE '%.archive')
      OR role IN ('owner','admin')
      OR (permission IN ('estimates.archive','estimates.delete') AND role = 'office')
    )`);

  await db.schema.createTable("workspaceEstimateCounters", (t) => {
    t.uuid("workspaceId")
      .primary()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.integer("lastNumber").notNullable();
    t.check('"lastNumber" > 0');
  });

  await db.schema.createTable("workspaceEstimateSettings", (t) => {
    t.uuid("workspaceId")
      .primary()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.text("businessName").notNullable().defaultTo("");
    t.text("address").notNullable().defaultTo("");
    t.text("phone").notNullable().defaultTo("");
    t.text("replyToEmail").notNullable().defaultTo("");
    t.text("logoFileId").nullable();
    t.text("licenseLine").notNullable().defaultTo("");
    t.integer("defaultTaxRateMilliPercent").notNullable().defaultTo(0);
    t.integer("validForDays").notNullable().defaultTo(30);
    t.jsonb("paymentTermPresets").notNullable().defaultTo("[]");
    t.text("defaultMessage").notNullable().defaultTo("");
    t.text("defaultTerms").notNullable().defaultTo("");
    t.text("defaultDepositType").notNullable().defaultTo("none");
    t.decimal("defaultDepositValue", 12, 3).notNullable().defaultTo(0);
    t.text("numberPrefix").notNullable().defaultTo("EST-");
    t.text("updatedBy").references("id").inTable("users").onDelete("SET NULL");
    t.timestamp("updatedAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.check(
      `"defaultTaxRateMilliPercent" BETWEEN 0 AND 100000 AND "validForDays" BETWEEN 1 AND 365 AND "defaultDepositType" IN ('none','percent','amount') AND "defaultDepositValue" >= 0`,
    );
    t.check(
      `char_length("businessName") <= 200 AND char_length(address) <= 500 AND char_length(phone) <= 100 AND char_length("replyToEmail") <= 254 AND char_length("licenseLine") <= 200 AND char_length("defaultMessage") <= 2000 AND char_length("defaultTerms") <= 5000`,
    );
  });

  await db.schema.createTable("estimates", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId")
      .notNullable()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.integer("estimateNumber").notNullable();
    t.integer("revision").notNullable().defaultTo(1);
    t.text("name").notNullable();
    t.text("status").notNullable().defaultTo("draft");
    t.text("parentType").notNullable();
    t.uuid("leadId").nullable();
    t.uuid("jobId").nullable();
    t.uuid("customerId").nullable();
    t.text("ownerId").nullable();
    t.text("recipientName").notNullable().defaultTo("");
    t.text("recipientEmail").notNullable().defaultTo("");
    t.text("serviceAddress").notNullable().defaultTo("");
    t.text("scope").notNullable().defaultTo("");
    t.text("message").notNullable().defaultTo("");
    t.text("termsNote").notNullable().defaultTo("");
    t.text("paymentTerms").notNullable().defaultTo("");
    t.text("internalNotes").notNullable().defaultTo("");
    t.text("depositType").notNullable().defaultTo("none");
    t.decimal("depositValue", 12, 3).notNullable().defaultTo(0);
    t.integer("taxRateMilliPercent").notNullable().defaultTo(0);
    t.text("discountType").notNullable().defaultTo("none");
    t.decimal("discountValue", 12, 3).notNullable().defaultTo(0);
    for (const amount of [
      "subtotalCents",
      "discountCents",
      "taxCents",
      "totalCents",
      "depositCents",
      "balanceCents",
    ]) {
      t.bigint(amount).nullable();
    }
    t.text("currency").notNullable().defaultTo("USD");
    t.date("validUntil").nullable();
    t.timestamp("sentAt", { useTz: true }).nullable();
    t.timestamp("publishedAt", { useTz: true }).nullable();
    t.timestamp("decidedAt", { useTz: true }).nullable();
    t.text("decidedBy").references("id").inTable("users").onDelete("SET NULL");
    t.text("decisionChannel").nullable();
    t.text("decisionNote").notNullable().defaultTo("");
    t.uuid("supersededById").nullable();
    t.timestamp("archivedAt", { useTz: true }).nullable();
    t.text("archivedBy").references("id").inTable("users").onDelete("SET NULL");
    t.text("voidReason").notNullable().defaultTo("");
    t.integer("version").notNullable().defaultTo(1);
    t.text("createdBy").references("id").inTable("users").onDelete("SET NULL");
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.timestamp("updatedAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.unique(["workspaceId", "id"]);
    t.unique(["workspaceId", "estimateNumber", "revision"]);
    t.index(["workspaceId", "status", "archivedAt", "updatedAt", "id"]);
    t.index(["workspaceId", "estimateNumber", "revision"]);
    t.index(["workspaceId", "leadId"]);
    t.index(["workspaceId", "jobId"]);
    t.index(["workspaceId", "ownerId"]);
    t.index(["workspaceId", "validUntil", "status"]);
    t.foreign(["workspaceId", "leadId"])
      .references(["workspaceId", "id"])
      .inTable("leads");
    t.foreign(["workspaceId", "jobId"])
      .references(["workspaceId", "id"])
      .inTable("jobs");
    t.foreign(["workspaceId", "customerId"])
      .references(["workspaceId", "id"])
      .inTable("customers");
    t.foreign("ownerId").references("id").inTable("users").onDelete("SET NULL");
    t.foreign(["workspaceId", "supersededById"])
      .references(["workspaceId", "id"])
      .inTable("estimates");
    t.check(
      `("parentType" = 'lead' AND "leadId" IS NOT NULL AND "jobId" IS NULL) OR ("parentType" = 'job' AND "jobId" IS NOT NULL AND "leadId" IS NULL)`,
    );
    t.check(
      `status IN ('draft','sent','published','accepted','declined','expired','superseded','void') AND "estimateNumber" > 0 AND revision > 0 AND version > 0`,
    );
    t.check(
      `"depositType" IN ('none','percent','amount') AND "discountType" IN ('none','percent','amount') AND "depositValue" >= 0 AND "discountValue" >= 0 AND "taxRateMilliPercent" BETWEEN 0 AND 100000`,
    );
    t.check(
      `currency = 'USD' AND char_length(name) BETWEEN 1 AND 120 AND char_length("recipientName") <= 200 AND char_length("recipientEmail") <= 254 AND char_length("serviceAddress") <= 500 AND char_length(scope) <= 5000 AND char_length(message) <= 2000 AND char_length("termsNote") <= 5000 AND char_length("paymentTerms") <= 500 AND char_length("internalNotes") <= 5000 AND char_length("decisionNote") <= 500 AND char_length("voidReason") <= 500`,
    );
    t.check(
      `"decisionChannel" IS NULL OR "decisionChannel" IN ('email','phone','in-person','other')`,
    );
    t.check(
      `("subtotalCents" IS NULL OR "subtotalCents" >= 0) AND ("discountCents" IS NULL OR "discountCents" >= 0) AND ("taxCents" IS NULL OR "taxCents" >= 0) AND ("totalCents" IS NULL OR "totalCents" >= 0) AND ("depositCents" IS NULL OR "depositCents" >= 0) AND ("balanceCents" IS NULL OR "balanceCents" >= 0)`,
    );
  });

  await db.raw(`CREATE FUNCTION assign_estimate_number() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
      IF NEW."estimateNumber" IS NULL THEN
        INSERT INTO "workspaceEstimateCounters" ("workspaceId","lastNumber")
        VALUES (NEW."workspaceId",1)
        ON CONFLICT ("workspaceId") DO UPDATE
          SET "lastNumber" = "workspaceEstimateCounters"."lastNumber" + 1
        RETURNING "lastNumber" INTO NEW."estimateNumber";
      END IF;
      RETURN NEW;
    END
  $$`);
  await db.raw(
    'CREATE TRIGGER assign_estimate_number BEFORE INSERT ON estimates FOR EACH ROW EXECUTE FUNCTION assign_estimate_number()',
  );

  await db.schema.createTable("estimate_items", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable();
    t.uuid("estimateId").notNullable();
    t.integer("position").notNullable();
    t.uuid("catalogId").nullable();
    t.text("catalogName").nullable();
    t.text("unit").nullable();
    t.text("sku").nullable();
    t.text("description").notNullable();
    t.decimal("quantity", 12, 3).notNullable();
    t.integer("unitPriceCents").nullable();
    t.boolean("taxable").notNullable().defaultTo(true);
    t.boolean("included").notNullable().defaultTo(false);
    t.bigint("amountCents").nullable();
    t.unique(["workspaceId", "estimateId", "position"]);
    t.foreign(["workspaceId", "estimateId"])
      .references(["workspaceId", "id"])
      .inTable("estimates")
      .onDelete("CASCADE");
    t.check(
      `position >= 0 AND quantity > 0 AND ("unitPriceCents" IS NULL OR "unitPriceCents" BETWEEN 0 AND 100000000)`,
    );
    t.check(
      `("unitPriceCents" IS NULL AND "included" = false) OR ("unitPriceCents" > 0 AND "included" = false) OR ("unitPriceCents" = 0 AND "included" = true)`,
    );
    t.check(
      `("amountCents" IS NULL OR "amountCents" BETWEEN 0 AND 1000000000) AND char_length(description) BETWEEN 1 AND 200`,
    );
  });
  await db.raw(`ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_catalog_fk"
    FOREIGN KEY ("workspaceId","catalogId") REFERENCES "materialCatalog" ("workspaceId","id")
    ON DELETE SET NULL ("catalogId")`);

  await db.schema.createTable("estimate_snapshots", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable();
    t.uuid("estimateId").notNullable();
    t.jsonb("content").notNullable();
    t.string("contentHash", 64).notNullable();
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.unique(["workspaceId", "id"]);
    t.unique(["workspaceId", "estimateId"]);
    t.unique(["workspaceId", "estimateId", "id"]);
    t.foreign(["workspaceId", "estimateId"])
      .references(["workspaceId", "id"])
      .inTable("estimates")
      .onDelete("CASCADE");
    t.check(`"contentHash" ~ '^[0-9a-f]{64}$'`);
  });

  await db.schema.createTable("estimate_share_tokens", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable();
    t.uuid("estimateId").notNullable();
    t.uuid("snapshotId").notNullable();
    t.string("tokenHash", 64).notNullable().unique();
    t.timestamp("expiresAt", { useTz: true }).notNullable();
    t.timestamp("revokedAt", { useTz: true }).nullable();
    t.integer("viewCount").notNullable().defaultTo(0);
    t.timestamp("firstViewedAt", { useTz: true }).nullable();
    t.timestamp("lastViewedAt", { useTz: true }).nullable();
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.unique(["workspaceId", "estimateId", "snapshotId"]);
    t.foreign(["workspaceId", "estimateId", "snapshotId"])
      .references(["workspaceId", "estimateId", "id"])
      .inTable("estimate_snapshots")
      .onDelete("CASCADE");
    t.check(`"tokenHash" ~ '^[0-9a-f]{64}$' AND "viewCount" >= 0`);
  });

  await db.schema.createTable("estimate_deliveries", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable();
    t.uuid("estimateId").notNullable();
    t.uuid("snapshotId").notNullable();
    t.text("recipient").notNullable();
    t.string("recipientHash", 64).notNullable();
    t.text("providerMessageId").nullable();
    t.text("status").notNullable().defaultTo("queued");
    t.text("idempotencyKey").notNullable();
    t.integer("attemptCount").notNullable().defaultTo(0);
    t.timestamp("queuedAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.timestamp("sentAt", { useTz: true }).nullable();
    t.timestamp("bouncedAt", { useTz: true }).nullable();
    t.timestamp("failedAt", { useTz: true }).nullable();
    t.unique(["workspaceId", "idempotencyKey"]);
    t.foreign(["workspaceId", "estimateId", "snapshotId"])
      .references(["workspaceId", "estimateId", "id"])
      .inTable("estimate_snapshots")
      .onDelete("CASCADE");
    t.index(["workspaceId", "estimateId", "queuedAt"]);
    t.check(
      `status IN ('queued','sent','bounced','failed') AND "attemptCount" >= 0 AND char_length(recipient) <= 254 AND "recipientHash" ~ '^[0-9a-f]{64}$'`,
    );
  });

  await db.schema.createTable("estimate_activity", (t) => {
    t.uuid("id").primary();
    t.uuid("workspaceId").notNullable();
    t.uuid("estimateId").notNullable();
    t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.text("actorName").notNullable();
    t.text("source").notNullable();
    t.text("type").notNullable();
    t.jsonb("changes").notNullable().defaultTo("{}");
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.foreign(["workspaceId", "estimateId"])
      .references(["workspaceId", "id"])
      .inTable("estimates")
      .onDelete("CASCADE");
    t.index(["workspaceId", "estimateId", "createdAt", "id"]);
    t.check(`source IN ('ui','assistant-confirmed','worker','system')`);
  });

  await db.schema.createTable("estimate_operation_receipts", (t) => {
    t.uuid("workspaceId")
      .notNullable()
      .references("id")
      .inTable("workspaces")
      .onDelete("CASCADE");
    t.uuid("submissionId").notNullable();
    t.text("actorId").notNullable().references("id").inTable("users");
    t.text("operation").notNullable();
    t.string("inputHash", 64).notNullable();
    t.uuid("estimateId").nullable();
    t.integer("version").notNullable();
    t.timestamp("createdAt", { useTz: true })
      .notNullable()
      .defaultTo(db.fn.now());
    t.primary(["workspaceId", "submissionId"]);
    t.foreign(["workspaceId", "estimateId"])
      .references(["workspaceId", "id"])
      .inTable("estimates");
    t.check(
      `operation IN ('create','send','decision','convert') AND "inputHash" ~ '^[0-9a-f]{64}$' AND version > 0`,
    );
  });

  await db.schema.alterTable("jobs", (t) => {
    t.uuid("acceptedEstimateId").nullable();
  });
  await db.raw(`ALTER TABLE jobs ADD CONSTRAINT jobs_accepted_estimate_fk
    FOREIGN KEY ("workspaceId","acceptedEstimateId") REFERENCES estimates("workspaceId","id")
    ON DELETE SET NULL ("acceptedEstimateId")`);

  const workspaces = await db("workspaces").select("id", "ownerId").orderBy("id");
  for (const workspace of workspaces) {
    await db("workspaces").where({ id: workspace.id }).forUpdate().first();
    const head = await db("workspacePolicies")
      .where({ workspaceId: workspace.id })
      .first("revision");
    if (!head) continue;
    const before = await db("workspaceRolePolicies")
      .where({ workspaceId: workspace.id })
      .select("role", "permission", "scope");
    const inserted = await db("workspaceRolePolicies")
      .insert(
        permissionGrants.map(([role, permission, scope]) => ({
          workspaceId: workspace.id,
          role,
          permission,
          scope,
        })),
      )
      .onConflict(["workspaceId", "role", "permission"])
      .ignore()
      .returning("role");
    if (!inserted.length) continue;
    const after = await db("workspaceRolePolicies")
      .where({ workspaceId: workspace.id })
      .select("role", "permission", "scope");
    await db("workspacePolicies")
      .where({ workspaceId: workspace.id })
      .update({ revision: head.revision + 1, updatedAt: db.fn.now() });
    await db("authorizationAudit").insert({
      workspaceId: workspace.id,
      actorId: workspace.ownerId,
      action: "migration.estimates",
      beforeRevision: head.revision,
      afterRevision: head.revision + 1,
      beforePolicy: JSON.stringify({
        workspaceId: workspace.id,
        revision: head.revision,
        grants: before,
      }),
      afterPolicy: JSON.stringify({
        workspaceId: workspace.id,
        revision: head.revision + 1,
        grants: after,
      }),
    });
  }
}

export async function down() {
  throw new Error(
    "Estimate schema and authorization changes are forward-only. Restore a test database snapshot to roll back.",
  );
}
