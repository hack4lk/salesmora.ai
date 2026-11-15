import { effectiveWorkspacePlan } from '@salesmora/domain';
import type { AdminFeatureFlagId } from '@salesmora/contracts';
import type { Knex } from 'knex';

const cacheLifetimeMs = 60_000;

export function createFeatureFlagReader(now: () => number = Date.now) {
  const caches = new WeakMap<object, Map<string, { enabled: boolean; expiresAt: number }>>();

  return async function isFeatureFlagEnabled(
    db: Knex,
    flagId: AdminFeatureFlagId,
    workspaceId?: string,
    transaction?: Knex.Transaction,
  ): Promise<boolean> {
    let cache = caches.get(db);
    if (!cache) {
      cache = new Map();
      caches.set(db, cache);
    }

    const key = `${flagId}:${workspaceId ?? 'global'}`;
    const cached = cache.get(key);
    const time = now();
    if (cached && cached.expiresAt > time) return cached.enabled;

    let planId: string | null = null;
    // Keep the root cache key while reusing an existing transaction connection on cache misses.
    const queryDb = transaction ?? db;
    if (workspaceId) {
      const [subscription, workspace] = await Promise.all([
        queryDb('workspaceSubscriptions').where({ workspaceId }).first('plan', 'status', 'paidThrough', 'recoveryUntil'),
        queryDb('workspaces').where({ id: workspaceId }).first('planOverride', 'planOverrideEndsAt'),
      ]);
      planId = effectiveWorkspacePlan(
        subscription,
        workspace,
        new Date(time),
      ).plan;
    }
    const result = await queryDb.raw<{ rows: { enabled: boolean }[] }>(
      'SELECT public.is_salesmora_feature_enabled(?, ?, ?) AS enabled',
      [flagId, planId, workspaceId ?? null],
    );
    const enabled = result.rows[0]?.enabled;
    if (typeof enabled !== 'boolean') throw new Error('Feature flag evaluation returned an invalid result.');

    if (cache.size >= 5_000) {
      for (const [entryKey, entry] of cache) {
        if (entry.expiresAt <= time || cache.size >= 4_000) cache.delete(entryKey);
      }
    }
    cache.set(key, { enabled, expiresAt: time + cacheLifetimeMs });
    return enabled;
  };
}

export const isFeatureFlagEnabled = createFeatureFlagReader();
