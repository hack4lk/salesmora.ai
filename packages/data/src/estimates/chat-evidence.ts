import type { Knex } from "knex";
import type { AuthorizationContext } from "@salesmora/contracts";
import { resolveAuthorizedCollectionScope } from "@salesmora/domain";
import { AuthorizationAccessError } from "../authorization/store";
import { assistantAuthorityStamp } from "../authorization/evidence-stamp";

/** Historical scope binding. Confirmation services separately validate exact target versions. */
export async function estimateChatStamp(
  _trx: Knex.Transaction,
  context: AuthorizationContext,
): Promise<string> {
  const scope = resolveAuthorizedCollectionScope(context, "estimates.read");
  if (!scope.allowed || !["workspace", "assigned_job"].includes(scope.scope)) {
    throw new AuthorizationAccessError();
  }
  return assistantAuthorityStamp(context, 'estimates', 'md5');
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
