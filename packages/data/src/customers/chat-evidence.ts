import type { Knex } from "knex";
import { authorize } from "@salesmora/domain";
import type { AuthorizationContext } from "@salesmora/contracts";
import { assistantAuthorityStamp } from "../authorization/evidence-stamp";
/** Historical authorization binding; current source-record access is checked separately. */
export async function customerChatStamp(
  _trx: Knex.Transaction,
  context: AuthorizationContext,
): Promise<string> {
  return assistantAuthorityStamp(context, 'customers', 'md5');
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
