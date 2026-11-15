import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { LeadReportWorkspace, type LeadReportProjection, type LeadReportView } from './lead-report-workspace';
import type { LeadReportFiltersValue } from '../lead-report-filters/lead-report-filters';
import type { OpenLeadStage } from '../lead-pipeline-report/lead-pipeline-report';
import { leadAgeBand } from '../lead-pipeline-report/lead-pipeline-report.validation';
import { intakeTrendSpans } from '../report-intake-trend/report-intake-trend.validation';
import { leadSourceResponse, type LeadSourceEstimateFixture } from '../lead-source-report/lead-source-report.fixtures';
import { workspaceLeadFixtures as leads } from './lead-report-workspace.fixtures';

const snapshotLabel = 'Nov 5, 2026 at 10:00 / Europe/Warsaw';
const periodLabel = 'Oct 1 to Oct 31, 2026, both dates included';
const scopeLabel = 'Currently authorized lead scope; authorized archives included in historical results.';
const emptyFilters: LeadReportFiltersValue = { stages: [], owners: [], sources: [] };
const availableViews: LeadReportView[] = ['intake', 'pipeline', 'won', 'lost', 'conversion', 'source', 'attention', 'age'];
const options = {
  stages: [{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'estimate-sent', label: 'Estimate sent' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }],
  owners: [{ value: 'member-a', label: 'Teammate A' }, { value: 'member-b', label: 'Teammate B' }, { value: 'unassigned', label: 'No current primary owner' }],
  sources: [{ value: 'website', label: 'Website' }, { value: 'referral', label: 'Referral' }, { value: 'phone', label: 'Phone' }, { value: 'gmail', label: 'Gmail' }, { value: 'other', label: 'Other' }],
};
const row = (lead: typeof leads[number]) => ({ id: lead.id, label: lead.label, recordId: lead.id });
const matches = (lead: typeof leads[number], filters: LeadReportFiltersValue) =>
  (filters.stages.length === 0 || filters.stages.includes(lead.stage)) &&
  (filters.owners.length === 0 || filters.owners.includes(lead.owner)) &&
  (filters.sources.length === 0 || filters.sources.includes(lead.source));
const openStage = (stage: string): OpenLeadStage | undefined =>
  stage === 'new' || stage === 'contacted' ? stage : stage === 'estimate-sent' ? 'estimate_sent' : undefined;
const range = { from: '2026-10-01', to: '2026-10-31' };
const acceptedEstimates: readonly LeadSourceEstimateFixture[] = [
  { familyId: 'workspace-EF-001', estimateNumber: 'E-101', revision: 2, decisionVersion: 4, label: 'Website project estimate',
    acceptedDate: '2026-11-02', preTaxCents: 125000, cohortLeadIds: ['l1'], linkage: 'direct-lead',
    leadRecordId: 'l1', leadLabel: 'Website inquiry' },
  { familyId: 'workspace-EF-002', estimateNumber: 'E-102', revision: 1, decisionVersion: 2, label: 'Phone project estimate',
    acceptedDate: '2026-10-25', preTaxCents: 75000, cohortLeadIds: ['l3'], linkage: 'proven-job',
    leadRecordId: 'l3', leadLabel: 'Archived phone inquiry' },
  { familyId: 'workspace-EF-003', estimateNumber: 'E-103', revision: 3, decisionVersion: 1, label: 'Ambiguous project estimate',
    acceptedDate: '2026-10-28', preTaxCents: 40000, cohortLeadIds: ['l2', 'l3'], linkage: 'ambiguous' },
  { familyId: 'workspace-EF-004', estimateNumber: 'E-104', revision: 1, decisionVersion: 1, label: 'Website change-order estimate',
    acceptedDate: '2026-11-03', preTaxCents: 25000, cohortLeadIds: ['l1'], linkage: 'direct-lead',
    leadRecordId: 'l1', leadLabel: 'Website inquiry' },
];

/** Fictional authorized response builder, used only by stories to simulate host query/projection replacement. */
function response(view: LeadReportView, filters: LeadReportFiltersValue, evidence?: string,
  canReadAcceptedValue = true): LeadReportProjection {
  const all = leads.filter(lead => matches(lead, filters));
  const cohort = all.filter(lead => lead.created >= range.from && lead.created <= range.to);
  const period = { snapshotLabel, periodLabel, scopeLabel };
  if (view === 'intake') {
    const buckets = intakeTrendSpans(range)!.spans.map(span => ({
      ...span, count: cohort.filter(lead => lead.created === span.from).length, evidenceId: `trend:${span.from}`,
    }));
    const selectedTrendBucket = evidence?.startsWith('trend:') ? evidence.slice(6) : undefined;
    return { view, state: { kind: 'ready', result: { ...period, total: cohort.length,
      sources: options.sources.map(source => ({ id: source.value, label: source.label, count: cohort.filter(lead => lead.source === source.value).length })),
      trend: { range, buckets }, selectedTrendBucket, evidenceId: 'intake',
      rows: cohort.filter(lead => !selectedTrendBucket || lead.created === selectedTrendBucket).map(lead => ({ ...row(lead), cells: { created: lead.created, assignment: lead.owner, source: lead.source } })),
      page: 1, pageSize: 25,
    } } };
  }
  if (view === 'won' || view === 'lost') {
    const won = all.filter(lead => lead.id === 'l2'), lost = all.filter(lead => lead.id === 'l2' || lead.id === 'l3');
    return { view, state: { kind: 'ready', result: { ...period, counts: { won: won.length, lost: lost.length }, coverage: { kind: 'complete' },
      selectedOutcome: view, evidenceIds: { won: 'won', lost: 'lost' },
      rows: (view === 'won' ? won : lost).map(lead => ({ ...row(lead), cells: { transition: view === 'won' ? 'Oct 22, 2026' : lead.id === 'l2' ? 'Oct 18, 2026' : 'Oct 30, 2026', assignment: lead.owner, source: lead.source } })),
      page: 1, pageSize: 25,
    } } };
  }
  if (view === 'conversion') {
    const converted = cohort.filter(lead => lead.job !== null);
    return { view, state: { kind: 'ready', result: { ...period, cohort: cohort.length, cohortEvidenceId: 'intake',
      conversion: { kind: 'available', converted: converted.length, evidenceId: 'converted',
        rows: converted.map(lead => ({ ...row(lead), cells: { created: lead.created, jobs: lead.job } })), page: 1, pageSize: 25 },
    } } };
  }
  if (view === 'source') {
    const sourceCohort = cohort.map(lead => ({
      id: lead.id, label: lead.label, recordId: lead.id, createdDate: lead.created,
      source: lead.source, converted: lead.job !== null,
    }));
    const linkedJobs = Object.fromEntries(cohort.flatMap(lead => lead.job ? [[lead.id, lead.job]] : []));
    return { view, state: { kind: 'ready', result: leadSourceResponse(sourceCohort, {
      kind: evidence === 'source-converted' ? 'converted'
        : evidence === 'source-accepted-value' ? 'accepted-estimates' : 'cohort',
      linkedJobs,
      acceptedEstimates,
      canReadAcceptedValue,
    }) } };
  }
  const open = all.filter(lead => openStage(lead.stage) !== undefined);
  if (view === 'attention') {
    const inactive = open.filter(lead => lead.inactive), unowned = open.filter(lead => lead.owner === 'unassigned');
    const combined = open.filter(lead => lead.inactive || lead.owner === 'unassigned');
    const selectedView = evidence === 'inactive' || evidence === 'unowned' ? evidence : 'combined';
    const selected = { inactive, unowned, combined }[selectedView];
    return { view, state: { kind: 'ready', result: {
      snapshotLabel, scopeLabel, inactivityCutoffLabel: 'Oct 29, 2026 at 10:00 / Europe/Warsaw',
      counts: { inactive: inactive.length, unowned: unowned.length, combined: combined.length },
      evidenceIds: { inactive: 'inactive', unowned: 'unowned', combined: 'combined' }, selectedView,
      rows: selected.map(lead => ({ ...row(lead), cells: { stage: lead.stage, owner: lead.owner, activity: lead.activity, reason: 'Inactive and/or no current primary owner' } })),
      page: 1, pageSize: 25,
    } } };
  }
  const band = evidence === '0-7' || evidence === '8-14' || evidence === '15-30' || evidence === '31+' ? evidence : undefined;
  const stage = evidence === 'new' || evidence === 'contacted' || evidence === 'estimate_sent' ? evidence : undefined;
  return { view, state: { kind: 'ready', result: {
    snapshotLabel, scopeLabel, total: open.length,
    stages: { new: open.filter(lead => lead.stage === 'new').length, contacted: open.filter(lead => lead.stage === 'contacted').length, estimate_sent: open.filter(lead => lead.stage === 'estimate-sent').length },
    ages: { '0-7': open.filter(lead => leadAgeBand(lead.age) === '0-7').length, '8-14': open.filter(lead => leadAgeBand(lead.age) === '8-14').length,
      '15-30': open.filter(lead => leadAgeBand(lead.age) === '15-30').length, '31+': open.filter(lead => leadAgeBand(lead.age) === '31+').length },
    evidenceIds: { pipeline: 'pipeline', new: 'new', contacted: 'contacted', estimate_sent: 'estimate_sent', '0-7': '0-7', '8-14': '8-14', '15-30': '15-30', '31+': '31+' },
    selectedView: band ? { kind: 'age', band } : stage ? { kind: 'stage', stage } : { kind: 'pipeline' },
    rows: open.filter(lead => (!band || leadAgeBand(lead.age) === band) && (!stage || openStage(lead.stage) === stage)).map(lead => ({
      ...row(lead), stage: openStage(lead.stage)!, ageDays: lead.age, cells: { created: lead.created, owner: lead.owner, activity: lead.activity },
    })), page: 1, pageSize: 25,
  } } };
}

const meta = {
  title: 'Reports/LeadReportWorkspace', component: LeadReportWorkspace, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical combined Leads workspace composing the approved report slices, dropdown filters and shared 70/30 layout. Only one selected evidence projection is mounted. Stories simulate atomic host responses with fictional authorized data and separate current/period drafts; no parallel preview markup, production route or API. Hosts own dates, persistence/templates, query cancellation, pagination, record dialogs and CSV review.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-7xl"><Story /></div></main>],
  args: {
    projection: response('intake', emptyFilters), availableViews, filters: { period: emptyFilters, current: emptyFilters },
    filterOptions: options, current: { kind: 'ready', snapshot: { label: 'Current open pipeline', count: 3, snapshotLabel,
      scopeLabel: 'All currently authorized assignments, independently of period filters.', description: 'Non-archived New, Contacted and Estimate sent leads.', evidenceId: 'pipeline' } },
    canRead: true, canReadCurrent: true, canReadConversion: true, canReadAcceptedValue: true, canExport: true, canEdit: true,
    onViewChange: fn(), onFiltersChange: fn(), onRetryFilters: fn(), onEvidence: fn(), onRecord: fn(), onExport: fn(),
    onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onRetryCurrent: fn(), onEdit: fn(),
  },
} satisfies Meta<typeof LeadReportWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [view, setView] = useState<LeadReportView>(args.projection.view);
    const [filters, setFilters] = useState(args.filters);
    const [evidence, setEvidence] = useState<string>();
    const context = ['pipeline', 'attention', 'age'].includes(view) ? 'current' : 'period';
    return <LeadReportWorkspace {...args} projection={response(view, filters[context], evidence)} filters={filters}
      filterOptions={{ ...options, stages: context === 'current' ? options.stages.slice(0, 3) : options.stages }}
      onViewChange={next => { args.onViewChange(next); setView(next); setEvidence(undefined); }}
      onFiltersChange={(scope, value) => { args.onFiltersChange(scope, value); setFilters(previous => ({ ...previous, [scope]: value })); setEvidence(undefined); }}
      onEvidence={id => {
        args.onEvidence(id);
        if (id === 'won' || id === 'lost' || id === 'pipeline' || id === 'intake') { setView(id); setEvidence(undefined); }
        else setEvidence(id);
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await userEvent.click(c.getByRole('combobox', { name: 'Current source' }));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(await body.findByRole('option', { name: 'Referral' }));
    await userEvent.keyboard('{Escape}');
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith('period', { stages: [], owners: [], sources: ['referral'] });
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'pipeline');
    await expect(within(c.getByRole('region', { name: 'Report summary' })).getByRole('group', { name: 'Current open pipeline' })).toHaveTextContent('3');
    await expect(c.queryByRole('button', { name: 'Remove filter: Current source: Referral' })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('combobox', { name: 'Current stage' }));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(await body.findByRole('option', { name: 'New' }));
    await userEvent.keyboard('{Escape}');
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith('current', { stages: ['new'], owners: [], sources: [] });
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'intake');
    await expect(c.getByRole('button', { name: 'Remove filter: Current source: Referral' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    for (const view of availableViews) {
      await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), view);
      await expect(args.onViewChange).toHaveBeenLastCalledWith(view);
      await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    }
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'source');
    await selectMetricEvidence(canvasElement, 'Converted leads');
    await expect(args.onEvidence).toHaveBeenLastCalledWith('source-converted');
    const convertedEvidence = c.getAllByText('Converted source-cohort leads');
    await expect(convertedEvidence).toHaveLength(2);
    await expect(convertedEvidence[0]).toBeVisible();
    await selectMetricEvidence(canvasElement, 'Accepted estimate value (pre-tax)');
    await expect(args.onEvidence).toHaveBeenLastCalledWith('source-accepted-value');
    await expect(c.getAllByText('Accepted source-cohort estimates')).toHaveLength(2);
    const ambiguousEstimate = c.getAllByText('Ambiguous project estimate');
    await expect(ambiguousEstimate.some(item => item.getClientRects().length > 0)).toBe(true);
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'age');
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: 31+ days' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('31+');
    await userEvent.click(c.getByRole('button', { name: 'View record: Older inquiry' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('l0');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'intake');
    const summary = c.getByRole('region', { name: 'Report summary' });
    const columns = summary.parentElement?.parentElement?.children;
    await expect(columns?.length).toBe(2);
    const left = columns![0]!.getBoundingClientRect(), right = columns![1]!.getBoundingClientRect();
    if ((canvasElement.ownerDocument.defaultView?.innerWidth ?? 0) >= 1200) {
      await expect(left.width / right.width).toBeCloseTo(7 / 3, 1);
    } else {
      await expect(right.y).toBeGreaterThan(left.y);
    }
  },
};
export const Pipeline: Story = { args: { projection: response('pipeline', emptyFilters) } };
export const Age: Story = { args: { projection: response('age', emptyFilters) } };
export const Won: Story = { args: { projection: response('won', emptyFilters) } };
export const Lost: Story = { args: { projection: response('lost', emptyFilters) } };
export const Conversion: Story = { args: { projection: response('conversion', emptyFilters) } };
export const SourceEffectiveness: Story = { args: { projection: response('source', emptyFilters) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Lead-source effectiveness' })).toBeVisible();
    await expect(within(c.getByRole('region', { name: 'Report summary' }))
      .getByRole('group', { name: 'Leads created in period' })).toHaveTextContent('4');
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    const archivedLead = c.getAllByText('Archived phone inquiry');
    await expect(archivedLead).toHaveLength(2);
    await expect(archivedLead.some(lead => lead.getClientRects().length > 0)).toBe(true);
  } };
export const AcceptedValueWithheld: Story = { args: { canReadAcceptedValue: false,
  projection: response('source', emptyFilters, undefined, false) }, play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: 'Lead-source effectiveness' })).toBeVisible();
    await expect(within(c.getByRole('region', { name: 'Report summary' }))
      .getByRole('group', { name: 'Accepted estimate value (pre-tax)' })).toHaveTextContent('Unavailable');
    await expect(c.queryByText('Website project estimate')).not.toBeInTheDocument();
  } };
export const Attention: Story = { args: { projection: response('attention', emptyFilters) } };
export const Loading: Story = { args: { projection: { view: 'intake', state: { kind: 'loading' } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const Error: Story = { args: { projection: { view: 'pipeline', state: { kind: 'error' } } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
  await expect(within(canvasElement).queryByText('Website inquiry')).not.toBeInTheDocument();
} };
export const CurrentRevoked: Story = { args: { canReadCurrent: false, projection: response('pipeline', emptyFilters) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('group', { name: 'Current open pipeline' })).not.toBeInTheDocument();
} };
export const ConversionWithheld: Story = { args: { canReadConversion: false, projection: response('conversion', emptyFilters) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  await expect(within(canvasElement).queryByText('50%', { exact: true })).not.toBeInTheDocument();
} };
export const UnavailableView: Story = { args: { availableViews: ['intake'], projection: response('lost', emptyFilters) }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByText('Archived phone inquiry')).not.toBeInTheDocument();
} };
export const InvalidSavedFilters: Story = { args: { filters: { period: { ...emptyFilters, owners: ['hidden-owner'] }, current: emptyFilters } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const FiltersLoading: Story = { args: { filterState: 'loading' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const FiltersError: Story = { args: { filterState: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: 'Retry filters' }));
  await expect(args.onRetryFilters).toHaveBeenCalledTimes(1);
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  for (const control of within(canvasElement).getAllByRole('combobox')) await expect(control).toBeDisabled();
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
const wonProjection = response('won', emptyFilters);
export const MismatchedOutcome: Story = { args: { projection: wonProjection.view === 'won' ? { ...wonProjection, view: 'lost' } : wonProjection }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
} };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Leads report workspace' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Leads report workspace' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/Period and current filter selections are maintained separately/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
