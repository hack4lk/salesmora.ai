import { adminRolloutFlagKeySchema } from '@salesmora/contracts';
import type { Knex } from 'knex';

/** Uncached system-wide rollout check. Missing or deleted keys are off; database failures propagate. */
export async function isRolloutFlagEnabled(db: Knex, key: string): Promise<boolean> {
  const flagKey = adminRolloutFlagKeySchema.parse(key);
  const { rows } = await db.raw<{ rows: { enabled: boolean }[] }>(
    'SELECT public.is_salesmora_rollout_enabled(?) AS enabled', [flagKey],
  );
  const enabled = rows[0]?.enabled;
  if (typeof enabled !== 'boolean') throw new Error('Rollout flag evaluation returned an invalid result.');
  return enabled;
}
