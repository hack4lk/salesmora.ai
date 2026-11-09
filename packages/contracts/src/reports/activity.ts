import { z } from 'zod';
import { jobDateSchema } from '../job';

export const reportActivityDomains = ['lead', 'customer', 'job', 'estimate', 'work-order'] as const;
export const reportActivityActions = ['created', 'updated', 'archived', 'stage-changed', 'assignment-changed',
  'status-changed', 'deadline-changed', 'visit-changed', 'sent', 'decision-recorded', 'completed'] as const;
const domain = z.enum(reportActivityDomains);
const action = z.enum(reportActivityActions);
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const text = z.string().trim().min(1).max(160).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const actorKey = text.max(128);
const date = jobDateSchema.refine(value => !value.startsWith('0000'));
const period = z.object({ from: date, to: date }).strict().refine(value => value.from <= value.to &&
  (Date.parse(`${value.to}T00:00:00Z`) - Date.parse(`${value.from}T00:00:00Z`)) / 86400000 < 366);
export const activityReportFiltersSchema = z.object({
  domains: z.array(domain).max(5).transform(values => [...new Set(values)]),
  actions: z.array(action).max(reportActivityActions.length).transform(values => [...new Set(values)]),
  actors: z.array(actorKey).max(50).transform(values => [...new Set(values)]),
}).strict();
export const activityReportQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('activity'), period,
  filters: activityReportFiltersSchema.default({ domains: [], actions: [], actors: [] }),
  page: z.number().int().min(1).max(100000).default(1),
  pageSize: z.union([z.literal(25), z.literal(50), z.literal(100)]).default(25),
}).strict();
export type ActivityReportQuery = z.infer<typeof activityReportQuerySchema>;
export const activityReportEventSchema = z.object({
  domain, eventId: z.uuid(), occurredAt: z.iso.datetime(),
  action, actor: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('system'), key: z.literal('system'), label: z.literal('System') }).strict(),
    z.object({ kind: z.literal('member'), key: actorKey.refine(value => value !== 'system'), label: text.max(100) }).strict(),
  ]),
  recordId: z.uuid(), recordLabel: text,
}).strict();
export type ActivityReportEvent = z.infer<typeof activityReportEventSchema>;
const domainActions = {
  lead: ['created', 'updated', 'archived', 'stage-changed', 'assignment-changed'],
  customer: ['created', 'updated', 'archived'],
  job: ['created', 'updated', 'archived', 'assignment-changed', 'status-changed', 'deadline-changed', 'visit-changed', 'completed'],
  estimate: ['created', 'updated', 'archived', 'sent', 'decision-recorded'],
  'work-order': ['created', 'updated', 'archived', 'assignment-changed', 'status-changed', 'visit-changed', 'completed'],
} satisfies Record<typeof reportActivityDomains[number], readonly string[]>;
const orderedTimestamp = (timestamp: string) => {
  const [seconds, fraction = ''] = timestamp.slice(0, -1).split('.');
  return `${seconds}.${fraction.padEnd(9, '0')}`;
};
export const activityReportResultSchema = z.object({
  workspaceId: z.uuid(), view: z.literal('activity'), from: date, to: date, today: date,
  asOf: z.iso.datetime(), timezone: text, scopeLabel: z.string().trim().min(1),
  includedDomains: z.array(z.object({
    domain, scope: z.enum(['workspace', 'assigned']), archiveVisibility: z.enum(['included', 'excluded', 'not-applicable']),
  }).strict()).max(5),
  omittedDomains: z.array(z.object({ domain, reason: z.enum(['permissions', 'implementation-pending']) }).strict()).max(5),
  filters: activityReportFiltersSchema,
  options: z.object({
    domains: z.array(domain).max(5), actions: z.array(action).max(reportActivityActions.length),
    actors: z.array(z.object({ value: actorKey, label: text.max(100) }).strict()),
  }).strict(),
  total: count, rows: z.array(activityReportEventSchema).max(100),
  page: activityReportQuerySchema.shape.page.removeDefault(),
  pageSize: activityReportQuerySchema.shape.pageSize.removeDefault(),
}).strict().superRefine((result, context) => {
  const included = result.includedDomains.map(item => item.domain);
  const all = [...included, ...result.omittedDomains.map(item => item.domain)];
  let valid = period.safeParse({ from: result.from, to: result.to }).success && result.to <= result.today &&
    included.length > 0 && all.length === 5 && new Set(all).size === 5 &&
    result.includedDomains.every(item => item.domain !== 'customer' ||
      item.scope === 'workspace' && item.archiveVisibility !== 'not-applicable') &&
    result.includedDomains.every(item => item.domain !== 'estimate' || item.archiveVisibility !== 'not-applicable') &&
    result.includedDomains.every(item => item.domain !== 'work-order' || item.archiveVisibility === 'included') &&
    result.options.domains.length === included.length && new Set(result.options.domains).size === included.length &&
    result.options.domains.every(value => included.includes(value)) &&
    new Set(result.options.actions).size === result.options.actions.length &&
    new Set(result.options.actors.map(actor => actor.value)).size === result.options.actors.length &&
    result.filters.domains.every(value => included.includes(value)) &&
    result.filters.actions.every(value => result.options.actions.includes(value)) &&
    result.filters.actors.every(value => result.options.actors.some(actor => actor.value === value)) &&
    result.page <= Math.max(1, Math.ceil(result.total / result.pageSize)) &&
    result.rows.length === Math.min(result.pageSize, Math.max(0, result.total - (result.page - 1) * result.pageSize)) &&
    new Set(result.rows.map(row => `${row.domain}:${row.eventId}`)).size === result.rows.length;
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: result.timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
    result.rows.forEach((row, index) => {
      const parts = formatter.formatToParts(new Date(row.occurredAt));
      const localDate = ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
      const previous = result.rows[index - 1];
      const key = `${row.domain}:${row.eventId}`;
      const previousKey = previous ? `${previous.domain}:${previous.eventId}` : '';
      valid &&= included.includes(row.domain) && (domainActions[row.domain] as readonly string[]).includes(row.action) &&
        result.options.actions.includes(row.action) &&
        result.options.actors.some(actor => actor.value === row.actor.key && actor.label === row.actor.label) &&
        localDate >= result.from && localDate <= result.to && Date.parse(row.occurredAt) <= Date.parse(result.asOf) &&
        (!result.filters.domains.length || result.filters.domains.includes(row.domain)) &&
        (!result.filters.actions.length || result.filters.actions.includes(row.action)) &&
        (!result.filters.actors.length || result.filters.actors.includes(row.actor.key)) &&
        (!previous || orderedTimestamp(previous.occurredAt) > orderedTimestamp(row.occurredAt) ||
          orderedTimestamp(previous.occurredAt) === orderedTimestamp(row.occurredAt) && previousKey < key);
    });
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    valid = false;
  }
  if (!valid) context.addIssue({ code: 'custom', message: 'Activity scope, facets, event order and evidence do not reconcile.' });
});
export type ActivityReportResult = z.infer<typeof activityReportResultSchema>;
