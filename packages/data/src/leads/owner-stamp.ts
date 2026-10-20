import { createHash } from 'node:crypto';
/** Non-content provenance; former members never contribute their private name. */
export function leadOwnerStamp(owner: { id: string; name: string; former: boolean } | null) {
  return createHash('sha256').update(JSON.stringify(owner ? [owner.id, owner.former, owner.former ? '' : owner.name] : null)).digest('hex');
}
