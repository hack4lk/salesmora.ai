import { captureIdSchema } from '@salesmora/contracts';
import type { Knex } from 'knex';

/** Metadata checks stay in the caller's transaction, never in the private HTTP probe. */
export async function captureWebsiteSchemaReady(trx: Knex.Transaction) {
  return await trx.schema.hasTable('captureReceiptProcessing') && await trx.schema.hasTable('capturePublications');
}

/** An explicit, bounded operator scope. Invalid input never becomes an all-workspace scope. */
export function capturePublicationWorkspaces(value?: string): readonly string[] | null {
  if (!value) return [];
  if (value.length > 3700) return null;
  const ids = value.split(',').map(id => id.trim());
  if (ids.length > 100 || ids.some(id => !captureIdSchema.safeParse(id).success)) return null;
  return Object.freeze([...new Set(ids)]);
}

/** Dedicated server-token format shared by the web handler and private worker client. */
export function captureReadinessKey(value?: string): Buffer | null {
  if (!value || value.length !== 44) return null;
  const key = Buffer.from(value, 'base64');
  return key.length === 32 && key.toString('base64') === value ? key : null;
}
