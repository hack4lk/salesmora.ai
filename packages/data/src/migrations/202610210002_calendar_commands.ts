import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.createTable("calendarOperations", t => {
    t.uuid("workspaceId").notNullable().references("id").inTable("workspaces").onDelete("CASCADE");
    t.uuid("submissionId").notNullable(); t.text("actorId").references("id").inTable("users").onDelete("SET NULL");
    t.text("inputHash").notNullable(); t.jsonb("result").notNullable();
    t.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(db.fn.now());
    t.primary(["workspaceId", "submissionId"]);
  });
  // Preserve customized policies. Non-Field scheduling inherits existing explicit update authority;
  // Field defaults are adopted only where no Owner has ever saved a customized policy.
  const workspaces = await db("workspacePolicies").select("workspaceId").orderBy("workspaceId");
  for (const { workspaceId } of workspaces) {
    const workspace = await db("workspaces").where({ id: workspaceId }).forUpdate().first("ownerId");
    const head = await db("workspacePolicies").where({ workspaceId }).first();
    const before = await db("workspaceRolePolicies").where({ workspaceId }).select("role", "permission", "scope");
    const customized = !!await db("authorizationAudit").where({ workspaceId, action: "policy.saved" }).first("id");
    const grants = calendarSchedulingGrants(before, customized).map(grant => ({ workspaceId, ...grant }));
    if (grants.length) await db("workspaceRolePolicies").insert(grants).onConflict(["workspaceId", "role", "permission"]).ignore();
    const after = await db("workspaceRolePolicies").where({ workspaceId }).select("role", "permission", "scope");
    if (after.length !== before.length) {
      await db("workspacePolicies").where({ workspaceId }).update({ revision: head.revision + 1, updatedAt: db.fn.now() });
      await db("authorizationAudit").insert({ workspaceId, actorId: workspace.ownerId, action: "migration.calendar-scheduling",
        beforeRevision: head.revision, afterRevision: head.revision + 1,
        beforePolicy: JSON.stringify({ workspaceId, revision: head.revision, grants: before }),
        afterPolicy: JSON.stringify({ workspaceId, revision: head.revision + 1, grants: after }) });
    }
  }
}
export async function down() { throw Error("Calendar scheduling permission cutover is forward-only."); }

/** Frozen migration decision: do not restore any missing Field grant after an Owner customization. */
export function calendarSchedulingGrants(before: { role: string; permission: string; scope: string }[], customized: boolean) {
  const grants: { role: string; permission: string; scope: string }[] = [];
  for (const role of ["owner", "admin", "office"]) {
    if (before.some(g => g.role === role && g.permission === "workorders.update" && g.scope === "workspace")) {
      grants.push({ role, permission: "workorders.schedule.update", scope: "workspace" });
    }
  }
  if (!customized && before.some(g => g.role === "field" && g.permission === "jobs.read" && ["workspace", "assigned"].includes(g.scope))) {
    grants.push({ role: "field", permission: "jobs.schedule.update", scope: "assigned" });
    if (before.some(g => g.role === "field" && g.permission === "workorders.read" && ["workspace", "assigned_job"].includes(g.scope))) {
      grants.push({ role: "field", permission: "workorders.schedule.update", scope: "assigned_job" });
    }
  }
  return grants;
}
