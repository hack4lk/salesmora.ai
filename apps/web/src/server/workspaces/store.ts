import "server-only";
import { randomUUID } from "node:crypto";
import {
  getWorkspacePlan,
  workspacePlanCatalogVersion,
} from "@salesmora/domain";
import { sandboxBillingEnabled } from "@salesmora/data";
import { workspacePlanIdSchema } from "@salesmora/contracts";
import { authorize } from "@salesmora/domain";
import {
  authorizedWorkspace,
  enabledPermissions,
} from "../authorization/permissions";
import {
  createDatabase,
  initializeWorkspacePolicy,
  loadWorkspaceAuthorization,
} from "@salesmora/data";
import type { WorkspaceInput, WorkspaceRole } from "@salesmora/contracts";
const globalStore = globalThis as typeof globalThis & {
  workspaceDatabase?: ReturnType<typeof createDatabase>;
};
export function database() {
  if (!process.env.DATABASE_URL)
    throw new Error("Missing database connection.");
  return (globalStore.workspaceDatabase ??= createDatabase(
    process.env.DATABASE_URL,
  ));
}
export class WorkspaceCapacityError extends Error {}
interface WorkspaceRow {
  id: string;
  ownerId: string;
  businessName: string;
  businessType: string;
  postalCode: string;
  serviceRange: string;
}
export async function findWorkspace(userId: string, workspaceId?: string) {
  const query = database()<WorkspaceRow & { membershipRole: WorkspaceRole }>(
    "workspaces",
  )
    .join(
      "workspaceMemberships",
      "workspaces.id",
      "workspaceMemberships.workspaceId",
    )
    .where("workspaceMemberships.userId", userId)
    .whereNull("workspaces.deletionRequestedAt")
    .select("workspaces.*", "workspaceMemberships.role as membershipRole");
  if (workspaceId) query.where("workspaces.id", workspaceId);
  return query.orderBy("workspaces.createdAt").orderBy("workspaces.id").first();
}
export async function createWorkspace(userId: string, input: WorkspaceInput) {
  return database().transaction(async (trx) => {
    // Serialize onboarding submissions for this account, including simultaneous retries.
    const user = await trx("users").where({ id: userId }).forUpdate().first();
    if (!user || user.deletionRequestedAt)
      throw new Error("Account unavailable.");
    const existing = await trx("workspaces").where({ ownerId: userId }).first();
    if (existing) return { id: existing.id as string, created: false };
    if (
      input.team.invitations.some(
        (invite) => invite.email === user.email.toLowerCase(),
      )
    )
      throw new Error("Owner cannot be invited.");
    const plan = workspacePlanIdSchema.parse(user.registrationPlan ?? "free");
    const billingEnabled = sandboxBillingEnabled();
    if (
      billingEnabled &&
      input.team.invitations.length + 1 >
        getWorkspacePlan(plan).limits.teammates
    )
      throw new WorkspaceCapacityError(
        "The selected plan does not have enough teammate seats.",
      );
    const id = randomUUID();
    await trx("workspaces").insert({
      id,
      ownerId: userId,
      ...input.business,
      postalCode: input.services.postalCode,
      serviceRange: input.services.serviceRange,
    });
    await trx("workspaceMemberships").insert({
      workspaceId: id,
      userId,
      role: "owner",
    });
    await initializeWorkspacePolicy(trx, { userId, workspaceId: id });
    const context = await loadWorkspaceAuthorization(
      trx,
      { userId, workspaceId: id },
      enabledPermissions,
    );
    if (
      input.team.invitations.some(
        (invite) =>
          !authorize(context, {
            permission: "team.invite",
            targetRole: invite.role,
          }).allowed,
      )
    )
      throw new Error("Invitation access denied.");
    await trx("workspaceServices").insert(
      input.services.services.map((service) => ({ workspaceId: id, service })),
    );
    if (billingEnabled)
      await trx("workspaceSubscriptions").insert({
        workspaceId: id,
        catalogVersion: workspacePlanCatalogVersion,
        intendedPlan: plan,
        pendingInvitations: JSON.stringify(
          plan === "free" ? [] : input.team.invitations,
        ),
      });
    if ((!billingEnabled || plan === "free") && input.team.invitations.length)
      await trx("workspaceInvitations").insert(
        input.team.invitations.map((invite) => ({
          ...invite,
          inviterId: userId,
          id: randomUUID(),
          workspaceId: id,
          status: user.emailVerified ? "queued" : "pending_verification",
        })),
      );
    await trx("users")
      .where({ id: userId })
      .update({ onboardingStatus: "complete", updatedAt: new Date() });
    return { id, created: true };
  });
}
export async function workspaceSummary(userId: string, workspaceId: string) {
  return authorizedWorkspace(
    userId,
    workspaceId,
    false,
    async (trx, context) => {
      if (
        !authorize(context, { permission: "team.invite", targetRole: "field" })
          .allowed
      )
        return { invitations: [] };
      return {
        invitations: await trx("workspaceInvitations")
          .where({ workspaceId })
          .select("email", "role", "status"),
      };
    },
  );
}
