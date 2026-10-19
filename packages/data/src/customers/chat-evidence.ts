import type { Knex } from "knex";
import { authorize, resolveAuthorizedCollectionScope } from "@salesmora/domain";
import type { AuthorizationContext } from "@salesmora/contracts";
/** Conservative workspace CRM epoch. Content never leaves SQL; any relevant change invalidates old customer answers.
 * This intentionally favors fresh retrieval over retaining stale multi-record/search/roster evidence.
 */
export async function customerChatStamp(
  trx: Knex.Transaction,
  context: AuthorizationContext,
): Promise<string> {
  const scope = resolveAuthorizedCollectionScope(context, "leads.read");
  const leadScope =
    scope.allowed && ["workspace", "assigned"].includes(scope.scope)
      ? scope.scope
      : "none";
  const { rows } = await trx.raw(
    `SELECT md5(coalesce(string_agg(v, '|' ORDER BY v),'')) AS stamp FROM (
 SELECT 'c:'||id::text||':'||version::text AS v FROM customers WHERE "workspaceId"=?
 UNION ALL SELECT 'a:'||id::text FROM "customerActivity" WHERE "workspaceId"=?
 UNION ALL SELECT 'l:'||id::text||':'||version::text||':'||coalesce("ownerId",'') FROM leads WHERE "workspaceId"=? AND (?='workspace' OR (?='assigned' AND "ownerId"=?))
 UNION ALL SELECT 'la:'||a.id::text FROM "leadActivity" a JOIN leads l ON l.id=a."leadId" AND l."workspaceId"=a."workspaceId" WHERE l."workspaceId"=? AND (?='workspace' OR (?='assigned' AND l."ownerId"=?))
 UNION ALL SELECT 'm:'||m."userId"||':'||m.xmin::text||':'||u.name||':'||u.email||':'||coalesce(u."deletionRequestedAt"::text,'') FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=?
 ) evidence`,
    [
      context.workspaceId,
      context.workspaceId,
      context.workspaceId,
      leadScope,
      leadScope,
      context.userId,
      context.workspaceId,
      leadScope,
      leadScope,
      context.userId,
      context.workspaceId,
    ],
  );
  return rows[0].stamp;
}
export async function customerChatEvidenceAllowed(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  stamp?: string | null,
) {
  if (!stamp) return true;
  const full = authorize(context, {
    permission: "customers.read",
    resource: {
      kind: "customer",
      id: "evidence",
      workspaceId: context.workspaceId,
      related: [],
    },
  }).allowed;
  const related =
    context.enabledPermissions.includes("customers.related.read") &&
    context.policy.grants.some(
      (g) =>
        g.role === context.membership.role &&
        g.permission === "customers.related.read",
    );
  return (full || related) && stamp === (await customerChatStamp(trx, context));
}
