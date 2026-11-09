import { z } from 'zod';
import { teamReportFiltersSchema } from './team-filters';

const stages = ['new', 'contacted', 'estimate-sent'] as const;
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const memberId = z.string().trim().min(1).max(200);
const ownerKey = z.string().trim().min(1).max(207)
  .refine(value => value === 'unassigned' || (value.startsWith('member:') && value.length > 7));
const selection = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('queue'), queue: z.enum(['open', 'inactive', 'unassigned']) }).strict(),
  z.object({
    kind: z.literal('owner'), id: ownerKey, stage: z.enum(stages).optional(),
    inactiveOnly: z.boolean().optional(),
  }).strict().refine(value => value.stage === undefined || !value.inactiveOnly),
]);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
const timestamp = z.iso.datetime({ precision: 6 });
export const teamLeadsQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('team-leads'), selected: selection,
  filters: teamReportFiltersSchema.default({ members: [] }),
  page: page.default(1), pageSize: pageSize.default(25),
}).strict();
export type TeamLeadsQuery = z.infer<typeof teamLeadsQuerySchema>;

export const teamLeadsResultSchema = z.object({
  view: z.literal('team-leads'), asOf: z.iso.datetime(), today: z.iso.date(),
  timezone: z.string().trim().min(1), inactivityCutoff: timestamp,
  scopeLabel: z.string().trim().min(1),
  filters: teamReportFiltersSchema,
  scope: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('workspace') }).strict(),
    z.object({ kind: z.literal('assigned'), currentMemberId: memberId }).strict(),
  ]),
  counts: z.object({ open: count, inactive: count, unassigned: count }).strict(),
  owners: z.array(z.object({
    id: ownerKey, label: z.string().trim().min(1), count, inactive: count,
    stages: z.object({ new: count, contacted: count, 'estimate-sent': count }).strict(),
  }).strict()),
  selected: selection, page, pageSize, evidenceTotal: count,
  rows: z.array(z.object({
    id: z.uuid(), recordId: z.uuid(), label: z.string().trim().min(1),
    stage: z.enum(stages), archived: z.literal(false),
    currentOwnerId: memberId.nullable(),
    ownerState: z.enum(['member', 'former', 'unassigned']),
    inactive: z.boolean(),
    cells: z.object({
      created: timestamp, activity: timestamp, owner: z.string().trim().min(1),
    }).strict(),
  }).strict()).max(100),
}).strict().superRefine((result, context) => {
  const { counts, owners, selected, scope } = result;
  const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);
  const selectedOwner = selected.kind === 'owner' ? owners.find(owner => owner.id === selected.id) : undefined;
  const selectedTotal = selected.kind === 'queue' ? counts[selected.queue]
    : selectedOwner === undefined ? undefined
      : selected.stage !== undefined ? selectedOwner.stages[selected.stage]
        : selected.inactiveOnly ? selectedOwner.inactive : selectedOwner.count;
  const ownerKeyFor = (row: typeof result.rows[number]) =>
    row.currentOwnerId === null ? 'unassigned' : `member:${row.currentOwnerId}`;
  const observed = (predicate: (row: typeof result.rows[number]) => boolean, total: number) => {
    const value = result.rows.filter(predicate).length;
    return value <= total && total - value <= counts.open - result.rows.length;
  };
  const openSum = sum(owners.map(owner => owner.count));
  const inactiveSum = sum(owners.map(owner => owner.inactive));
  const filtered = result.filters.members;
  const valid = filtered.every(id => owners.some(owner => owner.id === `member:${id}`)) &&
    (scope.kind !== 'assigned' || filtered.every(id => id === scope.currentMemberId)) &&
    (filtered.length === 0 || counts.unassigned === 0 && owners.every(owner =>
      filtered.some(id => owner.id === `member:${id}`) || owner.count === 0)) &&
    counts.inactive <= counts.open && counts.unassigned <= counts.open &&
    Number.isSafeInteger(openSum) && openSum === counts.open &&
    Number.isSafeInteger(inactiveSum) && inactiveSum === counts.inactive &&
    new Set(owners.map(owner => owner.id)).size === owners.length &&
    (owners.find(owner => owner.id === 'unassigned')?.count ?? 0) === counts.unassigned &&
    owners.every(owner => owner.inactive <= owner.count &&
      Number.isSafeInteger(sum(Object.values(owner.stages))) && sum(Object.values(owner.stages)) === owner.count) &&
    (scope.kind === 'assigned'
      ? counts.unassigned === 0 && owners.length === 1 && owners[0]?.id === `member:${scope.currentMemberId}` &&
        !(selected.kind === 'queue' && selected.queue === 'unassigned')
      : owners.some(owner => owner.id === 'unassigned')) &&
    selectedTotal !== undefined && selectedTotal === result.evidenceTotal &&
    result.page <= Math.max(1, Math.ceil(result.evidenceTotal / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, result.evidenceTotal - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length &&
    Date.parse(result.inactivityCutoff) <= Date.parse(result.asOf) &&
    result.rows.every(row => {
      if (row.id !== row.recordId || !owners.some(owner => owner.id === ownerKeyFor(row)) ||
        (filtered.length > 0 && (row.currentOwnerId === null || !filtered.includes(row.currentOwnerId))) ||
        (row.ownerState === 'member') !== (row.currentOwnerId !== null) ||
        row.inactive !== (row.cells.activity < result.inactivityCutoff) ||
        row.cells.created > row.cells.activity ||
        (scope.kind === 'assigned' && row.currentOwnerId !== scope.currentMemberId)) return false;
      return selected.kind === 'queue'
        ? selected.queue === 'open' || (selected.queue === 'inactive' ? row.inactive : row.currentOwnerId === null)
        : ownerKeyFor(row) === selected.id && (selected.stage === undefined || row.stage === selected.stage) &&
          (!selected.inactiveOnly || row.inactive);
    }) &&
    observed(row => row.inactive, counts.inactive) &&
    observed(row => row.currentOwnerId === null, counts.unassigned) &&
    owners.every(owner => {
      const matches = (row: typeof result.rows[number]) => ownerKeyFor(row) === owner.id;
      return observed(matches, owner.count) && observed(row => matches(row) && row.inactive, owner.inactive) &&
        stages.every(stage => observed(row => matches(row) && row.stage === stage, owner.stages[stage]));
    });
  if (!valid) context.addIssue({ code: 'custom', message: 'Team Lead workload and evidence do not reconcile.' });
});
export type TeamLeadsResult = z.infer<typeof teamLeadsResultSchema>;
