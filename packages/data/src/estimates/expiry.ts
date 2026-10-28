import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { EstimateDraftConflictError } from "./drafts";
import { stopEstimateDeliveries } from "./delivery";
import { permissionIds } from "@salesmora/contracts";
import { notifyEstimateRecipients } from "../notifications/estimates";

/** Bounded, restart-safe sweep using database time after each workspace's write lock. */
export async function expireEstimates(db: Knex, now?: Date): Promise<{ expired: number }> {
  if (now && !Number.isFinite(now.getTime())) throw new RangeError("A valid expiry sweep time is required.");
  const instant = now ? now.toISOString() : db.raw("clock_timestamp()");
  const workspaces = await db("workspaces as w").whereNull("w.deletionRequestedAt")
    .whereExists(db("estimates as e").select(db.raw("1")).whereRaw('e."workspaceId" = w.id')
      .whereIn("e.status", ["sent", "published"])
      .whereRaw('e."validUntil" < (?::timestamptz AT TIME ZONE w.timezone)::date', [instant]))
    .select("w.id").orderBy("w.id").limit(50);
  let expired = 0;
  for (const workspace of workspaces) {
    expired += await db.transaction(async trx => {
      const locked = await trx("workspaces").where({ id: workspace.id }).whereNull("deletionRequestedAt").forUpdate()
        .select("id", "timezone").first();
      if (!locked) return 0;
      const rows = await trx("estimates").where({ workspaceId: locked.id }).whereIn("status", ["sent", "published"])
        .whereRaw('"validUntil" < (?::timestamptz AT TIME ZONE ?)::date', [instant, locked.timezone])
        .orderBy("validUntil").orderBy("id").limit(100).select("id", "status", "version");
      for (const row of rows) {
        const changed = await trx("estimates").where({ workspaceId: locked.id, id: row.id, status: row.status, version: row.version })
          .update({ status: "expired", version: row.version + 1, updatedAt: trx.fn.now() });
        if (!changed) throw new EstimateDraftConflictError("The estimate changed during scheduled expiry.");
        await stopEstimateDeliveries(trx, locked.id, row.id);
        await trx("estimate_activity").insert({
          id: randomUUID(), workspaceId: locked.id, estimateId: row.id, actorId: null, actorName: "System",
          source: "worker", type: "expired", changes: JSON.stringify({ status: { before: row.status, after: "expired" } }),
        });
        await notifyEstimateRecipients(trx, {
          workspaceId: locked.id,
          estimateId: row.id,
          event: "expired",
          dedupeKey: `estimate:${row.id}:expired`,
        }, permissionIds);
      }
      return rows.length;
    });
  }
  return { expired };
}
