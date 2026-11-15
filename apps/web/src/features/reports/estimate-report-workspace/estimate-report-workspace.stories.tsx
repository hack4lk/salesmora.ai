import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { EstimateReportWorkspace, estimateReportViews, type EstimateReportProjection } from './estimate-report-workspace';
import { estimateWorkspaceOptions, estimateWorkspaceResponse, estimateWorkspaceScope } from './estimate-report-workspace.fixtures';
import type { EstimateReportFiltersValue, EstimateReportFilterContext } from '../estimate-report-filters/estimate-report-filters';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { estimateDecisionsReportData as decisionsCopy } from '../estimate-decisions-report/estimate-decisions-report.data';
import { estimateCurrentReportData as currentCopy } from '../estimate-current-report/estimate-current-report.data';
import { estimateFirstQuotedReportData as quotedCopy } from '../estimate-first-quoted-report/estimate-first-quoted-report.data';

const empty: EstimateReportFiltersValue = { owners: [], parents: [] };
const projection = estimateWorkspaceResponse('decisions', empty);
const meta = {
  title: 'Reports/EstimateReportWorkspace', component: EstimateReportWorkspace, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical composition of approved period decisions, first-quoted families, current quotes/expiry/handoff and owner/parent filters. Separate period/current drafts, authorized views and one selected evidence table. First-quoted and decisions share period drafts, not date predicates or denominators. Mock hosts filter authorized issued families before aggregation/pagination and reset pages on view/filter/evidence changes. Projection filter/scope snapshots and page attribution must match; unseen aggregate membership remains host-owned. Independent money/current/handoff grants suppress stale data. No production queries/routes/CSV.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { projection, availableViews: estimateReportViews, filters: { period: empty, current: empty },
    filterOptions: estimateWorkspaceOptions, scopeKey: estimateWorkspaceScope, canRead: true, canReadCurrent: true,
    canReadMoney: true, canReadHandoff: true, canExport: true, canEdit: true,
    onViewChange: fn(), onFiltersChange: fn(), onRetryFilters: fn(), onEvidence: fn(), onRecord: fn(), onExport: fn(),
    onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof EstimateReportWorkspace>;
export default meta;
type Story = StoryObj<typeof meta>;
const summary = (element: HTMLElement) => within(within(element).getByRole('region', { name: 'Report summary' }));
async function noResults(element: HTMLElement) {
  const c = within(element);
  await expect(c.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
}
async function selectFacet(element: HTMLElement, facet: string, label: string) {
  const c = within(element), body = within(element.ownerDocument.body);
  await userEvent.click(c.getByRole('combobox', { name: facet }));
  await userEvent.keyboard('{ArrowDown}');
  const option = await body.findByRole('option', { name: label });
  await waitFor(() => expect(option).toBeVisible());
  await userEvent.click(option); await userEvent.keyboard('{Escape}');
}
export const Default: Story = {
  render: function Render(args) {
    const [current, setCurrent] = useState<EstimateReportProjection>(args.projection);
    const [filters, setFilters] = useState<Record<EstimateReportFilterContext, EstimateReportFiltersValue>>(args.filters);
    const [evidence, setEvidence] = useState<string>();
    const [size, setSize] = useState(args.projection.state.kind === 'ready' ? args.projection.state.result.pageSize : 25);
    const context = current.view === 'current' ? 'current' : 'period';
    return <EstimateReportWorkspace {...args} projection={current} filters={filters}
      onViewChange={view => {
        args.onViewChange(view); setEvidence(undefined);
        setCurrent(estimateWorkspaceResponse(view, filters[view === 'current' ? 'current' : 'period'], undefined, 1, size, args.scopeKey));
      }}
      onFiltersChange={(context, value) => {
        args.onFiltersChange(context, value); setFilters(drafts => ({ ...drafts, [context]: value })); setEvidence(undefined);
        setCurrent(estimateWorkspaceResponse(current.view, value, undefined, 1, size, args.scopeKey));
      }}
      onEvidence={id => {
        args.onEvidence(id); setEvidence(id);
        setCurrent(estimateWorkspaceResponse(current.view, filters[context], id, 1, size, args.scopeKey));
      }}
      onPageChange={page => {
        args.onPageChange(page); setCurrent(estimateWorkspaceResponse(current.view, filters[context], evidence, page, size, args.scopeKey));
      }}
      onPageSizeChange={next => {
        args.onPageSizeChange(next); setSize(next); setCurrent(estimateWorkspaceResponse(current.view, filters[context], evidence, 1, next, args.scopeKey));
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.rate })).toHaveTextContent('50%');
    await selectFacet(canvasElement, 'Current owner', 'Blair');
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith('period', { owners: ['member:b'], parents: [] });
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.rate })).toHaveTextContent('100%');
    await selectFacet(canvasElement, 'Parent type', 'Job');
    await expect(c.getByText(decisionsCopy.empty)).toBeVisible();
    await selectFacet(canvasElement, 'Parent type', 'Lead');
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.accepted })).toHaveTextContent('1');
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'current');
    await expect(args.onViewChange).toHaveBeenLastCalledWith('current');
    await expect(c.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.awaiting })).toHaveTextContent('4');
    await selectFacet(canvasElement, 'Current owner', 'Alex');
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.awaiting })).toHaveTextContent('2');
    await selectMetricEvidence(canvasElement, currentCopy.expired);
    await expect(c.getByRole('button', { name: 'View record: YESTERDAY / issued revision 1' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'decisions');
    await expect(c.getByRole('button', { name: 'Remove filter: Current owner: Blair' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'Remove filter: Parent type: Job' })).toBeVisible();
    await selectMetricEvidence(canvasElement, decisionsCopy.accepted);
    await userEvent.click(c.getByRole('button', { name: 'View record: E2 / effective revision 2' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('workspace-fixture:E2:r2');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'current');
    await expect(c.getByRole('button', { name: 'Remove filter: Current owner: Alex' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await selectMetricEvidence(canvasElement, currentCopy.handoff);
    await expect(c.getByRole('button', { name: 'View record: HANDOFF / issued revision 1' })).toBeVisible();
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  },
};
export const Current: Story = { render: Default.render, args: { projection: estimateWorkspaceResponse('current', empty) } };
export const FirstQuoted: Story = { render: Default.render, args: { projection: estimateWorkspaceResponse('first-quoted', empty) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: quotedCopy.metric })).toHaveTextContent('4');
    await expect(c.queryByRole('button', { name: 'View record: E1 / first quoted family' })).not.toBeInTheDocument();
    await selectFacet(canvasElement, 'Current owner', 'Blair');
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith('period', { owners: ['member:b'], parents: [] });
    await expect(summary(canvasElement).getByRole('group', { name: quotedCopy.metric })).toHaveTextContent('2');
    await selectMetricEvidence(canvasElement, quotedCopy.metric);
    await expect(args.onEvidence).toHaveBeenLastCalledWith('first-quoted');
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'decisions');
    await expect(c.getByRole('button', { name: 'Remove filter: Current owner: Blair' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.rate })).toHaveTextContent('100%');
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'current');
    await expect(c.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
    await selectFacet(canvasElement, 'Current owner', 'Alex');
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'first-quoted');
    await expect(c.getByRole('button', { name: 'Remove filter: Current owner: Blair' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: quotedCopy.metric })).toHaveTextContent('2');
    await selectFacet(canvasElement, 'Parent type', 'Job');
    await expect(summary(canvasElement).getByRole('group', { name: quotedCopy.metric })).toHaveTextContent('0');
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(summary(canvasElement).getByRole('group', { name: quotedCopy.metric })).toHaveTextContent('4');
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  } };
export const FirstQuotedPagination: Story = { render: Default.render,
  args: { projection: estimateWorkspaceResponse('first-quoted', empty, undefined, 1, 1) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await selectMetricEvidence(canvasElement, quotedCopy.metric);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'decisions');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'first-quoted');
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await selectFacet(canvasElement, 'Current owner', 'Blair');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  } };
export const FirstQuotedWithoutCurrentMoneyAccess: Story = { args: { canReadCurrent: false, canReadMoney: false, canReadHandoff: false,
  projection: estimateWorkspaceResponse('first-quoted', empty) }, play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: quotedCopy.metric })).toHaveTextContent('4');
    await expect(within(canvasElement).getByRole('region', { name: 'Supporting evidence' })).toBeVisible();
  } };
export const FirstQuotedUnavailable: Story = { args: { availableViews: ['decisions', 'current'], projection: estimateWorkspaceResponse('first-quoted', empty) },
  play: async ({ canvasElement }) => {
    await noResults(canvasElement);
    await expect(within(canvasElement).getByRole('option', { name: 'Unavailable saved view' })).toBeDisabled();
  } };
export const ParentOwnerIntersection: Story = { render: Default.render,
  args: { filters: { period: { owners: ['member:a'], parents: ['job'] }, current: empty },
    projection: estimateWorkspaceResponse('decisions', { owners: ['member:a'], parents: ['job'] }) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.accepted })).toHaveTextContent('0');
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.declined })).toHaveTextContent('1');
    await expect(c.getByRole('button', { name: 'View record: E3 / effective revision 1' })).toBeVisible();
  } };
export const JobParentHasNoHandoff: Story = { render: Default.render,
  args: { filters: { period: empty, current: { owners: [], parents: ['job'] } },
    projection: estimateWorkspaceResponse('current', { owners: [], parents: ['job'] }, 'handoff') },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.handoff })).toHaveTextContent('0');
    await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  } };
export const PaginationResets: Story = { render: Default.render,
  args: { projection: estimateWorkspaceResponse('decisions', empty, undefined, 1, 1) },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await selectMetricEvidence(canvasElement, decisionsCopy.accepted);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'current');
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await selectFacet(canvasElement, 'Current owner', 'Alex');
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  } };
export const RemovedSelection: Story = { render: Default.render,
  args: { filters: { period: { owners: ['hidden-owner'], parents: [] }, current: empty } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await noResults(canvasElement);
    await expect(c.queryByText(/hidden-owner/)).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Remove filter: Current owner: Unavailable saved selection' }));
    await expect(summary(canvasElement).getByRole('group', { name: decisionsCopy.rate })).toHaveTextContent('50%');
  } };
export const InactiveInvalidDraft: Story = { render: Default.render,
  args: { filters: { period: empty, current: { owners: ['hidden-owner'], parents: [] } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('region', { name: 'Supporting evidence' })).toBeVisible();
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'current');
    await noResults(canvasElement);
    await expect(c.getByRole('alert')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
    await expect(summary(canvasElement).getByRole('group', { name: currentCopy.awaiting })).toHaveTextContent('4');
  } };
export const StaleFilterProjection: Story = { args: { filters: { period: { owners: ['member:a'], parents: [] }, current: empty } },
  play: async ({ canvasElement }) => {
    await noResults(canvasElement);
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('do not match');
  } };
export const StaleScopeProjection: Story = { args: { scopeKey: 'fixture:new-grants' }, play: StaleFilterProjection.play };
export const InvalidAttribution: Story = { args: { projection: { ...projection, attribution: [] } }, play: StaleFilterProjection.play };
export const InvalidOptions: Story = { args: { filterOptions: { parents: [{ value: 'customer', label: 'Customer' }] } },
  play: async ({ canvasElement }) => { await noResults(canvasElement); await expect(within(canvasElement).getByRole('alert')).toBeVisible(); } };
export const LoadingFilters: Story = { args: { filterState: 'loading' }, play: async ({ canvasElement }) => {
  await noResults(canvasElement); await expect(within(canvasElement).getByRole('status')).toBeVisible();
} };
export const FilterError: Story = { args: { filterState: 'error' }, play: async ({ canvasElement, args }) => {
  await noResults(canvasElement);
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry filters' }));
  await expect(args.onRetryFilters).toHaveBeenCalledTimes(1);
} };
export const MoneyAccessRevoked: Story = { args: { canReadMoney: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(decisionsCopy.moneyDenied)).toBeVisible();
  await expect(c.queryByText('$90.00')).not.toBeInTheDocument();
  await expect(c.queryByText('$99.00')).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: `Actions: ${decisionsCopy.value}` })).not.toBeInTheDocument();
} };
export const HandoffAccessRevoked: Story = { args: { canReadHandoff: false, projection: estimateWorkspaceResponse('current', empty, 'handoff') },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(currentCopy.handoffDenied)).toBeVisible();
    await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
    await expect(c.queryByText('HANDOFF / issued revision 1')).not.toBeInTheDocument();
  } };
export const CurrentAccessRevoked: Story = { args: { canReadCurrent: false, projection: estimateWorkspaceResponse('current', empty) },
  play: async ({ canvasElement }) => {
    await noResults(canvasElement);
    await expect(within(canvasElement).getByRole('option', { name: 'Current quotes, expiry and Job handoff' })).toBeDisabled();
  } };
export const PeriodWithCurrentRevoked: Story = { args: { canReadCurrent: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('region', { name: 'Supporting evidence' })).toBeVisible();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await noResults(canvasElement);
  await expect(within(canvasElement).queryByRole('combobox')).not.toBeInTheDocument();
} };
export const UnavailableView: Story = { args: { availableViews: ['current'] }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await noResults(canvasElement);
  await expect(c.getByRole('option', { name: 'Unavailable saved view' })).toBeDisabled();
  await userEvent.selectOptions(c.getByRole('combobox', { name: 'Report view' }), 'current');
  await expect(args.onViewChange).toHaveBeenLastCalledWith('current');
} };
export const DuplicateViews: Story = { args: { availableViews: ['decisions', 'decisions'] }, play: async ({ canvasElement }) => {
  await noResults(canvasElement);
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('views are inconsistent');
} };
export const Loading: Story = { args: { projection: { ...projection, view: 'decisions', state: { kind: 'loading' } } },
  play: async ({ canvasElement }) => { await noResults(canvasElement); } };
export const Error: Story = { args: { projection: { ...projection, view: 'decisions', state: { kind: 'error' } } },
  play: async ({ canvasElement, args }) => {
    await noResults(canvasElement);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  } };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const box of c.getAllByRole('combobox').filter(box => box.getAttribute('aria-label') !== 'Rows per page')) await expect(box).toBeDisabled();
  for (const button of c.getAllByRole('button', { name: /^Actions:/ })) await expect(button).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(args.onEvidence).not.toHaveBeenCalled();
} };
export const NoExportAccess: Story = { args: { canExport: false }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: 'Preview CSV' });
  await expect(button).toBeDisabled(); await userEvent.click(button);
  await expect(args.onExport).not.toHaveBeenCalled();
} };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: 'About Estimates report workspace' });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: 'About Estimates report workspace' });
  await waitFor(() => expect(dialog).toBeVisible());
  await expect(within(dialog).getByText(/Period\/current filter drafts remain separate/)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
