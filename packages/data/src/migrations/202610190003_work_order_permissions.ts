import type { Knex } from "knex";

/** Seeded template grants for the work-order permissions (frozen here so later catalog edits never rewrite history). */
const grants: [string, string, string][] = [
  ["owner", "workorders.read", "workspace"],
  ["admin", "workorders.read", "workspace"],
  ["office", "workorders.read", "workspace"],
  ["field", "workorders.read", "assigned_job"],
  ["owner", "workorders.create", "enabled"],
  ["admin", "workorders.create", "enabled"],
  ["office", "workorders.create", "enabled"],
  ["owner", "workorders.update", "workspace"],
  ["admin", "workorders.update", "workspace"],
  ["office", "workorders.update", "workspace"],
  ["owner", "workorders.issue", "workspace"],
  ["admin", "workorders.issue", "workspace"],
  ["office", "workorders.issue", "workspace"],
  ["owner", "workorders.progress", "workspace"],
  ["admin", "workorders.progress", "workspace"],
  ["office", "workorders.progress", "workspace"],
  ["field", "workorders.progress", "assigned_job"],
  ["owner", "workorders.complete", "workspace"],
  ["admin", "workorders.complete", "workspace"],
  ["office", "workorders.complete", "workspace"],
  ["field", "workorders.complete", "assigned_job"],
  ["owner", "workorders.cancel", "workspace"],
  ["admin", "workorders.cancel", "workspace"],
  ["office", "workorders.cancel", "workspace"],
  ["owner", "workorders.reopen", "workspace"],
  ["admin", "workorders.reopen", "workspace"],
  ["office", "workorders.reopen", "workspace"],
  ["owner", "workorders.archive", "workspace"],
  ["admin", "workorders.archive", "workspace"],
  ["owner", "workorders.delete", "workspace"],
  ["admin", "workorders.delete", "workspace"],
  ["owner", "workorders.export", "workspace"],
  ["admin", "workorders.export", "workspace"],
  ["owner", "workorders.view_prices", "workspace"],
  ["admin", "workorders.view_prices", "workspace"],
  ["office", "workorders.view_prices", "workspace"],
  ["owner", "workorders.view_costs", "workspace"],
  ["admin", "workorders.view_costs", "workspace"],
];

/** Backfill existing workspaces with the work-order defaults. The engine still denies them until the permissions are reviewed. */
export async function up(db: Knex.Transaction) {
  if (!db.isTransaction) throw Error("Work-order permission migration requires a transaction.");
  const workspaces = await db("workspaces").select("id", "ownerId").orderBy("id");
  for (const workspace of workspaces) {
    await db("workspaces").where({ id: workspace.id }).forUpdate().first();
    const head = await db("workspacePolicies").where({ workspaceId: workspace.id }).first();
    if (!head) continue;
    const before = await db("workspaceRolePolicies").where({ workspaceId: workspace.id }).select("role", "permission", "scope");
    await db("workspaceRolePolicies").insert(grants.map(([role, permission, scope]) => ({ workspaceId: workspace.id, role, permission, scope }))).onConflict(["workspaceId", "role", "permission"]).ignore();
    const after = await db("workspaceRolePolicies").where({ workspaceId: workspace.id }).select("role", "permission", "scope");
    await db("workspacePolicies").where({ workspaceId: workspace.id }).update({ revision: head.revision + 1, updatedAt: db.fn.now() });
    await db("authorizationAudit").insert({ workspaceId: workspace.id, actorId: workspace.ownerId, action: "migration.work-orders", beforeRevision: head.revision, afterRevision: head.revision + 1,
      beforePolicy: JSON.stringify({ workspaceId: workspace.id, revision: head.revision, grants: before }), afterPolicy: JSON.stringify({ workspaceId: workspace.id, revision: head.revision + 1, grants: after }) });
  }
}
export async function down() { throw Error("Work-order permission cutover is forward-only."); }
