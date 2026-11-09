import { reportAssistantReadSnapshotSchema, reportAssistantResultResponseSchema,
  type ReportAssistantResult, type ReportAssistantReadSnapshot, type ReportNativeRead } from '@salesmora/contracts';
import { formatMoney } from '@salesmora/ui/money';

type Metric = ReportAssistantResult['sections'][number]['metrics'][number];
type Section = ReportAssistantResult['sections'][number];
type ReportView = Exclude<ReportNativeRead, { area: 'overview' | 'financial' }>['read']['report']['view'];
const count = (id: string, label: string, value: number): Metric => ({ id, label, value: { kind: 'count', value } });
const unavailable = (id: string, label: string, reason: string): Metric => ({ id, label, value: { kind: 'unavailable', reason } });
const money = (id: string, label: string, value: { kind: 'available'; preTaxCents: number } |
  { kind: 'unavailable'; explanation: string }): Metric => value.kind === 'available'
    ? { id, label, value: { kind: 'formatted', displayValue: formatMoney(value.preTaxCents) } }
    : unavailable(id, label, value.explanation);
const labels: Record<string, string> = {
  created: 'Created', completed: 'Completed', canceled: 'Canceled', reopened: 'Reopened',
  active: 'Active Jobs', overdue: 'Overdue Jobs', dueSoon: 'Due soon', noDeadline: 'No deadline',
  waiting: 'Waiting Jobs', unassigned: 'Unassigned', open: 'Open Leads', inactive: 'Inactive Leads',
  accepted: 'Accepted estimates', declined: 'Declined estimates', awaiting: 'Awaiting decision', expired: 'Expired',
  visits: 'Canonical visits', busyPersonDays: 'Busy person-days', scheduledVisits: 'Scheduled visits',
  missingWindows: 'Missing time windows', overlapPairs: 'Overlapping visit pairs', pastVisits: 'Past visits',
  jobs: 'Unscheduled Jobs', workOrders: 'Unscheduled Work Orders', unowned: 'Unowned Leads', combined: 'Combined attention queue',
  new: 'New Leads', contacted: 'Contacted Leads', 'estimate-sent': 'Estimate sent Leads',
  won: 'Won transitions', lost: 'Lost transitions',
};
const counts = (values: Record<string, number>) => Object.entries(values).map(([id, value]) => count(id, labels[id] ?? id, value));
function facetLabel(options: unknown, key: string, value: string): string {
  const items = Array.isArray(options) ? options : options && typeof options === 'object'
    ? Object.entries(options).find(([name]) => name === key)?.[1] : undefined;
  if (Array.isArray(items)) {
    for (const item of items) if (item && typeof item === 'object' && 'value' in item && item.value === value &&
      'label' in item && typeof item.label === 'string') return item.label;
  }
  return value;
}
const titles: Record<ReportView, string> = {
  intake: 'Lead intake', won: 'Won transitions', lost: 'Lost transitions', pipeline: 'Current Lead pipeline',
  age: 'Current Lead age', attention: 'Current Lead attention', 'lead-source': 'Lead source cohort',
  'calendar-scheduled': 'Scheduled visits', 'calendar-review': 'Schedule review', 'calendar-unscheduled': 'Unscheduled queues',
  lifecycle: 'Job lifecycle', completion: 'Job completions', workload: 'Current Job workload',
  'team-leads': 'Current Lead ownership', 'team-jobs': 'Current Job responsibility',
  'estimate-decisions': 'Effective estimate decisions', 'estimate-first-quoted': 'First-quoted families',
  'estimate-current': 'Current estimates', activity: 'CRM activity',
};
const basis: Record<ReportView, string> = {
  intake: 'Lead creation date / selected period', won: 'Recorded Won transition date / selected period',
  lost: 'Recorded Lost transition date / selected period', pipeline: 'Current open Leads / not historical',
  age: 'Current open Lead age / not historical', attention: 'Current open Leads / native inactivity rule',
  'lead-source': 'Lead creation cohort / conversion and accepted value as of the snapshot',
  'calendar-scheduled': 'Workspace-local scheduled visit date',
  'calendar-review': 'Workspace-local scheduled visit date / review signals, not availability guarantees',
  'calendar-unscheduled': 'Current unscheduled queues / no historical period',
  lifecycle: 'Job creation and recorded lifecycle event dates / separate populations',
  completion: 'Recorded Job completion date / selected period', workload: 'Current active Jobs / workspace-local today',
  'team-leads': 'Current surviving membership and ownership / not historical productivity',
  'team-jobs': 'Current primary and supporting responsibility / non-additive member counts',
  'estimate-decisions': 'Effective customer decision date / accepted and declined families',
  'estimate-first-quoted': 'First-issued quote date / family cohort',
  'estimate-current': 'Current non-archived estimates / not historical',
  activity: 'Native event timestamp / selected period',
};

/** Project native totals only. Evidence pages are never counted to reconstruct aggregates. */
export function reportResultResponse(raw: ReportAssistantReadSnapshot) {
  const { binding, native } = reportAssistantReadSnapshotSchema.parse(raw);
  const sections: Section[] = [];
  const coverage = [
    'Saved report evidence; a new question may retrieve a fresh snapshot. Open report performs a freshly authorized page read.',
    'Evidence rows are bounded; displayed totals come from native population aggregates, not the sampled rows.',
  ];
  const section = (id: string, label: string, stamp: { asOf: string; scopeLabel: string },
    basisLabel: string, metrics: Metric[]) => {
    sections.push({ id, label, asOf: stamp.asOf, scopeLabel: stamp.scopeLabel, basisLabel, metrics });
  };
  let timezone: string;
  const filterLabels: string[] = [];
  if (native.area === 'overview') {
    const report = native.read.report;
    timezone = report.timezone;
    const { leads, jobs, estimates, calendar } = report;
    const denied = (id: string, label: string, explanation: string) => section(id, label,
      { asOf: binding.retrievedAt, scopeLabel: 'Unavailable under current permissions' },
      'No authorized native metrics', [unavailable(id, label, explanation)]);
    if (leads.kind === 'available') {
      section('lead-intake', 'Lead intake', leads.reads.intake, basis.intake, [count('created', 'Leads created', leads.created)]);
      section('lead-pipeline', 'Current Lead pipeline', leads.reads.pipeline, basis.pipeline, counts(leads.stages));
      section('lead-attention', 'Current Lead attention', leads.reads.attention, basis.attention,
        [count('inactive', 'Inactive open Leads', leads.inactive)]);
    } else denied('leads', 'Leads', leads.explanation);
    if (jobs.kind === 'available') {
      section('job-created', 'Jobs created', jobs.reads.created, 'Job creation date / selected period', [count('created', 'Jobs created', jobs.created)]);
      section('job-completed', 'Jobs completed', jobs.reads.completion, basis.completion, [count('completed', 'Jobs completed', jobs.completed)]);
      section('job-workload', 'Current Job workload', jobs.reads.workload, basis.workload,
        [count('active', 'Active Jobs', jobs.active), count('overdue', 'Overdue Jobs', jobs.overdue), count('waiting', 'Waiting Jobs', jobs.waiting)]);
    } else denied('jobs', 'Jobs', jobs.explanation);
    if (estimates.kind === 'available') {
      section('estimate-accepted', 'Accepted commitments', estimates.reads.accepted, basis['estimate-decisions'],
        [count('accepted', 'Accepted estimates', estimates.accepted), money('pre-tax', 'Accepted pre-tax value', estimates.acceptedMoney)]);
      section('estimate-awaiting', 'Current awaiting estimates', estimates.reads.awaiting, basis['estimate-current'],
        [count('awaiting', 'Awaiting decision', estimates.awaiting)]);
    } else denied('estimates', 'Estimates', estimates.explanation);
    if (calendar.kind === 'available') section('calendar', 'Upcoming visits', calendar.read,
      `Workspace-local scheduled dates / ${calendar.from} to ${calendar.to}`, [count('visits', 'Canonical visits', calendar.visits)]);
    else denied('calendar', 'Calendar', calendar.explanation);
    coverage.push('Independent native section snapshots and scopes. Period outcomes and current operations are not one conversion funnel.',
      'Estimate values are frozen pre-tax commitments, not revenue, payments or profit.');
  } else if (native.area === 'financial') {
    const read = native.read;
    timezone = read.timezone;
    for (const kind of ['accepted', 'awaiting'] as const) {
      const current = read.reports[kind].estimates;
      if (current.kind === 'unavailable') {
        section(kind, kind === 'accepted' ? 'Accepted commitments' : 'Current awaiting estimates',
          { asOf: binding.retrievedAt, scopeLabel: 'Unavailable under current permissions' },
          kind === 'accepted' ? basis['estimate-decisions'] : basis['estimate-current'],
          [unavailable(kind, 'Estimate values', current.explanation)]);
      } else {
        section(kind, kind === 'accepted' ? 'Accepted commitments' : 'Current awaiting estimates', current.report,
          kind === 'accepted' ? basis['estimate-decisions'] : basis['estimate-current'],
          current.kind === 'accepted'
            ? [count('accepted', 'Accepted estimates', current.report.counts.accepted), money('value', 'Accepted pre-tax value', current.report.money)]
            : [count('awaiting', 'Awaiting decision', current.report.counts.awaiting), money('value', 'Awaiting pre-tax value', current.report.awaitingMoney)]);
      }
    }
    const material = read.reports.materials;
    const metrics: Metric[] = [];
    if (material.costs.kind === 'unavailable') metrics.push(unavailable('cost', 'Known recorded material costs', material.costs.explanation));
    else {
      const costs = material.costs.coverage;
      metrics.push(count('lines', 'Recorded material lines', costs.lineCount),
        count('missing', 'Lines without recorded costs', costs.missingCostLines));
      metrics.push(costs.knownCostCents === null
        ? unavailable('cost', 'Known recorded material costs', 'No known line costs are recorded. Missing costs are not zero.')
        : { id: 'cost', label: 'Known recorded material costs', value: costs.missingCostLines
          ? { kind: 'incomplete', displayValue: formatMoney(costs.knownCostCents),
            coverageLabel: `${costs.knownCostLines} known / ${costs.lineCount} lines. Missing costs are not zero.` }
          : { kind: 'formatted', displayValue: formatMoney(costs.knownCostCents) } });
    }
    section('materials', 'Current recorded material costs', material,
      'Current non-archived issued/in-progress Work Orders / not restricted by the selected period', metrics);
    filterLabels.push(`Evidence: ${read.query.selected}`);
    coverage.push('Frozen pre-tax quote commitments and recorded material costs are separate bases, not revenue, payments or profit.',
      'Independent native snapshots. Missing material costs are never treated as zero.');
  } else {
    const report = native.read.report;
    timezone = report.timezone;
    const metrics: Metric[] = [];
    const query = native.read.query;
    filterLabels.push(`View: ${titles[report.view]}`);
    if ('selected' in query) filterLabels.push(`Evidence: ${typeof query.selected === 'string' ? query.selected : JSON.stringify(query.selected)}`);
    if ('selection' in query) filterLabels.push(`Evidence: ${typeof query.selection === 'string' ? query.selection : JSON.stringify(query.selection)}`);
    if ('selectedView' in query) filterLabels.push(`Evidence: ${query.selectedView}`);
    if ('trendBucket' in query && query.trendBucket) filterLabels.push(`Creation date: ${query.trendBucket}`);
    if ('selectedDate' in query && query.selectedDate) filterLabels.push(`Completion date: ${query.selectedDate}`);
    // Summarize oversized facet labels explicitly; the bound native selection stays complete.
    if ('filters' in query) for (const [key, values] of Object.entries(query.filters)) {
      if (Array.isArray(values) && values.length) {
        const display = values.map(value => facetLabel('options' in native.read ? native.read.options : undefined, key, value)).join(', ');
        filterLabels.push(`${key}: ${display.length <= 3800 ? display : `${values.length} selected; open the matching report for the full selection.`}`);
      }
    }
    switch (native.area) {
      case 'leads': {
        const r = native.read.report;
        if (r.view === 'intake') metrics.push(count('created', 'Leads created', r.total));
        else if (r.view === 'pipeline' || r.view === 'age') metrics.push(count('open', 'Open Leads', r.total),
          count('selected', 'Selected evidence population', r.evidenceTotal));
        else if ('counts' in r) metrics.push(...counts(r.counts));
        if (r.view === 'won' || r.view === 'lost') coverage.push(r.coverage.explanation);
        coverage.push('Current ownership/source labels are not immutable historical attribution. Current queues are independent of dated outcomes.');
        break;
      }
      case 'sources': {
        const r = native.read.report;
        metrics.push(count('cohort', 'Leads created in period', r.cohort));
        metrics.push(r.conversion.kind === 'available' ? count('converted', 'Cohort Leads with a surviving linked Job', r.conversion.converted)
          : unavailable('converted', 'Converted Leads', r.conversion.explanation));
        metrics.push(r.acceptedValue.kind === 'available'
          ? money('value', 'Creation-cohort accepted pre-tax value', { kind: 'available', preTaxCents: r.acceptedValue.preTaxCents })
          : unavailable('value', 'Accepted pre-tax value', r.acceptedValue.explanation));
        coverage.push('Conversion is current surviving linkage within the creation cohort. Accepted value is cohort-attributed, not period revenue.');
        break;
      }
      case 'calendar': metrics.push(...counts(native.read.report.counts));
        coverage.push('Shared visits count once overall. Participant/record counts and overlapping pairs are not additive visit totals.'); break;
      case 'jobs': {
        const r = native.read.report;
        if (r.view === 'completion') metrics.push(count('completed', 'Jobs completed', r.total));
        else metrics.push(...counts(r.counts));
        if (r.view === 'lifecycle') for (const [key, value] of Object.entries(r.coverage)) {
          if (value.kind === 'partial') coverage.push(`${key}: ${value.explanation}`);
        }
        break;
      }
      case 'team': metrics.push(...counts(native.read.report.counts));
        coverage.push('Current surviving membership only. Primary/supporting member counts are non-additive and are not productivity scores.'); break;
      case 'estimates': {
        const r = native.read.report;
        if (r.view === 'estimate-first-quoted') {
          metrics.push(count('quoted', 'First-quoted families', r.total));
          if (r.coverage.kind === 'partial') coverage.push(r.coverage.explanation);
        } else {
          metrics.push(...counts(r.counts));
          if (r.view === 'estimate-decisions') metrics.push(money('value', 'Accepted pre-tax value', r.money));
          else {
            metrics.push(money('value', 'Awaiting pre-tax value', r.awaitingMoney),
              r.handoff.kind === 'available' ? count('handoff', 'Accepted Leads awaiting handoff', r.handoff.count)
                : unavailable('handoff', 'Handoff queue', r.handoff.explanation));
          }
        }
        coverage.push('Frozen pre-tax quote commitments, not revenue. Effective decisions may restate periods; first quote cohorts and current queues are different populations.');
        break;
      }
      case 'activity': metrics.push(count('events', 'Authorized native-domain events', native.read.report.total));
        coverage.push('Safe native event summaries only; unavailable domains are not zero activity.',
          `Included domains: ${native.read.report.includedDomains.map(item => `${item.domain} (${item.scope})`).join(', ') || 'none'}.`);
        break;
    }
    section(report.view, titles[report.view], report, basis[report.view], metrics);
    if ('evidenceTotal' in report) section('selected-evidence', 'Selected evidence population', report,
      'Exact selected evidence/facets / all pages, not only the bounded rows',
      [count('selected-evidence', 'Records matching the evidence selection', report.evidenceTotal)]);
  }
  return reportAssistantResultResponseSchema.parse({
    retrievedAt: binding.retrievedAt,
    snapshot: { selection: binding.selection, result: {
      id: binding.id, area: native.area, timezone,
      period: 'period' in binding.selection.query ? binding.selection.query.period : null,
      filterLabels, sections, coverage,
    } },
  });
}
