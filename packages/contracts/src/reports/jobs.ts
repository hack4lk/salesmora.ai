import { z } from 'zod';
import { jobDateSchema, jobWaitingReasons } from '../job';

const activeStatuses = ['needs-scheduling', 'scheduled', 'in-progress', 'waiting'] as const;
const metrics = ['active', 'overdue', 'dueSoon', 'noDeadline', 'waiting', 'unassigned'] as const;
const groupings = ['status', 'owner', 'service', 'waitingReason'] as const;
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const page = z.number().int().min(1).max(100000);
const pageSize = z.union([z.literal(25), z.literal(50), z.literal(100)]);
const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const distinct = <T extends z.ZodType>(schema: T, max: number) =>
  z.array(schema).max(max).refine(values => new Set(values).size === values.length);
const ownerFilter = z.string().trim().min(1).max(220)
  .refine(value => value === 'unassigned' || (value.startsWith('member:') && value.length > 7));
const serviceFilter = z.string().trim().min(1).max(220)
  .refine(value => value === 'none' || (value.startsWith('service:') && value.length > 8));

export const jobWorkloadQuerySchema = z.object({
  workspaceId: z.uuid(),
  view: z.literal('workload'),
  filters: z.object({
    statuses: distinct(z.enum(activeStatuses), activeStatuses.length).default([]),
    owners: distinct(ownerFilter, 50).default([]),
    services: distinct(serviceFilter, 50).default([]),
  }).strict(),
  selection: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('metric'), metric: z.enum(metrics) }).strict(),
    z.object({ kind: z.literal('group'), group: z.enum(groupings), id: z.string().trim().min(1).max(220) }).strict()
      .superRefine((selection, issueContext) => {
        const valid = selection.group === 'status'
          ? activeStatuses.includes(selection.id as typeof activeStatuses[number])
          : selection.group === 'waitingReason'
            ? jobWaitingReasons.includes(selection.id as typeof jobWaitingReasons[number])
            : selection.group === 'owner'
              ? selection.id === 'unassigned' || (selection.id.startsWith('member:') && selection.id.length > 7)
              : selection.id === 'none' || (selection.id.startsWith('service:') && selection.id.length > 8);
        if (!valid) issueContext.addIssue({ code: 'custom', message: 'Invalid Job workload group selection.' });
      }),
  ]),
  page: page.default(1),
  pageSize: pageSize.default(25),
}).strict();
export type JobWorkloadQuery = z.infer<typeof jobWorkloadQuerySchema>;

const group = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  count,
  evidenceId: z.string().min(1),
}).strict();
const addDays = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
const groups = z.object({
  status: z.array(group),
  owner: z.array(group),
  service: z.array(group),
  waitingReason: z.array(group),
}).strict();
const resultBase = z.object({
  view: z.literal('workload'),
  asOf: z.iso.datetime(),
  today: date,
  timezone: z.string().min(1),
  scopeLabel: z.string().min(1),
  filters: jobWorkloadQuerySchema.shape.filters,
  counts: z.object({
    active: count,
    overdue: count,
    dueSoon: count,
    noDeadline: count,
    waiting: count,
    unassigned: count,
  }).strict(),
  groups,
  evidenceIds: z.object({
    active: z.string().min(1),
    overdue: z.string().min(1),
    dueSoon: z.string().min(1),
    noDeadline: z.string().min(1),
    waiting: z.string().min(1),
    unassigned: z.string().min(1),
  }).strict(),
  selection: jobWorkloadQuerySchema.shape.selection,
  page,
  pageSize,
  evidenceTotal: count,
  rows: z.array(z.object({
    id: z.uuid(),
    label: z.string().min(1),
    recordId: z.uuid(),
    cells: z.record(z.string(), z.string()),
    status: z.enum(activeStatuses),
    completionDeadline: date.nullable(),
    scheduledDate: date.nullable(),
    primaryOwnerId: z.string().trim().min(1).nullable(),
    serviceId: z.string().min(1),
    waitingReason: z.enum(jobWaitingReasons).nullable(),
  }).strict()),
}).strict();

export const jobWorkloadResultSchema = resultBase.superRefine((result, issueContext) => {
  const { counts, groups: resultGroups, selection } = result;
  const selectedGroup = selection.kind === 'group'
    ? resultGroups[selection.group].find(item => item.id === selection.id)
    : undefined;
  const selectedMetric = selection.kind === 'metric' ? counts[selection.metric] : undefined;
  const selectedTotal = selectedMetric ?? selectedGroup?.count;
  const countGroups = (items: readonly { count: number }[]) =>
    items.reduce((sum, item) => sum + item.count, 0);
  const expectedRows = selectedTotal === undefined ? -1 : Math.min(
    result.pageSize,
    Math.max(0, selectedTotal - (result.page - 1) * result.pageSize),
  );
  const statusTotal = countGroups(resultGroups.status);
  const ownerTotal = countGroups(resultGroups.owner);
  const serviceTotal = countGroups(resultGroups.service);
  const waitingTotal = countGroups(resultGroups.waitingReason);
  const deadlineTotal = counts.overdue + counts.dueSoon;
  const validStatusGroups = activeStatuses.every(status =>
    resultGroups.status.some(item => item.id === status)) &&
    resultGroups.status.length === activeStatuses.length &&
    new Set(resultGroups.status.map(item => item.id)).size === resultGroups.status.length;
  const validWaitingGroups = jobWaitingReasons.every(reason =>
    resultGroups.waitingReason.some(item => item.id === reason)) &&
    resultGroups.waitingReason.length === jobWaitingReasons.length &&
    new Set(resultGroups.waitingReason.map(item => item.id)).size === resultGroups.waitingReason.length;
  const validOtherGroups =
    new Set(resultGroups.owner.map(item => item.id)).size === resultGroups.owner.length &&
    new Set(resultGroups.service.map(item => item.id)).size === resultGroups.service.length &&
    resultGroups.owner.every(item => item.id === 'unassigned' ||
      (item.id.startsWith('member:') && item.id.length > 7)) &&
    resultGroups.service.every(item => item.id === 'none' ||
      (item.id.startsWith('service:') && item.id.length > 8)) &&
    resultGroups.owner.filter(item => item.id === 'unassigned').length === 1 &&
    resultGroups.service.filter(item => item.id === 'none').length === 1;
  const allEvidenceIds = [
    ...Object.values(result.evidenceIds),
    ...Object.values(resultGroups).flatMap(items => items.map(item => item.evidenceId)),
  ];
  const validGroupTotals =
    [statusTotal, ownerTotal, serviceTotal, waitingTotal, deadlineTotal].every(Number.isSafeInteger) &&
    statusTotal === counts.active &&
    ownerTotal === counts.active &&
    serviceTotal === counts.active &&
    waitingTotal === counts.waiting &&
    (resultGroups.status.find(item => item.id === 'waiting')?.count ?? -1) === counts.waiting &&
    (resultGroups.owner.find(item => item.id === 'unassigned')?.count ?? -1) === counts.unassigned;
  const validMetrics = counts.waiting <= counts.active &&
    counts.unassigned <= counts.active &&
    deadlineTotal <= counts.active &&
    counts.noDeadline <= counts.active - counts.overdue - counts.dueSoon;
  const rowMatchesSelection = (row: typeof result.rows[number]) => {
    if (selection.kind === 'group') {
      switch (selection.group) {
        case 'status': return row.status === selection.id;
        case 'owner': return (row.primaryOwnerId === null ? 'unassigned' : `member:${row.primaryOwnerId}`) === selection.id;
        case 'service': return row.serviceId === selection.id;
        case 'waitingReason': return row.waitingReason === selection.id;
      }
    }
    switch (selection.metric) {
      case 'active': return true;
      case 'overdue': return row.completionDeadline !== null && row.completionDeadline < result.today;
      case 'dueSoon': return row.completionDeadline !== null &&
        row.completionDeadline >= result.today && row.completionDeadline <= addDays(result.today, 7);
      case 'noDeadline': return row.completionDeadline === null;
      case 'waiting': return row.status === 'waiting';
      case 'unassigned': return row.primaryOwnerId === null;
    }
  };
  const rowsMatchGroups = result.rows.every(row => {
    const ownerId = row.primaryOwnerId === null ? 'unassigned' : `member:${row.primaryOwnerId}`;
    return resultGroups.status.some(item => item.id === row.status && item.count > 0) &&
      resultGroups.owner.some(item => item.id === ownerId && item.count > 0) &&
      resultGroups.service.some(item => item.id === row.serviceId && item.count > 0) &&
      (row.waitingReason === null ||
        resultGroups.waitingReason.some(item => item.id === row.waitingReason && item.count > 0));
  });
  if (!validStatusGroups || !validWaitingGroups || !validOtherGroups || !validGroupTotals || !validMetrics ||
    new Set(allEvidenceIds).size !== allEvidenceIds.length ||
    selectedTotal === undefined || result.evidenceTotal !== selectedTotal ||
    result.page > Math.max(1, Math.ceil(result.evidenceTotal / result.pageSize)) ||
    result.rows.length !== expectedRows ||
    new Set(result.rows.map(row => row.id)).size !== result.rows.length ||
    !rowsMatchGroups ||
    result.rows.some(row => row.id !== row.recordId || !activeStatuses.includes(row.status as typeof activeStatuses[number]) ||
      !Object.hasOwn(row.cells, 'owner') || !Object.hasOwn(row.cells, 'service') ||
      (row.status === 'waiting') !== (row.waitingReason !== null) || !rowMatchesSelection(row))) {
    issueContext.addIssue({ code: 'custom', message: 'Job workload evidence does not reconcile.' });
  }
});
export type JobWorkloadResult = z.infer<typeof jobWorkloadResultSchema>;
