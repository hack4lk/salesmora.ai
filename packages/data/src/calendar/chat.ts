import { calendarChatData as copy } from './chat.data';
import { createHash, randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import { calendarVisitReferenceSchema, calendarChatVisitSchema, calendarChatQuerySchema, calendarChatContextSchema, calendarChatResultSchema, calendarAvailabilityResultSchema, calendarQuerySchema, type AuthorizationContext, type CalendarQuery, type PermissionId } from '@salesmora/contracts';
import { resolveAuthorizedCollectionScope, authorize, addCalendarDays, calendarWeekStart, calendarDateCandidates } from '@salesmora/domain';
import { withWorkspaceAuthorization, AuthorizationAccessError, type WorkspaceIdentity } from '../authorization/store';
import { readCalendar, readCalendarVisit } from './read';
export class CalendarFocusUnavailableError extends AuthorizationAccessError {}
function permit(context: AuthorizationContext) {
  const scope = resolveAuthorizedCollectionScope(context, 'calendar.read');
  if (!authorize(context, { permission: 'assistant.use' }).allowed || !scope.allowed || !['workspace','own_assigned'].includes(scope.scope)) throw new AuthorizationAccessError();
}
/** Conservative workspace fingerprint. Never returned to the model; changes invalidate dependent history. */
export async function calendarChatStamp(trx: Knex.Transaction, context: AuthorizationContext) {
  permit(context);
  const { rows } = await trx.raw(`SELECT md5(coalesce(string_agg(v, '|' ORDER BY v), '')) AS stamp FROM (
    SELECT 'j:' || id::text || ':' || xmin::text AS v FROM jobs WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'team:' || "jobId"::text || ':' || "userId" || ':' || xmin::text FROM "jobTeamMembers" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'wo:' || id::text || ':' || xmin::text FROM "workOrders" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'crew:' || "workOrderId"::text || ':' || "userId" || ':' || xmin::text FROM "workOrderCrew" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'v:' || id::text || ':' || xmin::text FROM "calendarVisits" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'r:' || id::text || ':' || xmin::text FROM "calendarVisitRecords" WHERE "workspaceId"=:workspace
    UNION ALL SELECT 'member:' || m."userId" || ':' || m.xmin::text || ':' || u.xmin::text FROM "workspaceMemberships" m JOIN users u ON u.id=m."userId" WHERE m."workspaceId"=:workspace
    UNION ALL SELECT 'w:' || xmin::text || ':' || (now() AT TIME ZONE timezone)::date::text FROM workspaces WHERE id=:workspace
  ) evidence`, { workspace: context.workspaceId });
  return createHash('sha256').update(JSON.stringify([context.userId, rows[0].stamp])).digest('hex');
}
export async function calendarChatEvidenceAllowed(trx: Knex.Transaction, context: AuthorizationContext, stamp?: string | null) {
  if (!stamp) return true;
  try { return stamp === await calendarChatStamp(trx, context); } catch (error) { if (error instanceof AuthorizationAccessError) return false; throw error; }
}
export async function readCalendarForChat(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[], args: unknown, pageFilters?: unknown) {
  const input = calendarChatQuerySchema.parse(args);
  const filters = input.usePageFilters && pageFilters ? calendarChatContextSchema.parse(pageFilters) : undefined;
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    permit(context);
    if (input.operation === 'availability') {
      // Read the full permitted week, with no conflict-hiding page filters or row cap.
      const initial = await readCalendar(trx, identity, enabled, { workspaceId: identity.workspaceId, ...(input.date ? { date: input.date } : {}) });
      const selected = input.person ?? filters?.person ?? 'me';
      const requested = selected.startsWith('member:') ? selected.slice(7) : selected;
      const people = requested === 'all' ? initial.members : initial.members.filter(p => requested === 'me' ? p.id === context.userId : p.id === requested || p.name.toLocaleLowerCase() === requested.toLocaleLowerCase());
      if (!people.length || people.length > 10 || (requested !== 'all' && people.length !== 1)) return { clarification: copy.choosePerson };
      if (initial.scope === 'own' && (requested === 'all' || people.some(p => p.id !== context.userId))) return { clarification: copy.ownOnly };
      const from = input.date ?? initial.today, to = input.to ?? (input.date ? from : addCalendarDays(from,13));
      const entries = [...initial.entries];
      for (let week = calendarWeekStart(from); week <= to; week = addCalendarDays(week,7)) {
        if (week === initial.weekDate) continue;
        const current = await readCalendar(trx, identity, enabled, { workspaceId: identity.workspaceId, date: week });
        entries.push(...current.entries);
      }
      const candidates = calendarDateCandidates({ from, to, includeWeekends: input.includeWeekends ?? false, arrivalWindow: input.arrivalWindow ?? null, people, visits: entries });
      const result = calendarAvailabilityResultSchema.parse({ id: randomUUID(), mode: 'availability', from, to,
        scope: initial.scope, viewerId: context.userId, people, arrivalWindow: input.arrivalWindow ?? null,
        timezone: initial.timezone, checkedAt: new Date().toISOString(), total: candidates.length,
        suggestions: candidates.slice(0,3).map(candidate => ({ id: randomUUID(), ...candidate })),
      });
      const query = calendarQuerySchema.parse({ workspaceId: identity.workspaceId, date: from, person: initial.scope === 'own' ? 'me' : people.length === 1 ? `member:${people[0].id}` : 'all' });
      return { result, query, stamp: await calendarChatStamp(trx,context) };
    }
    const query: CalendarQuery = calendarQuerySchema.parse({ ...filters, workspaceId: identity.workspaceId, ...(input.date ? { date: input.date } : {}), queuePage: 1 });
    const current = await readCalendar(trx, identity, enabled, query);
    const candidates = input.operation === 'schedule' ? [...current.entries].sort((a,b) => a.scheduledDate!.localeCompare(b.scheduledDate!) || (a.arrivalWindow ?? '99').localeCompare(b.arrivalWindow ?? '99') || a.id.localeCompare(b.id)) : current.unscheduled;
    const visits = candidates.slice(0,25).map(v => ({ id: v.id, title: v.title.slice(0,120), scheduledDate: v.scheduledDate, arrivalWindow: v.arrivalWindow,
      records: v.records.map(r => ({ ...r, title: r.title.slice(0,120) })), crew: v.crew.map(p => ({ ...p, name: p.name.slice(0,100) })) }));
    const result = calendarChatResultSchema.parse({ id: randomUUID(), mode: input.operation, scope: current.scope, timezone: current.timezone,
      checkedAt: new Date().toISOString(), filterLabels: [copy.types[current.query.recordType], copy.people[current.query.person === 'me' ? 'me' : current.query.person === 'all' ? 'all' : current.query.person === 'unassigned' ? 'unassigned' : 'member'], copy.statuses[current.query.status], ...(current.query.customerQuery ? [copy.customer(current.query.customerQuery)] : [])],
      total: input.operation === 'schedule' ? candidates.length : current.unscheduledTotal, visits,
      ...(input.operation === 'schedule' ? { from: current.weekDate, to: addCalendarDays(current.weekDate,6) } : {}),
    });
    if (result.mode === 'availability') throw Error('Unexpected Calendar result.');
    while (JSON.stringify(result).length > 45000 && result.visits.length > 1) result.visits.pop();
    if (JSON.stringify(result).length > 45000) throw Error('Calendar result exceeds the safe response size.');
    return { result, query: current.query, stamp: await calendarChatStamp(trx, context) };
  });
}
export async function calendarChatClock(db: Knex, identity: WorkspaceIdentity, enabled: readonly PermissionId[]) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    permit(context);
    const workspace = await trx('workspaces').where({ id: context.workspaceId }).first('timezone');
    const today = (await trx.raw(`SELECT to_char(current_timestamp AT TIME ZONE ?, 'YYYY-MM-DD') AS today`, [workspace.timezone])).rows[0].today;
    return { timezone: workspace.timezone as string, today: today as string };
  });
}

/** Selected visit identity is intent only; project current scoped data and bind its evidence before generation. */
export async function readCalendarFocusForChat(db:Knex,identity:WorkspaceIdentity,enabled:readonly PermissionId[],raw:unknown) {
  const reference = calendarVisitReferenceSchema.parse(raw);
  return withWorkspaceAuthorization(db,identity,enabled,false,async (trx,context) => {
    permit(context);
    const current = await readCalendarVisit(trx,identity,enabled,reference.id).catch(error => {
      if (error instanceof AuthorizationAccessError) throw new CalendarFocusUnavailableError();
      throw error;
    });
    if (current.revision !== reference.revision) throw new CalendarFocusUnavailableError();
    const visit = calendarChatVisitSchema.parse({ id:current.id,title:current.title,scheduledDate:current.scheduledDate,arrivalWindow:current.arrivalWindow,records:current.records,crew:current.crew });
    // Never silently omit linked records from a selected-visit summary.
    if (JSON.stringify(visit).length > 12000) throw new CalendarFocusUnavailableError();
    return { visit,stamp:await calendarChatStamp(trx,context) };
  });
}
