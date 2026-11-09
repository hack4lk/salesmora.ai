import type { ReportTemplateArea, ReportAssistantResult } from '@salesmora/contracts';

type Metric = ReportAssistantResult['sections'][number]['metrics'][number];
type Example = { question: string; answer: string; result: ReportAssistantResult };
const period = { from: '2026-10-11', to: '2026-11-09' };
const count = (id: string, label: string, value: number): Metric => ({ id, label, value: { kind: 'count', value } });
const formatted = (id: string, label: string, displayValue: string): Metric => ({ id, label, value: { kind: 'formatted', displayValue } });
function result(area: ReportTemplateArea, label: string, basisLabel: string, metrics: Metric[], coverage: string[],
  current = false): ReportAssistantResult {
  return {
    id: `fictional-${area}-result`, area, timezone: 'Europe/Warsaw', period: current ? null : period,
    filterLabels: [],
    sections: [{ id: area, label, basisLabel, scopeLabel: 'Authorized workspace scope',
      asOf: '2026-11-09T15:00:00.000Z', metrics }],
    coverage,
  };
}

/** Fictional presentation examples, not outputs from live report readers or a language model. */
export const reportAssistantExamples: Record<ReportTemplateArea, Example> = {
  overview: {
    question: 'Explain the period results and current operations in this overview.',
    answer: 'Period intake and recorded completions are separate from the current workload. They are not stages of one conversion funnel.',
    result: {
      ...result('overview', 'Selected-period results', 'Lead creation / recorded Job completion dates',
        [count('intake', 'Leads created', 12), count('completed', 'Jobs completed', 4)],
        ['Sections are separate native snapshots, not one cross-section transaction.']),
      sections: [
        { id: 'period', label: 'Selected-period results', basisLabel: '11 Oct to 9 Nov 2026 / Lead creation and recorded Job completion',
          scopeLabel: 'Authorized workspace Lead and Job scope', asOf: '2026-11-09T15:00:00.000Z',
          metrics: [count('intake', 'Leads created', 12), count('completed', 'Jobs completed', 4)] },
        { id: 'current', label: 'Current operations', basisLabel: 'Current snapshot / not restricted by the selected period',
          scopeLabel: 'Authorized workspace Job scope', asOf: '2026-11-09T15:00:01.000Z',
          metrics: [count('overdue', 'Overdue Jobs', 2)] },
      ],
    },
  },
  leads: {
    question: 'How many Leads were created in the last 30 days?',
    answer: 'There are 12 authorized Leads in the selected creation period.',
    result: result('leads', 'Lead intake', 'Lead creation date / selected period',
      [count('intake', 'Leads created', 12)], ['Current ownership and source labels do not prove historical attribution.']),
  },
  sources: {
    question: 'What is the conversion of Leads created in the last 30 days?',
    answer: 'Of 12 authorized cohort Leads, 3 have a surviving linked Job at the snapshot: 25.0%.',
    result: result('sources', 'Creation-cohort conversion', 'Lead creation period / conversion as of the snapshot',
      [count('cohort', 'Leads created in period', 12), count('converted', 'Converted leads', 3),
        formatted('rate', 'Creation-cohort conversion', '25.0%')],
      ['Rate: 3 converted Leads / 12 cohort Leads.', 'Current editable source labels are not immutable acquisition provenance.']),
  },
  calendar: {
    question: 'How many visits are scheduled over the next seven dates?',
    answer: 'There are 3 canonical scheduled visits. Shared Job and Work Order links do not create extra visits.',
    result: { ...result('calendar', 'Scheduled visits', 'Workspace-local scheduled visit date',
      [count('visits', 'Scheduled visits', 3)], ['Shared visits count once overall; participant counts are not additive.']),
      period: { from: '2026-11-09', to: '2026-11-15' } },
  },
  jobs: {
    question: 'Show my currently overdue Jobs.',
    answer: 'There are 2 currently overdue Jobs in your authorized assigned scope.',
    result: { ...result('jobs', 'Current workload', 'Current active Jobs / due date relative to workspace today',
      [count('overdue', 'Overdue Jobs', 2)], ['This is a current queue, not overdue work as of a historical period end.'], true),
      sections: [{ id: 'assigned', label: 'Current workload', basisLabel: 'Current active Jobs / workspace today',
        scopeLabel: 'Assigned to me / authorized Job scope', asOf: '2026-11-09T15:00:00.000Z',
        metrics: [count('overdue', 'Overdue Jobs', 2)] }],
      filterLabels: ['Assigned to me', 'Overdue'] },
  },
  team: {
    question: 'Show Alex’s current primary and supporting Job responsibility.',
    answer: 'Alex has 4 primary and 2 supporting Job assignments. These are separate responsibility counts, not a productivity score.',
    result: { ...result('team', 'Current Job responsibility', 'Current surviving membership and assignments',
      [count('primary', 'Primary responsibility', 4), count('supporting', 'Supporting participation', 2)],
      ['Primary and supporting counts are non-additive. The unassigned queue remains separate.'], true),
      filterLabels: ['Current member: Alex'] },
  },
  estimates: {
    question: 'What is the acceptance rate among effective decisions in the last 30 days?',
    answer: 'There are 3 accepted and 1 declined effective decisions: acceptance is 75.0%.',
    result: result('estimates', 'Effective estimate decisions', 'Stored customer decision date / selected period',
      [count('accepted', 'Accepted quotes', 3), count('declined', 'Declined quotes', 1),
        formatted('rate', 'Acceptance among effective decisions', '75.0%')],
      ['Rate: 3 accepted / 4 effective decided families.', 'Corrections and newly issued revisions can restate previous periods.']),
  },
  activity: {
    question: 'How many authorized CRM events occurred in the last 30 days?',
    answer: 'There are 18 authorized native-domain events in the selected period.',
    result: result('activity', 'CRM activity history', 'Native event timestamp / selected period',
      [count('events', 'Authorized activity events', 18)], ['Only safe event summaries are included, not note bodies or raw change payloads.']),
  },
  financial: {
    question: 'What is accepted estimate value in the last 30 days?',
    answer: 'Accepted pre-tax estimate value is $12,000.00 for 3 families. This is quoted commitment value, not revenue or profit.',
    result: result('financial', 'Accepted estimate commitments', 'Effective customer decision date / selected period',
      [count('accepted', 'Accepted estimates', 3), formatted('value', 'Accepted pre-tax value', '$12,000.00')],
      ['Frozen pre-tax quote amounts; not revenue, payments or profit.', 'Current awaiting quotes and recorded material costs have a separate current-snapshot basis.']),
  },
};
