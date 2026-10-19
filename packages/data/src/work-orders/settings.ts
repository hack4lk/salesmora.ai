import type { Knex } from "knex";
import { workOrderSettingsSchema, type PermissionId, type WorkOrderSettings } from "@salesmora/contracts";
import { authorize } from "@salesmora/domain";
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from "../authorization/store";

const read = async (trx: Knex.Transaction, workspaceId: string): Promise<WorkOrderSettings> => {
  const row = await trx("workspaces").where({ id: workspaceId }).first("businessPhone", "workOrderSignoffRequired");
  return { signoffRequired: !!row?.workOrderSignoffRequired, businessPhone: row?.businessPhone ?? "" };
};
/** Workspace work-order settings are business settings: readable and editable only with the business-settings permissions. */
export async function readWorkOrderSettings(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[]) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    if (!authorize(context, { permission: "settings.business.read" }).allowed) throw new AuthorizationAccessError();
    return { settings: await read(trx, context.workspaceId), canEdit: authorize(context, { permission: "settings.business.update" }).allowed };
  });
}
export async function saveWorkOrderSettings(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = workOrderSettingsSchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    if (!authorize(context, { permission: "settings.business.update" }).allowed) throw new AuthorizationAccessError();
    await trx("workspaces").where({ id: context.workspaceId }).update({ workOrderSignoffRequired: input.signoffRequired, businessPhone: input.businessPhone });
    return read(trx, context.workspaceId);
  });
}
