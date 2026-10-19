import { z } from 'zod';
import { leadEditableFieldSchema, leadStages, leadSources, leadCreatedActivitySchema, leadStageActivitySchema, leadEditedActivitySchema, leadAssignedActivitySchema, leadNoteActivitySchema, type LeadDetailResult } from './lead-read';
export const leadHistoryInputSchema = z.object({ leadRef: z.string().trim().max(64), mode: z.enum(['activity', 'notes']) }).strict();
const base = { id: z.uuid(), createdAt: z.iso.datetime(), actorName: z.string().max(200), viaAssistant: z.boolean() };
const owner = z.object({ name: z.string().max(200), former: z.boolean().optional() }).strict().nullable();
export const leadHistoryEntrySchema = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('created'), source: z.enum(leadSources) }).strict(),
  z.object({ ...base, kind: z.literal('edited'), changes: z.array(z.object({ field: leadEditableFieldSchema, before: z.string().max(10000).nullable(), after: z.string().max(10000).nullable() }).strict()).min(1).max(8).refine(changes => new Set(changes.map(change => change.field)).size === changes.length) }).strict(),
  z.object({ ...base, kind: z.literal('stage'), from: z.enum(leadStages), to: z.enum(leadStages), reason: z.string().max(500).optional() }).strict(),
  z.object({ ...base, kind: z.literal('assigned'), from: owner, to: owner }).strict(),
  z.object({ ...base, kind: z.literal('note'), body: z.string().trim().min(1).max(2000) }).strict(),
  z.object({ ...base, kind: z.literal('archived') }).strict(), z.object({ ...base, kind: z.literal('restored') }).strict(),
]);
export const leadHistoryResultSchema = z.object({ id: z.uuid(), mode: z.enum(['activity', 'notes']), scope: z.enum(['workspace', 'assigned']), retrievedAt: z.iso.datetime(),
  lead: z.object({ id: z.uuid(), number: z.string().min(1).max(64), name: z.string().min(1).max(200), archived: z.boolean() }).strict(),
  entries: z.array(leadHistoryEntrySchema).max(10), total: z.number().int().nonnegative().safe(),
}).strict().refine(value => value.entries.length === Math.min(value.total, 10) && new Set(value.entries.map(entry => entry.id)).size === value.entries.length && value.entries.every(entry => Date.parse(entry.createdAt) <= Date.parse(value.retrievedAt) && (value.mode !== 'notes' || entry.kind === 'note')));
export type LeadHistoryResult = z.infer<typeof leadHistoryResultSchema>;
/** Whitelist persisted activity fields. Private hashes, versions and actor IDs never leave this boundary. */
export function leadHistoryEntry(row: LeadDetailResult['activity'][number]) {
  const common = { id: row.id, createdAt: row.createdAt, actorName: row.actorName ?? '', viaAssistant: row.actorType === 'assistant-confirmed' };
  let entry: unknown;
  switch (row.type) {
    case 'created': entry = { ...common, kind: 'created', source: leadCreatedActivitySchema.parse(row.changes).source }; break;
    case 'stage': entry = { ...common, kind: 'stage', ...leadStageActivitySchema.parse(row.changes) }; break;
    case 'edited': entry = { ...common, kind: 'edited', changes: leadEditedActivitySchema.parse(row.changes).fields }; break;
    case 'assigned': {
      const change = leadAssignedActivitySchema.parse(row.changes);
      entry = { ...common, kind: 'assigned', from: change.from === null ? null : { name: change.from }, to: change.to === null ? null : { name: change.to } }; break;
    }
    case 'note': entry = { ...common, kind: 'note', body: leadNoteActivitySchema.parse(row.changes).body }; break;
    case 'archived': case 'restored': entry = { ...common, kind: row.type }; break;
    default: throw Error('Unsupported history entry');
  }
  return leadHistoryEntrySchema.parse(entry);
}
