import {mutateJobInTransaction} from '../jobs/store';
import { createHash } from 'node:crypto';
import type { Knex } from 'knex';
import { calendarBookingCommandSchema, calendarBookingSearchSchema, calendarAvailabilitySchema, jobDateSchema, calendarWeekdays, CalendarContractError,
  type AuthorizationContext, type CalendarBookingCommand, type CalendarBookingReason, type CalendarBookingResult, type CalendarBookingRules,
  type CalendarBookingSearchResult, type CalendarVisit, type PermissionId } from '@salesmora/contracts';
import { addCalendarDays, authorize, resolveAuthorizedCollectionScope, CalendarRevisionError, findCommonCalendarSlot,
  type CalendarBookingBusy, type CalendarBookingInterval } from '@salesmora/domain';
import { AuthorizationAccessError, withCurrentWorkspaceMutation, withWorkspaceAuthorization, type WorkspaceIdentity } from '../authorization/store';
import { readCalendarVisitInTransaction, scopedCalendarRecordsQuery } from './read';
import { scheduleCalendarVisitInTransaction } from './commands';

type Search = { result: CalendarBookingSearchResult; target?: CalendarVisit; selectedWorkerId?:string;selectedWorkerName?:string };
type Window = { key: string; date: string; startTime: string; endDate: string; endTime: string; timezone: string; minutes: number };
const missing = (...reasons: CalendarBookingReason[]): Search => ({ result: { status: 'no_slot', reasons: [...new Set(reasons)] } });
const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const local = (at: number, timezone: string) => {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(at);
  const part = (key: string) => p.find(value => value.type === key)!.value;
  return { date: `${part('year')}-${part('month')}-${part('day')}`, startTime: `${part('hour')}:${part('minute')}` };
};
function requireAuthority(context: AuthorizationContext) {
  // An assigned-only projection cannot establish complete team occupancy. Fail closed.
  for (const permission of ['calendar.read', 'jobs.read', 'workorders.read'] as const) {
    const scope = resolveAuthorizedCollectionScope(context, permission);
    if (!scope.allowed || scope.scope !== 'workspace') throw new AuthorizationAccessError();
  }
  const job = { kind: 'job' as const, id: context.workspaceId, workspaceId: context.workspaceId, ownerId: context.userId, teamUserIds: [] };
  const order = { kind: 'work_order' as const, id: context.workspaceId, workspaceId: context.workspaceId, primaryAssigneeId: context.userId, assigneeIds: [context.userId], job };
  for (const [permission, resource] of [['jobs.schedule.update', job], ['workorders.schedule.update', order]] as const) {
    const decision = authorize(context, { permission, resource });
    if (!decision.allowed || decision.scope !== 'workspace') throw new AuthorizationAccessError();
  }
}
async function jobExists(trx: Knex.Transaction, context: AuthorizationContext, jobId: string) {
  const job = await trx('jobs').where({ workspaceId: context.workspaceId, id: jobId }).first('id', 'status','serviceId','version','postalCode','countryCode');
  if (!job) throw new AuthorizationAccessError();
  return job;
}
async function searchInTransaction(trx: Knex.Transaction, context: AuthorizationContext, job: { id: string; status: string; serviceId?:string|null;postalCode?:string|null;countryCode?:string|null }, rules: CalendarBookingRules, window?: { fromDate: string; throughDate: string; assignmentMode?:'assigned'|'qualified_if_unassigned' }): Promise<Search> {
  if(window&&(!job.postalCode||job.countryCode!=='US'))return missing('missing_zip');
  if (job.status !== 'needs-scheduling') return missing('ineligible');
  const link = await trx('calendarVisitRecords').where({ workspaceId: context.workspaceId, jobId: job.id }).whereNull('endedAt').first('visitId');
  if (!link) return missing('ineligible');
  const target = await readCalendarVisitInTransaction(trx, context, link.visitId);
  if (!target.canReschedule || !target.review || target.scheduledDate || target.records.some(ref => ref.type === 'job' ? ref.id !== job.id || ref.status !== 'needs-scheduling' : ref.status !== 'issued')) return missing('ineligible');
  let people = [...new Set(target.crew.map(person => person.id))];
  const selecting=window?.assignmentMode==='qualified_if_unassigned'&&!people.length;
  if(selecting&&target.records.length!==1)return missing('manual_assignment');
  if(!selecting&&!people.length)return missing('unassigned');
  if (people.length > 100 || target.records.length > 100) return missing('capacity_limit');
  const workspace = await trx('workspaces').where({ id: context.workspaceId }).select('timezone', trx.raw(`to_char(current_timestamp AT TIME ZONE timezone,'YYYY-MM-DD') AS today`)).first();
  const timezone = workspace.timezone as string;
  const tomorrow = addCalendarDays(workspace.today, 1), from = window && window.fromDate > tomorrow ? window.fromDate : tomorrow;
  const horizon = addCalendarDays(from, rules.horizonDays - 1), through = window && window.throughDate < horizon ? window.throughDate : horizon;
  const last = target.completionDeadline && target.completionDeadline.date < through ? target.completionDeadline.date : through;
  if (last < from) return missing('deadline');
  // One member/rules batch; missing or suspended people never acquire implicit working hours.
  const query = trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
    .leftJoin('calendarPersonAvailability as a', q => q.on('a.workspaceId', 'm.workspaceId').andOn('a.personId', 'm.userId'))
    .where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt').whereNull('u.suspendedAt');
  if(selecting)query.join('serviceQualifiedWorkers as q',q=>q.on('q.workspaceId','m.workspaceId').andOn('q.personId','m.userId')).where('q.serviceId',job.serviceId??null).orderBy('q.priority').orderBy('m.userId');
  else query.whereIn('m.userId',people);
  const allMembers=await query.select('m.userId','u.name','a.availability','a.timezone',trx.raw(`EXISTS(SELECT 1 FROM "workspaceMemberPostalCodes" p WHERE p."workspaceId"=m."workspaceId" AND p."personId"=m."userId" AND p."countryCode"=? AND p."postalCode"=?) AS covers`,[job.countryCode??'',job.postalCode??''])).limit(101).forShare('u');
  if(selecting&&allMembers.length>100)return missing('capacity_limit');
  if(selecting&&!allMembers.length)return missing('no_qualified_workers');
  if(!selecting&&allMembers.length!==people.length)return missing('inactive_person');
  if(window&&!selecting&&allMembers.some(member=>!member.covers))return missing('outside_coverage');
  const covered=window?allMembers.filter(member=>member.covers):allMembers;
  if(window&&selecting&&!covered.length)return missing('outside_coverage');
  const members=covered.filter(member=>member.availability&&calendarAvailabilitySchema.parse(member.availability).weeklyHours);
  if(!members.length||!selecting&&members.length!==allMembers.length)return missing('unknown_hours');
  if(selecting)people=members.map(member=>member.userId);
  const windows: Window[] = [];
  const add = (key: string, date: string, startTime: string, endTime: string, zone: string) => windows.push({ key, date, startTime, endDate: date, endTime, timezone: zone, minutes: minutes(endTime) - minutes(startTime) });
  for (let date = from; date <= last; date = addCalendarDays(date, 1)) {
    if (rules.weekdays.includes(calendarWeekdays[(new Date(date + 'T12:00:00Z').getUTCDay() + 6) % 7])) add('rule', date, rules.hours.startTime, rules.hours.endTime, timezone);
  }
  for (const member of members) {
    const availability = calendarAvailabilitySchema.parse(member.availability);
    for (let date = addCalendarDays(from, -2); date <= addCalendarDays(last, 2); date = addCalendarDays(date, 1)) {
      const day = calendarWeekdays[(new Date(date + 'T12:00:00Z').getUTCDay() + 6) % 7], hours = availability.weeklyHours![day];
      if (hours && !availability.unavailableDates.some(range => range.startDate <= date && range.endDate >= date)) add(member.userId, date, hours.startTime, hours.endTime, member.timezone);
    }
  }
  if (!windows.some(window => window.key === 'rule')) return missing('no_common_slot');
  // A complete bounded range, not the Calendar page, customer filter or queue pagination.
  // Two adjacent dates cover all IANA date offsets and maximum supported gaps.
  const occupied = await trx.with('busy', scopedCalendarRecordsQuery(trx, context, { from: addCalendarDays(from, -2), to: addCalendarDays(last, 2) }))
    .from('busy').whereNotNull('scheduledDate').whereNot('visitId', target.id).whereRaw('people && ?::text[]', [people])
    .select('visitId', 'scheduledDate', 'workStartsAt', 'workEndsAt', 'bookingGapMinutes','people').limit(10001);
  if (occupied.length > 10000) return missing('capacity_limit');
  const byVisit=new Map<string,(typeof occupied)[number]>();for(const row of occupied){const previous=byVisit.get(row.visitId);byVisit.set(row.visitId,previous?{...row,people:[...new Set([...previous.people,...row.people])],bookingGapMinutes:Math.max(previous.bookingGapMinutes??0,row.bookingGapMinutes??0)}:row);}
  const unique=[...byVisit.values()];
  // Resolve rule/availability/unknown-day boundaries once for all candidates.
  const unknownDates=[...new Set<string>(unique.filter(row=>!row.workStartsAt||!row.workEndsAt).map(row=>row.scheduledDate))];
  for(const date of unknownDates)windows.push({key:`unknown:${date}`,date,startTime:'00:00',endDate:addCalendarDays(date,1),endTime:'00:00',timezone,minutes:-1});
  const resolved=await resolveCalendarBookingWindows(trx,windows),valid=new Map<string,CalendarBookingInterval[]>();let clockChange=false;
  for(const item of resolved){if(!item.start||!item.finish||item.minutes!==-1&&item.finish.getTime()-item.start.getTime()!==item.minutes*60000){clockChange=true;continue;}valid.set(item.key,[...(valid.get(item.key)??[]),{start:item.start.getTime(),finish:item.finish.getTime()}]);}
  const busyFor=(ids:string[])=>{const busy:CalendarBookingBusy[]=[];for(const row of unique){if(!row.people.some((id:string)=>ids.includes(id)))continue;
    if(row.workStartsAt&&row.workEndsAt)busy.push({start:new Date(row.workStartsAt).getTime(),finish:new Date(row.workEndsAt).getTime(),gapMinutes:row.bookingGapMinutes??0});
    else {const interval=valid.get(`unknown:${row.scheduledDate}`)?.[0];if(!interval)return null;busy.push({...interval,gapMinutes:row.bookingGapMinutes??0});}}return busy;};
  let slot:CalendarBookingInterval|null=null,selectedWorkerId:string|undefined;
  for(const group of selecting?people.map(id=>[id]):[people]){const busy=busyFor(group);if(!busy)continue;
    const candidate=findCommonCalendarSlot({windows:valid.get('rule')??[],people:group.map(id=>valid.get(id)??[]),busy,durationMinutes:rules.durationMinutes,gapMinutes:rules.gapMinutes});
    // Members are already ordered by explicit preference then stable identity. Earliest start wins.
    if(candidate&&(!slot||candidate.start<slot.start)){slot=candidate;if(selecting)selectedWorkerId=group[0];}}
  if(!slot)return missing('no_common_slot',...(unique.some(row=>!row.workStartsAt||!row.workEndsAt)?['unknown_work' as const]:[]),...(clockChange?['clock_change' as const]:[]));

  const work = local(slot.start, timezone);
  return { target, selectedWorkerId,selectedWorkerName:members.find(member=>member.userId===selectedWorkerId)?.name, result: { status: 'found', slot: { ...work, durationMinutes: rules.durationMinutes, timezone, startsAt: new Date(slot.start).toISOString(), endsAt: new Date(slot.finish).toISOString() } } };
}
/** One batch of strict local-clock resolutions; ambiguous endpoints stay null. */
export async function resolveCalendarBookingWindows(trx: Knex.Transaction, windows: readonly Window[]) {
  return (await trx.raw(`SELECT w.key,w.minutes,
    calendar_local_work_at(w.date::date + w."startTime"::time,w.timezone) AS start,
    calendar_local_work_at(w."endDate"::date + w."endTime"::time,w.timezone) AS finish
    FROM jsonb_to_recordset(?::jsonb) AS w(key text,date text,"startTime" text,"endDate" text,"endTime" text,timezone text,minutes integer)`, [JSON.stringify(windows)])).rows as { key: string; start: Date | null; finish: Date | null; minutes: number }[];
}
export async function findCalendarBookingSlot(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown): Promise<CalendarBookingSearchResult> {
  const parsed = calendarBookingSearchSchema.safeParse(raw); if (!parsed.success) throw new CalendarContractError(parsed.error.issues);
  if (parsed.data.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    requireAuthority(context); return (await searchInTransaction(trx, context, await jobExists(trx, context, parsed.data.jobId), parsed.data.rules)).result;
  });
}
/** Internal booking foundation only. Future workflow admission must check enrollment and lifecycle under this same lock. */
export async function bookCalendarJob(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], raw: unknown, window?: { fromDate: string; throughDate: string; assignmentMode?:'assigned'|'qualified_if_unassigned' }): Promise<CalendarBookingResult> {
  const parsed = calendarBookingCommandSchema.safeParse(raw); if (!parsed.success) throw new CalendarContractError(parsed.error.issues);
  const input: CalendarBookingCommand = parsed.data;
  if (input.workspaceId !== identity.workspaceId) throw new AuthorizationAccessError();
  if (window) { jobDateSchema.parse(window.fromDate); jobDateSchema.parse(window.throughDate); }
  const hash = createHash('sha256').update(JSON.stringify(window ? { ...input, window } : input)).digest('hex');
  return withCurrentWorkspaceMutation(db, identity, enabled, async (trx, context) => {
    requireAuthority(context);if(window?.assignmentMode==='qualified_if_unassigned'){const access=authorize(context,{permission:'jobs.assign',resource:{kind:'job',id:input.jobId,workspaceId:context.workspaceId,ownerId:null,teamUserIds:[]}});if(!access.allowed||access.scope!=='workspace')throw new AuthorizationAccessError();} const job = await jobExists(trx, context, input.jobId);
    const previous = await trx('calendarBookingOperations').where({ workspaceId: identity.workspaceId, submissionId: input.submissionId }).first();
    if (previous) {
      if (previous.actorId !== context.userId || previous.inputHash !== hash || previous.jobId !== input.jobId) throw new CalendarRevisionError();
      return previous.result as CalendarBookingResult;
    }
    const search = await searchInTransaction(trx, context, job, input.rules, window);
    let result: CalendarBookingResult;
    if (search.result.status === 'no_slot') result = search.result;
    else {
      const { slot } = search.result;let target = search.target!;
      if(search.selectedWorkerId){await mutateJobInTransaction(trx,context,{workspaceId:context.workspaceId,jobId:job.id,submissionId:input.submissionId,expectedVersion:job.version,action:'assign',primaryOwnerId:search.selectedWorkerId,teamUserIds:[]},'system');target=await readCalendarVisitInTransaction(trx,context,target.id);}

      const saved = await scheduleCalendarVisitInTransaction(trx, context, { workspaceId: context.workspaceId, submissionId: input.submissionId,
        visitId: target.id, ...target.review!, schedule: { scheduledDate: slot.date, arrivalWindow: null, workTime: { startTime: slot.startTime, durationMinutes: slot.durationMinutes } } }, 'system', input.rules.gapMinutes);
      if(search.selectedWorkerId)await trx('jobNotifications').where({workspaceId:context.workspaceId,operationId:input.submissionId,event:'assignment'}).delete();
      result = { status: 'booked',...(search.selectedWorkerId?{assignedWorker:{id:search.selectedWorkerId,name:search.selectedWorkerName!}}:{}), slot, visitId: saved.visitId, visitVersion: saved.version };
    }
    await trx('calendarBookingOperations').insert({ workspaceId: context.workspaceId, submissionId: input.submissionId, jobId: input.jobId, actorId: context.userId, inputHash: hash, result: JSON.stringify(result) });
    return result;
  });
}
