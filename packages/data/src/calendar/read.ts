import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { calendarQuerySchema, calendarAdvisorySchema, type CalendarQuery, type CalendarVisit, type CalendarResult,
  type CalendarQueryValue, type AuthorizationContext, type PermissionId, type AuthorizationResource, type JobStatus, type WorkOrderStatus, type arrivalWindows } from '@salesmora/contracts';
import { addCalendarDays, calendarWeekStart, authorize, resolveAuthorizedCollectionScope, CalendarRevisionError } from '@salesmora/domain';
import { AuthorizationAccessError, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';

type Row = {
  visitId: string; visitVersion: number; workspaceId: string; id: string; type: 'job' | 'work_order'; number: number; title: string; status: JobStatus | WorkOrderStatus; version: number;
  customerName: string; location: string; scheduledDate: string | null; arrivalWindow: typeof arrivalWindows[number] | null; deadline: string | null;
  primaryId: string | null; people: string[]; jobId: string; jobOwnerId: string | null; jobTeam: string[]; activeCount: number;
};
const peopleSQL = (primary: string, table: string, alias: string, foreign: string, row: string) =>
  `ARRAY(SELECT DISTINCT p FROM unnest(ARRAY[${primary}]::text[] || ARRAY(SELECT ${alias}."userId" FROM "${table}" ${alias} WHERE ${alias}."workspaceId"=${row}."workspaceId" AND ${alias}."${foreign}"=${row}.id)) p WHERE p IS NOT NULL)`;
const jobTeamSQL = `ARRAY(SELECT jt."userId" FROM "jobTeamMembers" jt WHERE jt."workspaceId"=j."workspaceId" AND jt."jobId"=j.id)`;
const jobPeople = peopleSQL('j."primaryOwnerId"', 'jobTeamMembers', 'jt', 'jobId', 'j');
const orderPeople = peopleSQL('w."primaryAssigneeId"', 'workOrderCrew', 'wc', 'workOrderId', 'w');
const scopes = (context: AuthorizationContext) => ({ calendar: resolveAuthorizedCollectionScope(context, 'calendar.read'),
  job: resolveAuthorizedCollectionScope(context, 'jobs.read'), work_order: resolveAuthorizedCollectionScope(context, 'workorders.read') });
function calendarScope(context: AuthorizationContext) {
  const scope = scopes(context).calendar;
  if (!scope.allowed || !['workspace', 'own_assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
  return scope.scope === 'own_assigned' ? 'own' as const : 'workspace' as const;
}
function visible(trx: Knex.Transaction, context: AuthorizationContext, range?: { from:string;to:string }) {
  const scope = scopes(context), own = calendarScope(context) === 'own';
  const jobs = trx('jobs as j').join('calendarVisitRecords as r', q => q.on('r.workspaceId', 'j.workspaceId').andOn('r.jobId', 'j.id'))
    .join('calendarVisits as v', q => q.on('v.workspaceId', 'r.workspaceId').andOn('v.id', 'r.visitId'))
    .where('j.workspaceId', context.workspaceId).whereNull('r.endedAt').whereNotIn('j.status', ['completed', 'canceled']);
  const orders = trx('workOrders as w').join('jobs as j', q => q.on('j.workspaceId', 'w.workspaceId').andOn('j.id', 'w.jobId'))
    .join('calendarVisitRecords as r', q => q.on('r.workspaceId', 'w.workspaceId').andOn('r.workOrderId', 'w.id'))
    .join('calendarVisits as v', q => q.on('v.workspaceId', 'r.workspaceId').andOn('v.id', 'r.visitId'))
    .where('w.workspaceId', context.workspaceId).whereNull('r.endedAt').whereNull('w.archivedAt').whereNotIn('w.status', ['completed', 'canceled']);
  // Every linked record shares its visit date. Restrict visits before computing people,
  // deadlines and full active membership, while retaining the entire unscheduled queue.
  if (range) for (const records of [jobs,orders]) records.where(q => q.whereBetween('v.scheduledDate',[range.from,range.to]).orWhereNull('v.scheduledDate'));
  const jobAllowed = scope.job.allowed && ['workspace', 'assigned'].includes(scope.job.scope);
  const orderAllowed = scope.work_order.allowed && ['workspace', 'assigned_job'].includes(scope.work_order.scope);
  if (!jobAllowed) jobs.whereRaw('false');
  if (own || (scope.job.allowed && scope.job.scope === 'assigned')) jobs.whereRaw('? = ANY(' + jobPeople + ')', [context.userId]);
  if (!orderAllowed) orders.whereRaw('false');
  if (scope.work_order.allowed && scope.work_order.scope === 'assigned_job') {
    orders.whereNot('w.status', 'draft').whereRaw('(? = ANY(' + orderPeople + ') OR ? = ANY(' + jobPeople + '))', [context.userId, context.userId]);
  }
  if (own) orders.whereRaw('? = ANY(' + orderPeople + ')', [context.userId]);
  const common = `v.id AS "visitId", v.version AS "visitVersion", v."workspaceId", to_char(v."scheduledDate",'YYYY-MM-DD') AS "scheduledDate", v."arrivalWindow",
    (SELECT count(*)::int FROM "calendarVisitRecords" allr WHERE allr."workspaceId"=v."workspaceId" AND allr."visitId"=v.id AND allr."endedAt" IS NULL) AS "activeCount"`;
  jobs.select(trx.raw(`${common}, j.id, 'job' AS type, j."jobNumber" AS number, j.title, j.status, j.version, j."customerName", j.location,
    to_char(j."completionDeadline",'YYYY-MM-DD') AS deadline, j."primaryOwnerId" AS "primaryId", ${jobPeople} AS people, j.id AS "jobId", j."primaryOwnerId" AS "jobOwnerId", ${jobTeamSQL} AS "jobTeam"`));
  // Only a Job already readable in this Calendar scope may contribute a completion deadline.
  const limitedParent = jobAllowed && (own || (scope.job.allowed && scope.job.scope === 'assigned'));
  const parentVisible = jobAllowed ? `j.status NOT IN ('completed','canceled') AND (${limitedParent ? '? = ANY(' + jobPeople + ')' : 'true'})` : 'false';
  orders.select(trx.raw(`${common}, w.id, 'work_order' AS type, w."workOrderNumber" AS number, w.title, w.status, w.version, j."customerName", j.location,
    CASE WHEN ${parentVisible} THEN to_char(j."completionDeadline",'YYYY-MM-DD') ELSE NULL END AS deadline,
    w."primaryAssigneeId" AS "primaryId", ${orderPeople} AS people, j.id AS "jobId", j."primaryOwnerId" AS "jobOwnerId", ${jobTeamSQL} AS "jobTeam"`, limitedParent ? [context.userId] : []));
  return jobs.unionAll([orders]);
}
function resource(row: Row): AuthorizationResource {
  if (row.type === 'job') return { kind: 'job', id: row.id, workspaceId: row.workspaceId, ownerId: row.primaryId, teamUserIds: row.jobTeam };
  return { kind: 'work_order', id: row.id, workspaceId: row.workspaceId, primaryAssigneeId: row.primaryId, assigneeIds: row.people,
    job: { kind: 'job', id: row.jobId, workspaceId: row.workspaceId, ownerId: row.jobOwnerId, teamUserIds: row.jobTeam } };
}
function canSchedule(context: AuthorizationContext, row: Row) {
  return authorize(context, { permission: row.type === 'job' ? 'jobs.schedule.update' : 'workorders.schedule.update', resource: resource(row) }).allowed;
}
function candidates(trx: Knex.Transaction, query: CalendarQueryValue, viewerId: string) {
  const ids = trx('visible as f').select('f.visitId').groupBy('f.visitId');
  if (query.recordType !== 'all') ids.where('f.type', query.recordType);
  if (query.status !== 'all') { const [type, status] = query.status.split(':'); ids.where({ 'f.type': type, 'f.status': status }); }
  if (query.customerQuery.trim()) ids.whereRaw(`f."customerName" ILIKE ? ESCAPE '\\'`, ['%' + query.customerQuery.trim().replace(/[\\%_]/g, '\\$&') + '%']);
  const person = query.person === 'me' ? viewerId : query.person.startsWith('member:') ? query.person.slice(7) : null;
  if (person) ids.whereExists(trx('visible as p').select(trx.raw('1')).whereRaw('p."visitId"=f."visitId" AND ? = ANY(p.people)', [person]));
  if (query.person === 'unassigned') ids.whereNotExists(trx('visible as p').select(trx.raw('1')).whereRaw('p."visitId"=f."visitId" AND cardinality(p.people)>0'));
  return ids;
}
async function metadata(trx: Knex.Transaction, context: AuthorizationContext) {
  const scope = calendarScope(context);
  const workspace = await trx('workspaces').where({ id: context.workspaceId }).select('timezone').first();
  const { today } = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [workspace.timezone])).rows[0];
  return { scope, timezone: workspace.timezone as string, today: today as string };
}
async function project(trx: Knex.Transaction, context: AuthorizationContext, rows: Row[], meta: Awaited<ReturnType<typeof metadata>>): Promise<CalendarVisit[]> {
  const ids = [...new Set(rows.flatMap(row => row.people))];
  const names = await trx('users').whereIn('id', meta.scope === 'own' ? [context.userId] : ids).select('id', 'name');
  const name = new Map<string, string>(names.map(row => [row.id, row.name]));
  const grouped = new Map<string, Row[]>();
  for (const row of rows) grouped.set(row.visitId, [...(grouped.get(row.visitId) ?? []), row]);
  return [...grouped.values()].map(records => {
    records.sort((a, b) => a.type.localeCompare(b.type) || a.number - b.number || a.id.localeCompare(b.id));
    const row = records[0], allowed = records.length === row.activeCount && records.every(r => canSchedule(context, r));
    const people = [...new Set(records.flatMap(r => r.people))].filter(id => meta.scope !== 'own' || id === context.userId);
    const deadlines = records.map(r => r.deadline).filter((d): d is string => !!d).sort();
    const refs = records.map(r => ({ type: r.type, id: r.id, expectedVersion: r.version }));
    return { id: row.visitId, title: row.title, customerName: row.customerName, location: row.location || null, nextStep: null,
      scheduledDate: row.scheduledDate, arrivalWindow: row.arrivalWindow, timezone: meta.timezone,
      records: records.map(r => r.type === 'job' ? { type: 'job' as const, id: r.id, number: `J-${String(r.number).padStart(4, '0')}`, title: r.title, status: r.status as JobStatus }
        : { type: 'work_order' as const, id: r.id, number: `WO-${String(r.number).padStart(4, '0')}`, title: r.title, status: r.status as WorkOrderStatus }),
      crew: people.map(id => ({ id, name: name.get(id) ?? 'Former teammate' })),
      completionDeadline: deadlines.length ? { date: deadlines[0], overdue: deadlines[0] < meta.today } : null,
      waiting: records.some(r => r.type === 'job' && r.status === 'waiting'), canReschedule: allowed,
      revision: createHash('sha256').update(JSON.stringify([row.visitVersion, refs])).digest('hex'),
      review: allowed ? { expectedVisitVersion: row.visitVersion, records: refs } : null };
  });
}
export async function readCalendar(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: CalendarQuery): Promise<CalendarResult> {
  const input = calendarQuerySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const meta = await metadata(trx, context), weekDate = calendarWeekStart(input.date ?? meta.today);
    const query = { ...input, date: weekDate, person: meta.scope === 'own' ? 'me' : input.person };
    const base = () => trx.with('visible', visible(trx, context,{ from:weekDate,to:addCalendarDays(weekDate,6) }));
    const matching = () => candidates(trx, query, context.userId);
    const queueCount = await base().from('visible').whereNull('scheduledDate').whereIn('visitId', matching()).countDistinct('visitId as count').first() as { count: string };
    const unscheduledTotal = Number(queueCount.count), queuePages = Math.max(1, Math.ceil(unscheduledTotal / 10));
    query.queuePage = Math.min(query.queuePage, queuePages);
    const queue = trx('visible').select('visitId').whereNull('scheduledDate').whereIn('visitId', matching()).groupBy('visitId')
      .orderByRaw("min(deadline) ASC NULLS LAST, min(CASE WHEN type='job' THEN '0:' ELSE '1:' END || lpad(number::text,12,'0')) ASC").orderBy('visitId').limit(10).offset((query.queuePage - 1) * 10);
    const rows: Row[] = await base().from('visible').select('*').where(q => q.whereBetween('scheduledDate', [weekDate, addCalendarDays(weekDate, 6)]).whereIn('visitId', matching()).orWhereIn('visitId', queue));
    const visits = await project(trx, context, rows, meta);
    const scope = scopes(context), wide = meta.scope === 'workspace' && [scope.job, scope.work_order].some(s => s.allowed && s.scope === 'workspace');
    const scopedPeople: { id: string }[] = !wide && meta.scope === 'workspace'
      ? await trx.with('visible',visible(trx,context)).from('visible').select(trx.raw('DISTINCT unnest(people) AS id')) : [];
    const members = await trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId').where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt')
      .modify(q => { if (!wide) q.whereIn('u.id', meta.scope === 'own' ? [context.userId] : [...new Set([context.userId, ...scopedPeople.map(p => p.id)])]); })
      .select('u.id', 'u.name').orderBy('u.name').orderBy('u.id');
    const entries = visits.filter((v): v is CalendarVisit & { scheduledDate: string } => v.scheduledDate !== null);
    const unscheduled = visits.filter(v => v.scheduledDate === null).sort((a, b) => (a.completionDeadline?.date ?? '9999').localeCompare(b.completionDeadline?.date ?? '9999') || a.records[0].number.localeCompare(b.records[0].number, 'en', { numeric: true }) || a.id.localeCompare(b.id));
    // Launcher availability only; each selected visit has its own complete-record capability check.
    const ownJob = { kind: 'job' as const, id: context.workspaceId, workspaceId: context.workspaceId, ownerId: context.userId, teamUserIds: [] };
    const canPlan = authorize(context, { permission: 'jobs.schedule.update', resource: ownJob }).allowed || authorize(context, { permission: 'workorders.schedule.update', resource: { kind: 'work_order', id: context.workspaceId, workspaceId: context.workspaceId, primaryAssigneeId: context.userId, assigneeIds: [context.userId], job: ownJob } }).allowed;
    return { query, weekDate, today: meta.today, timezone: meta.timezone, scope: meta.scope, viewerId: context.userId, members,
      canSchedule: canPlan, entries, unscheduled, unscheduledTotal, queuePages };
  });
}
export async function readCalendarVisit(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], visitId: string): Promise<CalendarVisit> {
  // Reuse the strict identity validator without accepting unrelated query parameters.
  calendarAdvisorySchema.shape.visitId.parse(visitId);
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const meta = await metadata(trx, context);
    const rows: Row[] = await trx.with('visible', visible(trx, context)).from('visible').where({ visitId }).select('*');
    if (!rows.length) throw new AuthorizationAccessError();
    return (await project(trx, context, rows, meta))[0];
  });
}
export async function readCalendarAdvisories(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown) {
  const input = calendarAdvisorySchema.parse(raw);
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async trx => {
    const target = await readCalendarVisit(trx, identity, enabled, input.visitId);
    if (!target.canReschedule) throw new AuthorizationAccessError();
    if (target.revision !== input.revision) throw new CalendarRevisionError();
    if (!input.schedule.scheduledDate) return { messages: [] as string[] };
    const result = await readCalendar(trx, identity, enabled, { workspaceId: identity.workspaceId, date: input.schedule.scheduledDate });
    const others = result.entries.filter(v => v.id !== target.id && v.scheduledDate === input.schedule.scheduledDate);
    const messages: string[] = [];
    const span = (window: string) => window.split('-').map(t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3)));
    for (const person of target.crew) {
      const work = others.filter(v => v.crew.some(p => p.id === person.id));
      if (work.length + 1 >= 4) messages.push(`${person.name} would have ${work.length + 1} visits on this date in the schedule you can access.`);
      if (input.schedule.arrivalWindow && work.some(v => { if (!v.arrivalWindow) return false;
        const [a, b] = span(input.schedule.arrivalWindow!), [c, d] = span(v.arrivalWindow); return a < d && c < b; })) {
        messages.push(`${person.name} has an overlapping arrival window in the schedule you can access.`);
      }
    }
    return { messages };
  });
}
