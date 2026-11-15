import { z } from 'zod';
import { estimateDecisionsQuerySchema, estimateDecisionsResultSchema } from './estimate-decisions';
import { calendarScheduledResultSchema } from './calendar-scheduled';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const count = z.number().int().nonnegative().refine(Number.isSafeInteger);
const date = estimateDecisionsQuerySchema.shape.period.shape.from;
const stamp = z.object({ asOf: z.iso.datetime(), scopeLabel: text }).strict();
const unavailable = z.object({ kind: z.literal('unavailable'), reason: z.literal('permissions'), explanation: text.max(240) }).strict();
export const businessOverviewQuerySchema = z.object({
  workspaceId: z.uuid(), view: z.literal('business-overview'), period: estimateDecisionsQuerySchema.shape.period,
}).strict();
export type BusinessOverviewQuery = z.infer<typeof businessOverviewQuerySchema>;
export const businessOverviewResultSchema = z.object({
  workspaceId: z.uuid(), view: z.literal('business-overview'), from: date, to: date, today: date, timezone: text.max(200),
  reportScope: z.enum(['workspace', 'assigned']),
  leads: z.union([unavailable, z.object({
    kind: z.literal('available'), scope: z.enum(['workspace', 'assigned']), archiveVisibility: z.enum(['included', 'excluded']),
    reads: z.object({ intake: stamp, pipeline: stamp, attention: stamp }).strict(),
    created: count, stages: z.object({ new: count, contacted: count, 'estimate-sent': count }).strict(), inactive: count,
  }).strict()]),
  jobs: z.union([unavailable, z.object({
    kind: z.literal('available'), scope: z.enum(['workspace', 'assigned']),
    reads: z.object({ created: stamp, completion: stamp, workload: stamp }).strict(),
    created: count, completed: count, active: count, overdue: count, waiting: count,
  }).strict()]),
  estimates: z.union([unavailable, z.object({
    kind: z.literal('available'), scope: z.enum(['workspace', 'assigned_job']), archiveVisibility: z.enum(['included', 'excluded']),
    reads: z.object({ accepted: stamp, awaiting: stamp }).strict(),
    accepted: count, acceptedMoney: estimateDecisionsResultSchema.shape.money, awaiting: count,
  }).strict()]),
  calendar: z.union([unavailable, z.object({
    kind: z.literal('available'), scope: calendarScheduledResultSchema.shape.scope,
    read: stamp, from: date, to: date, visits: count,
  }).strict()]),
}).strict().superRefine((result, context) => {
  let valid = businessOverviewQuerySchema.shape.period.safeParse({ from: result.from, to: result.to }).success &&
    result.to <= result.today;
  const stamps: z.infer<typeof stamp>[] = [];
  if (result.leads.kind === 'available') {
    stamps.push(...Object.values(result.leads.reads));
    const open = Object.values(result.leads.stages).reduce((sum, value) => sum + value, 0);
    valid &&= Number.isSafeInteger(open) && result.leads.inactive <= open &&
      (result.reportScope !== 'assigned' || result.leads.scope === 'assigned');
  }
  if (result.jobs.kind === 'available') {
    stamps.push(...Object.values(result.jobs.reads));
    valid &&= result.jobs.overdue <= result.jobs.active && result.jobs.waiting <= result.jobs.active &&
      (result.reportScope !== 'assigned' || result.jobs.scope === 'assigned');
  }
  if (result.estimates.kind === 'available') {
    stamps.push(...Object.values(result.estimates.reads));
    valid &&= (result.estimates.acceptedMoney.kind !== 'unavailable' ||
      text.max(240).safeParse(result.estimates.acceptedMoney.explanation).success) &&
      (result.reportScope !== 'assigned' || result.estimates.scope === 'assigned_job') &&
      (result.estimates.accepted !== 0 || result.estimates.acceptedMoney.kind === 'unavailable' ||
        result.estimates.acceptedMoney.preTaxCents === 0 && result.estimates.acceptedMoney.customerTotalCents === 0);
  }
  if (result.calendar.kind === 'available') {
    stamps.push(result.calendar.read);
    valid &&= result.calendar.from === result.today &&
      Date.parse(`${result.calendar.to}T00:00:00Z`) - Date.parse(`${result.today}T00:00:00Z`) === 6 * 86400000 &&
      (result.reportScope !== 'assigned' || result.calendar.scope.kind === 'own');
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: result.timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
    valid &&= stamps.every(value => {
      const parts = formatter.formatToParts(new Date(value.asOf));
      const part = (type: string) => parts.find(item => item.type === type)?.value;
      return `${part('year')}-${part('month')}-${part('day')}` === result.today;
    });
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    valid = false;
  }
  if (!valid) context.addIssue({ code: 'custom', message: 'Overview periods, native snapshot dates and authorized counts do not reconcile.' });
});
export type BusinessOverviewBackendResult = z.infer<typeof businessOverviewResultSchema>;
