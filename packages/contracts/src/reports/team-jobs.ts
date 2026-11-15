import { z } from 'zod';
import { jobDateSchema, jobWaitingReasons } from '../job';
import { teamReportFiltersSchema } from './team-filters';

const statuses = ['needs-scheduling', 'scheduled', 'in-progress', 'waiting'] as const;
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const memberId = z.string().trim().min(1).max(200);
const filter = z.enum(['all', 'overdue', ...statuses]);
const selection = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('queue'), queue: z.enum(['active', 'overdue', 'waiting', 'unassigned']) }).strict(),
  z.object({
    kind: z.literal('member'), id: memberId,
    responsibility: z.enum(['primary', 'supporting']), filter,
  }).strict(),
  z.object({ kind: z.literal('unassigned'), filter }).strict(),
]);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
export const teamJobsQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('team-jobs'), selected: selection,
  filters: teamReportFiltersSchema.default({ members: [] }),
  page: page.default(1), pageSize: pageSize.default(25),
}).strict();
export type TeamJobsQuery = z.infer<typeof teamJobsQuerySchema>;

const workload = z.object({
  count, overdue: count, waiting: count,
  statuses: z.object({
    'needs-scheduling': count, scheduled: count, 'in-progress': count, waiting: count,
  }).strict(),
}).strict();
export const teamJobsResultSchema = z.object({
  view: z.literal('team-jobs'),
  asOf: z.iso.datetime(), today: date, timezone: z.string().trim().min(1),
  scopeLabel: z.string().trim().min(1),
  filters: teamReportFiltersSchema,
  scope: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('workspace') }).strict(),
    z.object({ kind: z.literal('assigned'), currentMemberId: memberId }).strict(),
  ]),
  counts: z.object({ active: count, overdue: count, waiting: count }).strict(),
  members: z.array(z.object({
    id: memberId, label: z.string().trim().min(1), primary: workload, supporting: workload,
  }).strict()),
  unassigned: workload.nullable(),
  selected: selection, page, pageSize, evidenceTotal: count,
  rows: z.array(z.object({
    id: z.uuid(), recordId: z.uuid(), label: z.string().trim().min(1),
    status: z.enum(statuses), completionDeadline: date.nullable(), scheduledDate: date.nullable(),
    waitingReason: z.enum(jobWaitingReasons).nullable(),
    cells: z.object({ service: z.string().trim().min(1) }).strict(),
    primary: z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('member'), id: memberId }).strict(),
      z.object({ kind: z.literal('unassigned') }).strict(),
      z.object({ kind: z.literal('withheld') }).strict(),
    ]),
    supportingMemberIds: z.array(memberId),
  }).strict()).max(100),
}).strict().superRefine((result, context) => {
  const { counts, members, scope, selected } = result;
  const filtered = result.filters.members;
  const sum = (items: readonly number[]) => items.reduce((total, value) => total + value, 0);
  const validWorkload = (value: z.infer<typeof workload>) =>
    sum(Object.values(value.statuses)) === value.count && value.count <= counts.active &&
    value.overdue <= value.count && value.overdue <= counts.overdue &&
    value.waiting === value.statuses.waiting && value.waiting <= counts.waiting;
  const selectedWorkload = selected.kind === 'queue' ? undefined
    : selected.kind === 'unassigned' ? result.unassigned
      : members.find(member => member.id === selected.id)?.[selected.responsibility];
  const selectedTotal = selected.kind === 'queue'
    ? selected.queue === 'unassigned' ? result.unassigned?.count : counts[selected.queue]
    : selectedWorkload === null || selectedWorkload === undefined ? undefined
      : selected.filter === 'all' ? selectedWorkload.count
        : selected.filter === 'overdue' ? selectedWorkload.overdue : selectedWorkload.statuses[selected.filter];
  const primaryWorkloads = [...members.map(member => member.primary), ...(result.unassigned ? [result.unassigned] : [])];
  const reconciles = (key: 'count' | 'overdue' | 'waiting', total: number) => {
    const values = scope.kind === 'assigned'
      ? members.flatMap(member => [member.primary[key], member.supporting[key]])
      : primaryWorkloads.map(value => value[key]);
    return Number.isSafeInteger(sum(values)) && sum(values) === total;
  };
  const overdue = (row: typeof result.rows[number]) =>
    row.completionDeadline !== null && row.completionDeadline < result.today;
  const validRows = result.rows.every(row => {
    const primary = row.primary;
    const supporting = row.supportingMemberIds;
    if (filtered.length > 0 && !(primary.kind === 'member' && filtered.includes(primary.id)) &&
      !supporting.some(id => filtered.includes(id))) return false;
    if (row.id !== row.recordId || (row.status === 'waiting') !== (row.waitingReason !== null) ||
      new Set(supporting).size !== supporting.length ||
      supporting.some(id => !members.some(member => member.id === id)) ||
      (primary.kind === 'member' && (!members.some(member => member.id === primary.id) ||
        supporting.includes(primary.id)))) return false;
    if (scope.kind === 'assigned') {
      if (primary.kind === 'unassigned' ||
        (primary.kind === 'member' && primary.id !== scope.currentMemberId) ||
        supporting.some(id => id !== scope.currentMemberId) ||
        (primary.kind === 'withheld' && !supporting.includes(scope.currentMemberId))) return false;
    } else if (primary.kind === 'withheld') return false;
    if (selected.kind === 'queue') {
      return selected.queue === 'active' || (selected.queue === 'overdue' ? overdue(row)
        : selected.queue === 'waiting' ? row.status === 'waiting' : primary.kind === 'unassigned');
    }
    const participates = selected.kind === 'unassigned' ? primary.kind === 'unassigned'
      : selected.responsibility === 'primary' ? primary.kind === 'member' && primary.id === selected.id
        : supporting.includes(selected.id);
    return participates && (selected.filter === 'all' ||
      (selected.filter === 'overdue' ? overdue(row) : row.status === selected.filter));
  });
  const observed = (predicate: (row: typeof result.rows[number]) => boolean, total: number) => {
    const value = result.rows.filter(predicate).length;
    return value <= total && total - value <= counts.active - result.rows.length;
  };
  const observedWorkload = (
    predicate: (row: typeof result.rows[number]) => boolean,
    value: z.infer<typeof workload>,
  ) => observed(predicate, value.count) &&
    observed(row => predicate(row) && overdue(row), value.overdue) &&
    statuses.every(status => observed(row => predicate(row) && row.status === status, value.statuses[status]));
  const valid = filtered.every(id => members.some(member => member.id === id)) &&
    (scope.kind !== 'assigned' || filtered.every(id => id === scope.currentMemberId)) &&
    (filtered.length === 0 || sum(members.filter(member => filtered.includes(member.id))
      .map(member => member.primary.count + member.supporting.count)) >= counts.active) &&
    counts.overdue <= counts.active && counts.waiting <= counts.active &&
    new Set(members.map(member => member.id)).size === members.length &&
    members.every(member => validWorkload(member.primary) && validWorkload(member.supporting) &&
      member.primary.count + member.supporting.count <= counts.active) &&
    (scope.kind === 'assigned'
      ? result.unassigned === null && members.length === 1 && members[0]?.id === scope.currentMemberId &&
        selected.kind !== 'unassigned' && !(selected.kind === 'queue' && selected.queue === 'unassigned')
      : result.unassigned !== null && validWorkload(result.unassigned)) &&
    reconciles('count', counts.active) && reconciles('overdue', counts.overdue) && reconciles('waiting', counts.waiting) &&
    selectedTotal !== undefined && result.evidenceTotal === selectedTotal &&
    result.page <= Math.max(1, Math.ceil(result.evidenceTotal / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, result.evidenceTotal - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => row.id)).size === result.rows.length && validRows &&
    observed(overdue, counts.overdue) && observed(row => row.status === 'waiting', counts.waiting) &&
    (result.unassigned === null || observedWorkload(row => row.primary.kind === 'unassigned', result.unassigned)) &&
    members.every(member => (['primary', 'supporting'] as const).every(responsibility =>
      observedWorkload(row => responsibility === 'primary'
        ? row.primary.kind === 'member' && row.primary.id === member.id
        : row.supportingMemberIds.includes(member.id), member[responsibility])));
  if (!valid) context.addIssue({ code: 'custom', message: 'Team Jobs workload and evidence do not reconcile.' });
});
export type TeamJobsResult = z.infer<typeof teamJobsResultSchema>;
