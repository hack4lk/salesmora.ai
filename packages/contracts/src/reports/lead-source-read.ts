import { z } from 'zod';
import { leadSourceQuerySchema, leadSourceResultSchema } from './lead-source';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
export const leadSourceReadResultSchema = z.object({
  workspaceId: z.uuid(), viewerId: text, policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  scope: z.enum(['workspace', 'assigned']), archiveVisibility: z.enum(['included', 'excluded']),
  canReadConversion: z.boolean(), canReadAcceptedValue: z.boolean(), canExport: z.boolean(),
  query: leadSourceQuerySchema, report: leadSourceResultSchema,
}).strict().superRefine((result, context) => {
  const { query, report } = result;
  const moneyReadable = report.acceptedValue.kind === 'available' || report.acceptedValue.reason === 'invalid-money';
  let valid = result.workspaceId === query.workspaceId && result.workspaceId === report.workspaceId &&
    result.scope === report.scope && result.archiveVisibility === report.archiveVisibility &&
    query.period.from === report.from && query.period.to === report.to && query.selected === report.evidence.kind &&
    report.pageSize === query.pageSize &&
    report.page === Math.min(query.page, Math.max(1, Math.ceil(report.evidenceTotal / query.pageSize))) &&
    result.canReadConversion === (report.conversion.kind === 'available') &&
    result.canReadAcceptedValue === moneyReadable &&
    (!result.canReadAcceptedValue || result.canReadConversion) &&
    text.safeParse(report.scopeLabel).success && text.safeParse(report.timezone).success;
  for (const row of report.evidence.rows) {
    valid &&= text.safeParse(row.label).success;
    if ('linkedJobs' in row) valid &&= text.safeParse(row.linkedJobs).success;
    if ('familyId' in row) valid &&= text.safeParse(row.familyId).success &&
      (!row.linkedLead || text.safeParse(row.linkedLead.label).success);
  }
  if (report.conversion.kind === 'unavailable') valid &&= text.safeParse(report.conversion.explanation).success;
  if (report.acceptedValue.kind === 'unavailable') valid &&= text.safeParse(report.acceptedValue.explanation).success;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: report.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(report.asOf));
    const part = (type: string) => parts.find(item => item.type === type)?.value;
    valid &&= `${part('year')}-${part('month')}-${part('day')}` === report.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Sources report request, authority and evidence do not match.' });
});
export type LeadSourceReadResult = z.infer<typeof leadSourceReadResultSchema>;
