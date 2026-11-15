import type { Knex } from 'knex';
import {
  calendarReportFilterOptionsQuerySchema, calendarReportFilterOptionsResultSchema,
  type AuthorizationContext, type CalendarExportOutputScopes, type CalendarReportFilters, type CalendarReportFilterOptionsQuery,
  type CalendarReportFilterOptionsResult,
} from '@salesmora/contracts';
import { AuthorizationAccessError } from '../authorization/store';
import { scopedCalendarRecordsQuery } from '../calendar/read';
import { calendarReportContext } from './calendar-context';

export function calendarReportRecordLabelSQL(alias: string) {
  return `CASE WHEN ${alias}.type = 'job' THEN 'J-' ELSE 'WO-' END ||
    CASE WHEN length(${alias}.number::text) < 4 THEN lpad(${alias}.number::text,4,'0') ELSE ${alias}.number::text END ||
    ' / ' || ${alias}.title`;
}

function population(trx: Knex.Transaction, context: AuthorizationContext, own: boolean, kind: 'dated' | 'unscheduled',
  exportScopes?: CalendarExportOutputScopes) {
  return trx.from(scopedCalendarRecordsQuery(trx, context, undefined, own, exportScopes).as('v'))
    .modify(query => { if (kind === 'dated') query.whereNotNull('v.scheduledDate'); else query.whereNull('v.scheduledDate'); });
}

/** Facets precede the dated range and other selections, so saved choices cannot revive hidden records. */
export async function readCalendarReportFilterOptionsInTransaction(
  trx: Knex.Transaction, context: AuthorizationContext, rawQuery: CalendarReportFilterOptionsQuery,
  exportScopes?: CalendarExportOutputScopes,
): Promise<CalendarReportFilterOptionsResult> {
  const query = calendarReportFilterOptionsQuerySchema.parse(rawQuery);
  const { own, wide } = await calendarReportContext(trx, context, query.workspaceId, exportScopes);
  const source = population(trx, context, own, query.context, exportScopes).select('v.type', 'v.people').toSQL();
  const projection = await trx.raw<{ rows: { participants: unknown; recordTypes: unknown }[] }>(
    `WITH visible AS MATERIALIZED (${source.sql}),
     people AS (SELECT DISTINCT unnest(people) AS id FROM visible),
     roster AS (
       SELECT m."userId" AS value, CASE WHEN ?::boolean THEN 'Me' ELSE u.name END AS label
       FROM "workspaceMemberships" m JOIN users u ON u.id = m."userId"
       WHERE m."workspaceId" = ?::uuid AND u."deletionRequestedAt" IS NULL
         AND CASE WHEN ?::boolean THEN m."userId" = ? ELSE ?::boolean OR m."userId" = ? OR
           EXISTS (SELECT 1 FROM people p WHERE p.id = m."userId") END
     )
     SELECT COALESCE((SELECT jsonb_agg(jsonb_build_object('value', value, 'label', label) ORDER BY lower(label), value)
       FROM roster), '[]'::jsonb) AS participants,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('value', type, 'label',
         CASE WHEN type = 'job' THEN 'Job' ELSE 'Work Order' END) ORDER BY type)
         FROM (SELECT DISTINCT type FROM visible) types), '[]'::jsonb) AS "recordTypes"`,
    [...source.bindings, own, context.workspaceId, own, context.userId, wide, context.userId],
  );
  const result = projection.rows[0];
  if (!result) throw new Error('The database returned no Calendar report filter options.');
  return calendarReportFilterOptionsResultSchema.parse({
    workspaceId: context.workspaceId, context: query.context,
    scope: own ? { kind: 'own', viewerId: context.userId } : { kind: 'workspace' }, ...result,
  });
}

export async function filteredCalendarReportRecords(
  trx: Knex.Transaction, context: AuthorizationContext, own: boolean, filters: CalendarReportFilters,
  kind: 'dated' | 'unscheduled', period?: { from: string; to: string },
  exportScopes?: CalendarExportOutputScopes,
) {
  if (filters.participants.length || filters.recordTypes.length) {
    const options = await readCalendarReportFilterOptionsInTransaction(trx, context,
      { workspaceId: context.workspaceId, context: kind }, exportScopes);
    if (filters.participants.some(id => !options.participants.some(option => option.value === id)) ||
      filters.recordTypes.some(type => !options.recordTypes.some(option => option.value === type))) throw new AuthorizationAccessError();
  }
  const records = population(trx, context, own, kind, exportScopes).select('v.*');
  if (period) records.whereBetween('v.scheduledDate', [period.from, period.to]);
  if (filters.recordTypes.length) records.whereIn('v.type', filters.recordTypes);
  const people = trx('workspaceMemberships as m').join('users as u', 'u.id', 'm.userId')
    .where('m.workspaceId', context.workspaceId).whereNull('u.deletionRequestedAt')
    .whereRaw('m."userId" = ANY(v.people)')
    .modify(query => {
      if (own) query.where('m.userId', context.userId);
      if (filters.participants.length) query.whereIn('m.userId', filters.participants);
    });
  if (filters.participants.length) records.whereExists(people.clone().select(trx.raw('1')));
  const normalized = people.select('m.userId').orderBy('m.userId').toSQL();
  return trx.from(records.as('v')).select(
    'v.visitId', 'v.scheduledDate', 'v.arrivalWindow', 'v.id', 'v.type', 'v.number', 'v.title', 'v.status',
    trx.raw(`ARRAY(${normalized.sql}) AS people`, normalized.bindings),
  ).toSQL();
}

export function calendarReportRosterFilterSQL(filters: CalendarReportFilters, column: string) {
  return filters.participants.length === 0 ? { sql: '', bindings: [] } : {
    sql: ` AND ${column} IN (${filters.participants.map(() => '?').join(', ')})`, bindings: filters.participants,
  };
}
