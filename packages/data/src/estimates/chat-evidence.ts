import type { Knex } from "knex";
import type { AuthorizationContext } from "@salesmora/contracts";
import { resolveAuthorizedCollectionScope } from "@salesmora/domain";
import { AuthorizationAccessError } from "../authorization/store";

/** Conservative CRM epoch: stale counts, empty searches and changed assignments invalidate text and cards. */
export async function estimateChatStamp(
  trx: Knex.Transaction,
  context: AuthorizationContext,
): Promise<string> {
  const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
  if (!scope.allowed || !["workspace", "assigned_job"].includes(scope.scope)) {
    throw new AuthorizationAccessError();
  }
  const { rows } = await trx.raw(
    `SELECT md5(coalesce(string_agg(v, '|' ORDER BY v), '')) AS stamp FROM (
      SELECT 'e:' || id::text || ':' || xmin::text AS v FROM estimates WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'i:' || id::text || ':' || xmin::text FROM estimate_items WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'a:' || id::text || ':' || xmin::text FROM estimate_activity WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'd:' || id::text || ':' || xmin::text FROM estimate_deliveries WHERE "workspaceId" = :workspace
      UNION ALL SELECT 't:' || id::text || ':' || xmin::text FROM estimate_share_tokens WHERE "workspaceId" = :workspace
      UNION ALL SELECT 's:' || id::text || ':' || xmin::text FROM estimate_snapshots WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'l:' || id::text || ':' || xmin::text FROM leads WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'j:' || id::text || ':' || xmin::text FROM jobs WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'c:' || id::text || ':' || xmin::text FROM customers WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'team:' || "jobId"::text || ':' || "userId" || ':' || xmin::text FROM "jobTeamMembers" WHERE "workspaceId" = :workspace
      UNION ALL SELECT 'u:' || u.id || ':' || u.xmin::text FROM users u
        JOIN "workspaceMemberships" m ON m."userId" = u.id WHERE m."workspaceId" = :workspace
      UNION ALL SELECT 'w:' || xmin::text || ':' || (now() AT TIME ZONE timezone)::date::text
        FROM workspaces WHERE id = :workspace
    ) evidence`,
    { workspace: context.workspaceId },
  );
  return rows[0].stamp;
}

export async function estimateChatEvidenceAllowed(
  trx: Knex.Transaction,
  context: AuthorizationContext,
  stamp?: string | null,
) {
  if (!stamp) return true;
  const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
  return scope.allowed &&
    ["workspace", "assigned_job"].includes(scope.scope) &&
    stamp === await estimateChatStamp(trx, context);
}
