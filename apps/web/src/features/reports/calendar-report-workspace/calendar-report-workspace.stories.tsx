import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarReportWorkspace, calendarReportViews, type CalendarReportWorkspaceProps, type CalendarReportView } from './calendar-report-workspace';
import { calendarWorkspaceResponse, calendarWorkspaceEmptyFilters as empty, calendarWorkspaceOptions as options,
  calendarWorkspaceRange as range, calendarWorkspaceScopeKey as scopeKey, calendarWorkspaceDefaultEvidence, type CalendarWorkspaceEvidence } from './calendar-report-workspace.fixtures';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import type { CalendarReportFilterContext } from '../calendar-report-filters/calendar-report-filters';
import { ReportDateControls } from '../report-date-controls/report-date-controls';
import { resolveReportPeriod } from '../report-date-controls/report-date-controls.validation';
import { calendarBackendProjection, calendarBackendWorkspaceId } from './calendar-report-workspace.adapter.fixtures';

const meta = {
  title: 'Reports/CalendarReportWorkspace', component: CalendarReportWorkspace, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical composition of approved scheduled-visits, schedule-review, unscheduled-queues and Calendar filter components. Dated views share a draft and exact host-owned dates; unscheduled filters remain independent with no date predicate. Mock hosts filter currently authorized active records by type, then per-record participants, before counting/paging. Selected people bound workload and overlap projections; canonical visits stay distinct. Projection contracts validate filter, scope and date snapshots plus observed record-to-person attribution. Only one evidence table renders. Grants, navigation, queries, date controls and CSV review remain host-owned; no production API/route or persistence is enabled.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { projection: calendarWorkspaceResponse('scheduled'), availableViews: calendarReportViews, filters: { dated: empty, unscheduled: empty },
    filterOptions: options, scope: { kind: 'workspace' }, scopeKey, range,
    canRead: true, canExport: true, canEdit: true, canOpenCalendar: true,
    onViewChange: fn(), onFiltersChange: fn(), onRetryFilters: fn(), onEvidence: fn(), onCalendar: fn(), onRecord: fn(),
    onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof CalendarReportWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;

function Host(args: CalendarReportWorkspaceProps) {
  return <MockHost args={args} />;
}
function MockHost({ args, showDates = false, backend = false }: { args: CalendarReportWorkspaceProps; showDates?: boolean; backend?: boolean }) {
  const [view, setView] = useState<CalendarReportView>(args.projection.view);
  const [filters, setFilters] = useState(args.filters);
  const [evidence, setEvidence] = useState<CalendarWorkspaceEvidence>(calendarWorkspaceDefaultEvidence);
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(backend ? 25 : 1);
  const [selectedRange, setRange] = useState(args.range);
  const context: CalendarReportFilterContext = view === 'unscheduled' ? 'unscheduled' : 'dated';
  const adapted = backend ? calendarBackendProjection({
    workspaceId: calendarBackendWorkspaceId, view, filters, range: selectedRange, evidence, page, pageSize,
  }, args.scope, args.scopeKey) : undefined;
  return <div className="grid gap-6">
    {showDates && context === 'dated' && <ReportDateControls context="calendar" today="2026-11-06" timezone="America/New_York"
      value={{ preset: 'custom', ...selectedRange }} pending={args.pending} onApply={selection => {
        const range = resolveReportPeriod(selection, '2026-11-06', 'calendar').range;
        if (!range) throw new RangeError('Mock host received an invalid applied date range.');
        setRange({ from: range.from, to: range.to }); setPage(1); setEvidence(calendarWorkspaceDefaultEvidence);
      }} />}
    <CalendarReportWorkspace {...args} filters={filters} range={selectedRange} filterOptions={adapted?.filterOptions ?? args.filterOptions}
    projection={adapted?.projection ?? calendarWorkspaceResponse(view, filters[context], { scope: args.scope, scopeKey: args.scopeKey, options: args.filterOptions,
      range: selectedRange, evidence, page, pageSize })}
    onViewChange={next => { args.onViewChange(next); setView(next); setPage(1); setEvidence(calendarWorkspaceDefaultEvidence); }}
    onFiltersChange={(context, value) => {
      args.onFiltersChange(context, value); setFilters(current => ({ ...current, [context]: value })); setPage(1); setEvidence(calendarWorkspaceDefaultEvidence);
    }}
    onEvidence={evidenceId => {
      args.onEvidence(evidenceId); setPage(1);
      setEvidence(current => ({ ...current,
        ...(view === 'scheduled' ? { scheduled: evidenceId === 'busy-person-days' ? 'busy-person-days' as const : 'visits' as const }
          : view === 'review' ? { review: evidenceId === 'past-visits' ? 'past' as const : 'overlaps' as const }
            : { unscheduled: evidenceId === 'unscheduled-jobs' ? 'jobs' as const : evidenceId === 'unscheduled-work-orders' ? 'workOrders' as const : 'visits' as const }),
      }));
    }}
    onPageChange={next => { args.onPageChange(next); setPage(next); }}
    onPageSizeChange={next => { args.onPageSizeChange(next); setPageSize(next); setPage(1); }} />
  </div>;
}
const summary = (element: HTMLElement) => within(within(element).getByRole('region', { name: 'Report summary' }));
async function selectFacet(element: HTMLElement, facet: string, label: string) {
  const c = within(element), body = within(element.ownerDocument.body);
  await userEvent.click(c.getByRole('combobox', { name: facet }));
  await userEvent.keyboard('{ArrowDown}');
  const option = await body.findByRole('option', { name: label });
  await waitFor(() => expect(option).toBeVisible());
  await userEvent.click(option); await userEvent.keyboard('{Escape}');
}
const invalid: Story['play'] = async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
};
export const Default: Story = { render: Host, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), view = c.getByRole('combobox', { name: 'Report view' });
  await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('4');
  await selectFacet(canvasElement, 'Current participant', 'Blair');
  await selectFacet(canvasElement, 'Record type', 'Work Order');
  await expect(args.onFiltersChange).toHaveBeenLastCalledWith('dated', { participants: ['blair'], recordTypes: ['work_order'] });
  await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('1');
  await expect(c.queryByRole('button', { name: /^View record: J-/ })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: 'View record: WO-002 / shared Work Order' })).not.toBeInTheDocument();
  await userEvent.selectOptions(view, 'review');
  await expect(args.onViewChange).toHaveBeenLastCalledWith('review');
  await expect(c.getByRole('button', { name: 'Remove filter: Current participant: Blair' })).toBeVisible();
  await expect(summary(canvasElement).getByRole('group', { name: 'Overlapping arrival-window pairs' })).toHaveTextContent('0');
  await selectMetricEvidence(canvasElement, 'Past scheduled visits');
  await expect(c.getByRole('button', { name: 'View record: WO-001 / shared Work Order' })).toBeVisible();
  await userEvent.selectOptions(view, 'unscheduled');
  await expect(c.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  await expect(summary(canvasElement).getByRole('group', { name: 'Unscheduled Work Order records' })).toHaveTextContent('2');
  await selectFacet(canvasElement, 'Current participant', 'Alex');
  await expect(args.onFiltersChange).toHaveBeenLastCalledWith('unscheduled', { participants: ['alex'], recordTypes: [] });
  await userEvent.selectOptions(view, 'scheduled');
  await expect(c.getByRole('button', { name: 'Remove filter: Current participant: Blair' })).toBeVisible();
  await expect(c.getByRole('button', { name: 'Remove filter: Record type: Work Order' })).toBeVisible();
  await userEvent.selectOptions(view, 'unscheduled');
  await expect(c.getByRole('button', { name: 'Remove filter: Current participant: Alex' })).toBeVisible();
  await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
} };
export const BackendContracts: Story = {
  render: args => <MockHost args={args} backend showDates />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('4');
    await selectFacet(canvasElement, 'Current participant', 'Blair');
    await selectFacet(canvasElement, 'Record type', 'Work Order');
    await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('1');
    await expect(c.queryByRole('button', { name: /^View record: J-/ })).not.toBeInTheDocument();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'review');
    await selectMetricEvidence(canvasElement, 'Past scheduled visits');
    await expect(c.getByRole('button', { name: 'View record: WO-001 / shared Work Order' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'unscheduled');
    await expect(summary(canvasElement).getByRole('group', { name: 'Unscheduled Work Order records' })).toHaveTextContent('2');
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  },
};
export const PaginationResets: Story = { render: Host, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), view = c.getByRole('combobox', { name: 'Report view' });
  await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
  await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
  await selectMetricEvidence(canvasElement, 'Busy person-days');
  await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  await expect(c.getByRole('button', { name: 'View Calendar: Alex / 2026-11-05' })).toBeVisible();
  await userEvent.selectOptions(view, 'review');
  await selectMetricEvidence(canvasElement, 'Past scheduled visits');
  await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
  await userEvent.selectOptions(view, 'unscheduled');
  await selectMetricEvidence(canvasElement, 'Unscheduled Work Order records');
  await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
  await expect(c.getByRole('button', { name: 'View record: WO-002 / active Work Order' })).toBeVisible();
  await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
  await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
  await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  await selectFacet(canvasElement, 'Current participant', 'Blair');
  await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  await expect(summary(canvasElement).getByRole('group', { name: 'Unscheduled Work Order records' })).toHaveTextContent('1');
} };
export const RecordParticipantIntersection: Story = { render: Host, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await selectFacet(canvasElement, 'Current participant', 'Blair');
  await selectFacet(canvasElement, 'Record type', 'Job');
  await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('0');
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await selectFacet(canvasElement, 'Current participant', 'Alex');
  await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('3');
  await selectFacet(canvasElement, 'Record type', 'Work Order');
  await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('4');
  await expect(summary(canvasElement).getByRole('group', { name: 'Busy person-days' })).toHaveTextContent('1');
} };
export const DateChangesResetPage: Story = { render: args => <MockHost args={args} showDates />, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
  await expect(c.getByRole('button', { name: 'Current page, 2' })).toBeVisible();
  await userEvent.selectOptions(c.getByRole('combobox', { name: 'Date range' }), 'next7days');
  await userEvent.click(c.getByRole('button', { name: 'Apply period' }));
  await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('0');
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'unscheduled');
  await expect(c.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
  await expect(summary(canvasElement).getByRole('group', { name: 'Distinct unscheduled visits' })).toHaveTextContent('1');
} };
export const Review: Story = { args: { projection: calendarWorkspaceResponse('review') }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(summary(canvasElement).getByRole('group', { name: 'Overlapping arrival-window pairs' })).toHaveTextContent('1');
  await expect(c.queryByText(/authorized scheduled visits have no arrival window/)).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: 'View Calendar: V1 / shared visit' }));
  await expect(args.onCalendar).toHaveBeenLastCalledWith({ date: '2026-11-05', weekDate: '2026-11-02', visitId: 'workspace-fixture:V1' });
  await userEvent.click(c.getByRole('button', { name: 'View record: WO-001 / shared Work Order' }));
  await expect(args.onRecord).toHaveBeenLastCalledWith('workspace-fixture:W1');
  await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
  await expect(args.onExport).toHaveBeenCalledTimes(1);
} };
export const Unscheduled: Story = { args: { projection: calendarWorkspaceResponse('unscheduled') }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText('Current queue / No visit-date filter')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: 'View Calendar: U1 / explicitly shared unscheduled visit' }));
  await expect(args.onCalendar).toHaveBeenLastCalledWith({ kind: 'unscheduled', visitId: 'workspace-fixture:U1' });
} };
const ownScope = { kind: 'own', viewerId: 'blair' } as const;
const ownOptions = { ...options, participants: [{ value: 'blair', label: 'Blair' }] };
export const OwnScope: Story = { render: Host, args: { scope: ownScope, filterOptions: ownOptions, scopeKey: 'own-blair:v1',
  projection: calendarWorkspaceResponse('scheduled', empty, { scope: ownScope, options: ownOptions, scopeKey: 'own-blair:v1' }) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('1');
    await expect(c.queryByText(/Alex|Blair/)).not.toBeInTheDocument();
    await expect(c.queryByRole('button', { name: /^View record: J-/ })).not.toBeInTheDocument();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'unscheduled');
    await expect(summary(canvasElement).getByRole('group', { name: 'Unscheduled Job records' })).toHaveTextContent('0');
    await expect(summary(canvasElement).getByRole('group', { name: 'Unscheduled Work Order records' })).toHaveTextContent('1');
  } };
const orderOptions = { ...options, recordTypes: [{ value: 'work_order', label: 'Work Order' }] };
export const WorkOrderOnly: Story = { render: Host, args: { filterOptions: orderOptions,
  projection: calendarWorkspaceResponse('scheduled', empty, { options: orderOptions }) }, play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('2');
    await expect(c.queryByRole('button', { name: /^View record: J-/ })).not.toBeInTheDocument();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'unscheduled');
    await expect(summary(canvasElement).getByRole('group', { name: 'Unscheduled Job records' })).toHaveTextContent('0');
  } };
export const UnscheduledIgnoresDateRange: Story = { ...Unscheduled, args: { ...Unscheduled.args, range: { from: '', to: '' } } };
export const StaleDates: Story = { args: { range: { from: '2026-11-06', to: '2026-11-12' } }, play: invalid };
export const StaleFilters: Story = { args: { filters: { dated: { ...empty, participants: ['blair'] }, unscheduled: empty } }, play: invalid };
export const StaleScope: Story = { args: { scopeKey: 'changed-access' }, play: invalid };
export const InvalidAttribution: Story = { args: { projection: { ...calendarWorkspaceResponse('scheduled'), attribution: [] } }, play: invalid };
export const InvalidOptions: Story = { args: { filterOptions: { participants: [{ value: 'unassigned', label: 'Unassigned' }] } }, play: invalid };
export const UnavailableView: Story = { args: { availableViews: ['scheduled'], projection: calendarWorkspaceResponse('review') }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  await userEvent.selectOptions(within(canvasElement).getByRole('combobox', { name: 'Report view' }), 'scheduled');
  await expect(args.onViewChange).toHaveBeenLastCalledWith('scheduled');
} };
export const DuplicateViews: Story = { args: { availableViews: ['scheduled', 'scheduled'] }, play: invalid };
export const RemovedSelection: Story = { render: Host, args: { filters: { dated: { ...empty, participants: ['hidden-person'] }, unscheduled: empty } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
    await expect(c.queryByText(/hidden-person/)).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current participant: Unavailable saved selection' }));
    await expect(c.getByRole('region', { name: 'Supporting evidence' })).toBeVisible();
  } };
export const InactiveInvalidDraft: Story = { args: { filters: { dated: empty, unscheduled: { ...empty, participants: ['hidden-person'] } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('alert')).not.toBeInTheDocument();
  await expect(within(canvasElement).getByRole('region', { name: 'Supporting evidence' })).toBeVisible();
} };
export const FilterLoading: Story = { args: { filterState: 'loading' }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const FilterError: Story = { args: { filterState: 'error' }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry filters' }));
  await expect(args.onRetryFilters).toHaveBeenCalledTimes(1);
} };
export const Loading: Story = { args: { projection: { view: 'scheduled', state: { kind: 'loading' }, filters: empty, scopeKey, attribution: [] } },
  play: FilterLoading.play };
export const Error: Story = { args: { projection: { view: 'scheduled', state: { kind: 'error' }, filters: empty, scopeKey, attribution: [] } },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  } };
export const PermissionDenied: Story = { args: { canRead: false }, play: invalid };
export const NoCalendarAccess: Story = { args: { canOpenCalendar: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^View Calendar:/ })).not.toBeInTheDocument();
  await expect(within(canvasElement).getAllByRole('button', { name: /^View record:/ })).toHaveLength(6);
} };
export const NoExportAccess: Story = { args: { canExport: false }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(args.onExport).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const input of c.getAllByRole('combobox')) await expect(input).toBeDisabled();
  for (const button of c.getAllByRole('button', { name: /^Actions:|^View Calendar:|^View record:|^Preview CSV$/ })) await expect(button).toBeDisabled();
  await expect(args.onViewChange).not.toHaveBeenCalled();
  await expect(args.onFiltersChange).not.toHaveBeenCalled();
} };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Calendar report workspace' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Calendar report workspace' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/Unscheduled queues have an independent current draft/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
