import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ActivityReport } from './activity-report';
import {
  activityFilterOptions,
  activityReportResponse,
  activityReportTimezone,
  activityReportToday,
  defaultActivityPeriod,
  emptyActivityFilters,
} from './activity-report.fixtures';
import type { ActivityFiltersValue } from './activity-report.validation';
import { activityReportRequest, adaptActivityReportResponse } from './activity-report.adapter';
import { activityBackendDomains, activityBackendEvents, activityBackendResponse,
  activityBackendScopeKey, activityBackendWorkspaceId } from './activity-report.adapter.fixtures';
import { resolveReportPeriod, type ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';

const meta = {
  title: 'Reports/ActivityReport',
  component: ActivityReport,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8">
    <div className="mx-auto max-w-6xl"><Story /></div>
  </main>],
  args: {
    state: { kind: 'ready', result: activityReportResponse() },
    period: defaultActivityPeriod,
    filters: emptyActivityFilters,
    filterOptions: activityFilterOptions,
    today: activityReportToday,
    timezone: activityReportTimezone,
    canRead: true,
    onPeriodApply: fn(),
    onFiltersChange: fn(),
    onRetryFilters: fn(),
    onRetry: fn(),
    onRecord: fn(),
    onPageChange: fn(),
    onPageSizeChange: fn(),
  },
} satisfies Meta<typeof ActivityReport>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Host(args) {
    const [filters, setFilters] = useState<ActivityFiltersValue>(emptyActivityFilters);
    const [page, setPage] = useState(1);
    const result = activityReportResponse({ filters, page });
    return <ActivityReport {...args} filters={filters} state={{ kind: 'ready', result }}
      onFiltersChange={value => { setFilters(value); setPage(1); args.onFiltersChange(value); }}
      onPageChange={value => { setPage(value); args.onPageChange(value); }}
      onRecord={recordId => args.onRecord(recordId)} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('6');
    const record = canvas.getByRole('button', { name: 'View record: Lead L-101 / Morgan Ellis' });
    await userEvent.click(record);
    await expect(args.onRecord).toHaveBeenLastCalledWith({ domain: 'lead', recordId: 'lead-101' });
    const domain = canvas.getByRole('combobox', { name: 'Record type' });
    await userEvent.click(domain);
    await userEvent.click(await body.findByRole('option', { name: 'Lead' }));
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('2');
    await expect(canvas.getByRole('button', { name: 'View record: Lead L-101 / Morgan Ellis' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'View record: Job J-1042 / Panel upgrade' })).not.toBeInTheDocument();
  },
};

export const Empty: Story = { args: { state: { kind: 'ready', result: activityReportResponse({ rows: [] }) } } };
export const Loading: Story = { args: { state: { kind: 'loading' }, filterState: 'loading' } };
export const Error: Story = { args: { state: { kind: 'error', message: 'Activity history is temporarily unavailable.' } } };
export const AccessDenied: Story = { args: { canRead: false, state: { kind: 'ready', result: activityReportResponse() } } };

export const BackendContracts: Story = {
  render: function Host(args) {
    const [period, setPeriod] = useState<ReportPeriodSelection>(defaultActivityPeriod);
    const [filters, setFilters] = useState<ActivityFiltersValue>(emptyActivityFilters);
    const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(25);
    const range = resolveReportPeriod(period, activityReportToday, 'history');
    if (!range.range) throw new globalThis.Error('Invalid Activity story period.');
    const request = activityReportRequest({ workspaceId: activityBackendWorkspaceId, range: range.range, filters, page, pageSize });
    const adapted = adaptActivityReportResponse(activityBackendResponse(request), {
      request, period, scopeKey: activityBackendScopeKey, canRead: args.canRead,
      today: activityReportToday, timezone: activityReportTimezone, includedDomains: activityBackendDomains,
    });
    return <ActivityReport {...args} period={period} filters={filters} state={adapted.state} filterOptions={adapted.filterOptions}
      onPeriodApply={value => { setPeriod(value); setFilters(emptyActivityFilters); setPage(1); args.onPeriodApply(value); }}
      onFiltersChange={value => { setFilters(value); setPage(1); args.onFiltersChange(value); }}
      onPageChange={value => { setPage(value); args.onPageChange(value); }}
      onPageSizeChange={value => { setPageSize(value); setPage(1); args.onPageSizeChange(value); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('6');
    await userEvent.click(canvas.getByRole('button', { name: 'View record: Lead L-101 / Morgan Ellis' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith({ domain: 'lead', recordId: activityBackendEvents[0]!.recordId });
    await userEvent.click(canvas.getByRole('combobox', { name: 'Record type' }));
    await userEvent.click(await body.findByRole('option', { name: 'Work Order' }));
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('1');
    await expect(canvas.getByRole('button', { name: 'View record: Work Order WO-0304 / Drain repair' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'View record: Lead L-101 / Morgan Ellis' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('6');
    await userEvent.click(canvas.getByRole('combobox', { name: 'Action type' }));
    await userEvent.click(await body.findByRole('option', { name: 'Decision recorded' }));
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('1');
    await userEvent.click(canvas.getByRole('button', { name: 'View record: Estimate EST-0022 / revision 1 / Kitchen remodel' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith({ domain: 'estimate', recordId: activityBackendEvents.find(row => row.domain === 'estimate')!.recordId });
    await userEvent.click(canvas.getByRole('combobox', { name: 'Actor' }));
    await userEvent.click(await body.findByRole('option', { name: 'Ava Morgan' }));
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('1');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Rows per page' }), '50');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(50);
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

const backendRequest = activityReportRequest({ workspaceId: activityBackendWorkspaceId,
  range: { from: '2026-10-08', to: activityReportToday }, filters: emptyActivityFilters, page: 1, pageSize: 25 });
const assignedDomains = activityBackendDomains.filter(item => item.domain !== 'customer')
  .map(item => ({ ...item, scope: 'assigned' as const }));
const backendHost = { request: backendRequest, period: defaultActivityPeriod, scopeKey: activityBackendScopeKey,
  canRead: true, today: activityReportToday, timezone: activityReportTimezone };
const assignedBackend = adaptActivityReportResponse(activityBackendResponse(backendRequest, {
  includedDomains: assignedDomains,
}), { ...backendHost, includedDomains: assignedDomains });
export const BackendAssignedCoverage: Story = {
  args: { state: assignedBackend.state, filterOptions: assignedBackend.filterOptions },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('5');
    await expect(canvas.getAllByText(/Omitted: Customer \(permissions\)/)[0]).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /View record: Customer/ })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
const emptyBackend = adaptActivityReportResponse(activityBackendResponse(backendRequest, { rows: [] }),
  { ...backendHost, includedDomains: activityBackendDomains });
export const BackendEmpty: Story = {
  args: { state: emptyBackend.state, filterOptions: emptyBackend.filterOptions },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Report summary' })).toHaveTextContent('0');
    await expect(canvas.queryByRole('button', { name: /^View record:/ })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
