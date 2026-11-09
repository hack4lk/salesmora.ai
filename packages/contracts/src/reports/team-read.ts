import { z } from 'zod';
import { teamLeadsQuerySchema, teamLeadsResultSchema } from './team-leads';
import { teamJobsQuerySchema, teamJobsResultSchema } from './team-jobs';

const text = z.string().trim().min(1).max(4000).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const scope = teamJobsResultSchema.shape.scope;
export const teamReportQuerySchema = z.discriminatedUnion('view', [teamLeadsQuerySchema, teamJobsQuerySchema]);
export type TeamReportQuery = z.infer<typeof teamReportQuerySchema>;
export const teamReportReadResultSchema = z.object({
  workspaceId: z.uuid(), viewerId: text,
  policyRevision: z.number().int().nonnegative().refine(Number.isSafeInteger),
  authority: z.object({ leads: scope.nullable(), jobs: scope.nullable() }).strict(),
  exportScopes: z.object({ leads: scope.nullable(), jobs: scope.nullable() }).strict(),
  query: teamReportQuerySchema,
  report: z.union([teamLeadsResultSchema, teamJobsResultSchema]),
  options: z.array(z.object({ value: text.refine(value => value !== 'unassigned'), label: text }).strict()),
}).strict().superRefine((result, context) => {
  const { query, report, authority, exportScopes, options } = result;
  const selectedScope = query.view === 'team-leads' ? authority.leads : authority.jobs;
  const roster = new Set(options.map(option => option.value));
  let valid = result.workspaceId === query.workspaceId && query.view === report.view && selectedScope !== null &&
    JSON.stringify(selectedScope) === JSON.stringify(report.scope) &&
    Object.values(authority).every(scope => scope === null || scope.kind !== 'assigned' || scope.currentMemberId === result.viewerId) &&
    (['leads', 'jobs'] as const).every(view => {
      const read = authority[view], output = exportScopes[view];
      return output === null || read !== null && (read.kind === 'workspace' ||
        output.kind === 'assigned' && output.currentMemberId === read.currentMemberId) &&
        (output.kind !== 'assigned' || output.currentMemberId === result.viewerId);
    }) &&
    JSON.stringify(query.filters) === JSON.stringify(report.filters) &&
    JSON.stringify(query.selected) === JSON.stringify(report.selected) &&
    query.pageSize === report.pageSize &&
    report.page === Math.min(query.page, Math.max(1, Math.ceil(report.evidenceTotal / query.pageSize))) &&
    roster.size === options.length && query.filters.members.every(id => roster.has(id)) &&
    (report.scope.kind !== 'assigned' || options.length === 1 && options[0]?.value === result.viewerId) &&
    text.safeParse(report.scopeLabel).success && text.safeParse(report.timezone).success &&
    report.rows.every(row => text.safeParse(row.label).success && Object.values(row.cells).every(value => text.safeParse(value).success));
  if (report.view === 'team-leads') {
    valid &&= report.owners.every(owner => text.safeParse(owner.label).success &&
      (owner.id === 'unassigned' || roster.has(owner.id.slice('member:'.length)))) &&
      options.every(option => report.owners.some(owner => owner.id === `member:${option.value}` && owner.label === option.label)) &&
      report.rows.every(row => row.currentOwnerId === null || roster.has(row.currentOwnerId));
  } else {
    valid &&= report.members.every(member => roster.has(member.id) && text.safeParse(member.label).success) &&
      options.every(option => report.members.some(member => member.id === option.value && member.label === option.label)) &&
      report.rows.every(row => (row.primary.kind !== 'member' || roster.has(row.primary.id)) &&
        row.supportingMemberIds.every(id => roster.has(id)));
  }
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: report.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date(report.asOf));
    const part = (type: string) => parts.find(item => item.type === type)?.value;
    valid &&= `${part('year')}-${part('month')}-${part('day')}` === report.today;
  } catch (error) { if (!(error instanceof RangeError)) throw error; valid = false; }
  if (!valid) context.addIssue({ code: 'custom', message: 'Team report request, authority, roster and evidence do not match.' });
});
export type TeamReportReadResult = z.infer<typeof teamReportReadResultSchema>;
