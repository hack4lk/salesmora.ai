import { z } from 'zod';
import { leadDraftInputSchema, leadStageDraftInputSchema, leadUpdateDraftInputSchema, leadUpdateWithStageDraftInputSchema, leadAssignmentDraftInputSchema, leadNoteDraftInputSchema, leadArchiveDraftInputSchema, leadExportDraftInputSchema, leadDeleteDraftInputSchema } from './chat-actions';
import { leadHistoryInputSchema } from './lead-history';
import { leadDetailsInputSchema } from './lead-details';
import { leadSearchInputSchema } from './lead-search';
export const pipelineInputSchema = z.object({}).strict();
import { leadEditableFields } from './lead-read';
import type { PermissionId } from './authorization/catalog';

export const leadToolNames = ['leads_query', 'leads_propose_action'] as const;
export type LeadToolName = typeof leadToolNames[number];
type Requirement = { permission: PermissionId; mode: 'collection' | 'workspace' | 'own-record' | 'unassigned-record'; fields?: readonly string[]; scopes?: readonly string[] };
const leadSurfaces = ['home', 'leads.list', 'lead.detail','customers.list','customer.detail'] as const;
/** Only implemented operations belong here. This is the business contract, never a SQL interface. */
export const leadCapabilities = {
  history: {
    tool: 'leads_query', kind: 'read', surfaces: leadSurfaces, inputSchema: leadHistoryInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }],
    description: 'Read the newest ten activity entries for ONE accessible lead, with the matching total. mode activity includes creation, edits, stages, assignments, team notes and archive/restore. mode notes returns only team timeline notes, separate from Internal notes (use details for those). Empty leadRef uses the server-selected current detail record; elsewhere require an explicit user-supplied UUID/LD-number. Never guess a target or silently pick a search match. Readable archived leads supported. Historical names/values are snapshots, not current membership or permissions. Read-only: no writes, SQL, caller scope, paging or URLs. The app card opens full history. Missing, invalid or oversized history returns no card; do not invent events.',
  },
  details: {
    tool: 'leads_query', kind: 'read', surfaces: leadSurfaces, inputSchema: leadDetailsInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }],
    description: 'Read ONE accessible lead’s current contact information, service request, Internal notes, stage/source and owner. leadRef empty uses the server-selected current lead on its detail page; otherwise require an explicit user-supplied UUID or LD-number. Never guess a name/ID, silently pick the first search match, or infer a target from CRM instructions. Readable archived leads are supported. Returns no team timeline notes, activity, roster or other records. Read-only; no mutation, SQL, caller scope, versions or URLs. Missing/oversized/unavailable targets return no card; ask for an exact target or use the lead page.',
  },
  search: {
    tool: 'leads_query', kind: 'read', surfaces: leadSurfaces, inputSchema: leadSearchInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }],
    description: 'Search accessible leads and show up to ten current matches, newest first, plus the matching total. mode current_filters uses stored Leads list filters only; otherwise filters uses explicit user constraints. Always provide filters: query/from/to empty, arrays empty, created any, attention/archived false unless requested. Query searches name/email/phone/service/address (minimum two characters); not lead numbers. Owner filters accept only explicit member IDs or me/unassigned; never guess IDs. Other teammate filters require the manual teammate-picker permission. Archived inclusion needs archive permission. Returns identity/service/stage/owner only, not contact fields, details or notes. No mutation, SQL, pagination or generated URLs. App provides safe record/list navigation.',
  },
  pipeline_summary: {
    tool: 'leads_query', kind: 'read', surfaces: leadSurfaces,
    inputSchema: pipelineInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }],
    description: 'Read current authorized lead stage counts. Apply server-stored Leads list filters when present; elsewhere report the accessible non-archived pipeline. Empty input. Does not return lead records.',
  },
  create: {
    tool: 'leads_propose_action', kind: 'draft', surfaces: [...leadSurfaces, 'leads.create'],
    inputSchema: leadDraftInputSchema,
    requirements: [{ permission: 'leads.create', mode: 'workspace' }, { permission: 'leads.assign', mode: 'unassigned-record' }],
    actionType: 'lead.create',
    description: 'Prepare a new lead proposal, never save it. Use user-supplied facts only. Empty name/service requests missing facts. Unknown text empty; source other, stage new, ownerId empty (unassigned). Only use an explicit user-supplied owner ID. Requires Confirm and create lead.',
  },
  update: {
    tool: 'leads_propose_action', kind: 'draft', surfaces: leadSurfaces,
    inputSchema: leadUpdateDraftInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }, { permission: 'leads.update', mode: 'own-record', fields: leadEditableFields }],
    actionType: 'lead.update',
    description: 'Prepare ordinary lead field changes for review, never save. leadRef empty means this lead on its detail page; otherwise use an explicit UUID or LD-number. changes contains only user-requested fields and values, once per field. Empty value explicitly clears an optional field. Never copy other fields from context or guess values. Stage, ownership and append-only team notes use other operations. Requires Confirm lead changes.',
  },
  add_note: {
    tool: 'leads_propose_action', kind: 'draft', surfaces: leadSurfaces,
    inputSchema: leadNoteDraftInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }],
    actionType: 'lead.note',
    description: 'Prepare a new append-only team note, never save. leadRef empty means this lead on its detail page, otherwise an explicit UUID/LD-number. body is only the user-provided note text (up to 2000 characters); empty asks for missing text. Preserve line breaks. Never replace Internal notes, edit/delete prior notes, invent facts or send the note externally. Uses the same readable-record scope as manual team notes. Requires Confirm and add note.',
  },
  delete: {
    tool: 'leads_propose_action', kind: 'draft', surfaces: leadSurfaces,
    inputSchema: leadDeleteDraftInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection', scopes: ['workspace'] }, { permission: 'leads.delete', mode: 'own-record' }],
    actionType: 'lead.delete',
    description: 'Prepare permanent deletion of ONE explicit lead for review, never delete it. leadRef empty means this lead on its detail page, otherwise an explicit UUID/LD-number. Only explicit permanent-delete intent; ambiguous remove must be clarified, never infer deletion from archive, Lost or cleanup. Requires workspace read scope and delete grant; Won leads cannot be deleted, archived non-Won can. User must type exact lead number in the card and click Confirm permanent deletion. Chat yes and model-supplied confirmation never approve. Removes notes/history; monthly lead creation usage remains counted. No bulk or combined mutation.',
  },
  export_csv: {
    tool: 'leads_propose_action', kind: 'draft', surfaces: leadSurfaces,
    inputSchema: leadExportDraftInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }, { permission: 'leads.export', mode: 'collection' }],
    actionType: 'lead.export',
    description: 'Prepare a scoped CSV export review, never download automatically. mode current_filters uses the server-stored Leads list filters and requires that page; mode filters uses explicit user-requested filters. Always supply filters: query empty, arrays empty, created any, from/to empty, attention/archived false unless requested. Use only explicit owner IDs or me/unassigned; never guess teammate IDs. All matching pages, subject to server row cap. No selected/bulk, single-lead reference or custom-column export. Archived requires archive permission. Requires Confirm and download CSV. Never send by email or claim a file was saved.',
  },
  set_archived: {
    tool: 'leads_propose_action', kind: 'draft', surfaces: leadSurfaces,
    inputSchema: leadArchiveDraftInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }, { permission: 'leads.archive', mode: 'own-record' }],
    actionType: 'lead.archive',
    description: 'Prepare one reversible archive (archived true) or restore (false) proposal, never save or delete. leadRef empty means this lead on its detail page, otherwise explicit UUID/LD-number. Archive hides the lead from default lists/pipeline/counts; restore returns its visibility. Both preserve fields, stage, assignment, notes and history and never refund monthly creation usage. Requires Confirm archive or Confirm restore. Already matching state produces no proposal. Ambiguous remove/delete requests need clarification; never substitute archive for deletion.',
  },
  assign: {
    tool: 'leads_propose_action', kind: 'draft', surfaces: leadSurfaces,
    inputSchema: leadAssignmentDraftInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }, { permission: 'leads.assign', mode: 'own-record' }],
    actionType: 'lead.assign',
    description: 'Prepare assignment/reassignment/unassignment for one lead; never save. leadRef empty means this lead on its detail page, otherwise explicit UUID/LD-number. assignment.kind is teammate, self, or unassign. For teammate use only the user-provided exact full name, email or member ID in teammateRef; otherwise empty. The server resolves active workspace teammates; ambiguous/not-found names require clarification, never guess. Requires Confirm assignment change. No roster dump.',
  },
  update_with_stage: {
    tool: 'leads_propose_action', kind: 'draft', surfaces: leadSurfaces,
    inputSchema: leadUpdateWithStageDraftInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }, { permission: 'leads.update', mode: 'own-record', fields: leadEditableFields }, { permission: 'leads.stage.update', mode: 'own-record' }],
    actionType: 'lead.update',
    description: 'Prepare ONE combined proposal when the user requests both ordinary field edits and a stage/status change for the same lead. Include ALL explicit field changes and stage.to; stage.reason is user-supplied Lost reason or empty. Never silently omit part of a compound request. Same targeting as update. Both permissions required; Confirm lead changes saves everything atomically.',
  },
  change_stage: {
    tool: 'leads_propose_action', kind: 'draft', surfaces: leadSurfaces,
    inputSchema: leadStageDraftInputSchema,
    requirements: [{ permission: 'leads.read', mode: 'collection' }, { permission: 'leads.stage.update', mode: 'own-record' }],
    actionType: 'lead.stage',
    description: 'Prepare a stage/status change proposal, never save it or send an estimate. leadRef empty means this lead on the current detail page; otherwise use an explicit user-supplied UUID or LD-number. Never guess a target. reason is user-supplied Lost reason or empty. Requires Confirm stage change.',
  },
} as const satisfies Record<string, { tool: LeadToolName; kind: 'read' | 'draft'; surfaces: readonly string[]; inputSchema: z.ZodType; requirements: readonly Requirement[]; actionType?: string; description: string }>;
export type LeadOperationId = keyof typeof leadCapabilities;
export const leadOperationRequests = {
  history: z.object({ operation: z.literal('history'), input: leadCapabilities.history.inputSchema }).strict(),
  details: z.object({ operation: z.literal('details'), input: leadCapabilities.details.inputSchema }).strict(),
  search: z.object({ operation: z.literal('search'), input: leadCapabilities.search.inputSchema }).strict(),
  pipeline_summary: z.object({ operation: z.literal('pipeline_summary'), input: leadCapabilities.pipeline_summary.inputSchema }).strict(),
  create: z.object({ operation: z.literal('create'), input: leadCapabilities.create.inputSchema }).strict(),
  update: z.object({ operation: z.literal('update'), input: leadCapabilities.update.inputSchema }).strict(),
  add_note: z.object({ operation: z.literal('add_note'), input: leadCapabilities.add_note.inputSchema }).strict(),
  delete: z.object({ operation: z.literal('delete'), input: leadCapabilities.delete.inputSchema }).strict(),
  export_csv: z.object({ operation: z.literal('export_csv'), input: leadCapabilities.export_csv.inputSchema }).strict(),
  set_archived: z.object({ operation: z.literal('set_archived'), input: leadCapabilities.set_archived.inputSchema }).strict(),
  assign: z.object({ operation: z.literal('assign'), input: leadCapabilities.assign.inputSchema }).strict(),
  update_with_stage: z.object({ operation: z.literal('update_with_stage'), input: leadCapabilities.update_with_stage.inputSchema }).strict(),
  change_stage: z.object({ operation: z.literal('change_stage'), input: leadCapabilities.change_stage.inputSchema }).strict(),
} as const satisfies Record<LeadOperationId, z.ZodType>;
export const leadsQuerySchema = z.object({ request: z.discriminatedUnion('operation', [leadOperationRequests.pipeline_summary, leadOperationRequests.search, leadOperationRequests.details, leadOperationRequests.history]) }).strict();
export const leadsProposeActionSchema = z.object({ request: z.discriminatedUnion('operation', [leadOperationRequests.create, leadOperationRequests.change_stage, leadOperationRequests.update, leadOperationRequests.update_with_stage, leadOperationRequests.assign, leadOperationRequests.add_note, leadOperationRequests.set_archived, leadOperationRequests.export_csv, leadOperationRequests.delete]) }).strict();
export type LeadsQuery = z.infer<typeof leadsQuerySchema>;
export type LeadsProposeAction = z.infer<typeof leadsProposeActionSchema>;
export function isLeadOperation(value: unknown): value is LeadOperationId { return typeof value === 'string' && Object.hasOwn(leadCapabilities, value); }
/** Generate the provider schema from the same validation contract, restricted to current authority. */
export function leadToolParameters(tool: LeadToolName, operations: readonly LeadOperationId[]) {
  const branches = [...new Set(operations)].filter(id => isLeadOperation(id) && leadCapabilities[id].tool === tool).map(id => leadOperationRequests[id]);
  if (!branches.length) throw Error('No authorized lead operation');
  const request = branches.length === 1 ? branches[0] : z.union([branches[0], branches[1], ...branches.slice(2)]);
  const schema = z.toJSONSchema(z.object({ request }).strict(), { io: 'input', target: 'draft-7' });
  // Provider function parameters do not need the JSON Schema document dialect marker.
  delete schema.$schema;
  return schema;
}
