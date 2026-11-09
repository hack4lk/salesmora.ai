import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { BusinessOverview } from './business-overview';
import {
  businessOverviewResponse,
  businessOverviewTimezone,
  businessOverviewToday,
  defaultBusinessOverviewPeriod,
} from './business-overview.fixtures';
import { businessOverviewData as copy } from './business-overview.data';
import type { ReportPeriodSelection } from '../report-date-controls/report-date-controls.validation';
import { resolveReportPeriod } from '../report-date-controls/report-date-controls.validation';
import { adaptBusinessOverviewResponse, businessOverviewRequest, type BusinessOverviewAuthority } from './business-overview.adapter';
import { overviewBackendAuthority, overviewBackendResponse, overviewBackendScopeKey, overviewBackendWorkspaceId } from './business-overview.adapter.fixtures';
import { reportSummaryData } from '../report-summary/report-summary.data';

const meta = {
  title: 'Reports/BusinessOverview',
  component: BusinessOverview,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8">
    <div className="mx-auto max-w-6xl"><Story /></div>
  </main>],
  args: {
    state: { kind: 'ready', result: businessOverviewResponse() },
    period: defaultBusinessOverviewPeriod,
    today: businessOverviewToday,
    timezone: businessOverviewTimezone,
    canRead: true,
    onPeriodApply: fn(),
    onEvidence: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof BusinessOverview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Host(args) {
    const [period, setPeriod] = useState<ReportPeriodSelection>(args.period);
    const result = businessOverviewResponse({ period });
    return <BusinessOverview {...args} period={period} state={{ kind: 'ready', result }}
      onPeriodApply={value => {
        setPeriod(value);
        args.onPeriodApply(value);
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.periodResults })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.currentState })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.attention })).toBeVisible();
    const summaries = canvas.getAllByRole('region', { name: 'Report summary' });
    await expect(summaries[0]).toHaveTextContent('3');
    await expect(within(summaries[1]!).getByText('5', { exact: true })).toBeVisible();

    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Date range' }), 'custom');
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), {
      target: { value: '2026-09-01' },
    });
    fireEvent.change(canvas.getByLabelText('End date', { exact: false }), {
      target: { value: '2026-09-30' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
    await expect(args.onPeriodApply).toHaveBeenLastCalledWith({
      preset: 'custom', from: '2026-09-01', to: '2026-09-30',
    });
    const updatedSummaries = canvas.getAllByRole('region', { name: 'Report summary' });
    await expect(updatedSummaries[0]).toHaveTextContent('1');
    await expect(within(updatedSummaries[1]!).getByText('5', { exact: true })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'View details: Overdue Jobs' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('overdue-jobs');
  },
};

export const EmptyPeriod: Story = {
  args: {
    period: { preset: 'custom', from: '2026-08-01', to: '2026-08-30' },
    state: { kind: 'ready', result: businessOverviewResponse({
      period: { preset: 'custom', from: '2026-08-01', to: '2026-08-30' },
    }) },
  },
};
export const Loading: Story = { args: { state: { kind: 'loading' } } };
export const Error: Story = {
  args: { state: { kind: 'error', message: 'Overview data is temporarily unavailable.' } },
};
export const AccessDenied: Story = { args: { canRead: false } };
export const AcceptedValueUnavailable: Story = {
  args: { state: { kind: 'ready', result: businessOverviewResponse({ canReadEstimateValues: false }) } },
};
export const AttentionUnavailable: Story = {
  args: { state: { kind: 'ready', result: businessOverviewResponse({ attentionUnavailable: true }) } },
};

function backendHost(authority: BusinessOverviewAuthority, invalidMoney = false): Story['render'] {
  return function Host(args) {
    const [period, setPeriod] = useState(args.period);
    const range = resolveReportPeriod(period, args.today, 'history').range;
    if (!range) throw new globalThis.Error('The Overview backend story requires valid period bounds.');
    const request = businessOverviewRequest({ workspaceId: overviewBackendWorkspaceId, range });
    const adapted = adaptBusinessOverviewResponse(overviewBackendResponse(request, authority, invalidMoney), {
      request, period, today: args.today, timezone: args.timezone, authority, scopeKey: overviewBackendScopeKey, canRead: args.canRead,
    });
    return <BusinessOverview {...args} period={period} state={adapted.state}
      onPeriodApply={value => { setPeriod(value); args.onPeriodApply(value); }} />;
  };
}
export const BackendContracts: Story = {
  render: backendHost(overviewBackendAuthority),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('heading', { name: copy.periodResults })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Actions: Accepted estimates' }));
    await userEvent.click(await body.findByRole('menuitem', { name: reportSummaryData.evidence }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('accepted-estimates');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Date range' }), 'custom');
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
    fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-08-30' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
    await expect(args.onPeriodApply).toHaveBeenLastCalledWith({ preset: 'custom', from: '2026-08-01', to: '2026-08-30' });
    const summaries = canvas.getAllByRole('region', { name: 'Report summary' });
    await expect(within(summaries[0]!).getByText('$0.00', { exact: true })).toBeVisible();
    await expect(within(summaries[1]!).getByText('5', { exact: true })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'View details: Overdue Jobs' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('overdue-jobs');
  },
};
export const BackendPartialAuthority: Story = {
  render: backendHost({ ...overviewBackendAuthority, estimate: null, calendar: null }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Actions: Accepted estimates' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'View details: Upcoming visits' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'View details: Overdue Jobs' })).toBeVisible();
  },
};
export const BackendAssignedCoverage: Story = {
  render: backendHost({ reportScope: 'assigned', lead: null, job: { scope: 'assigned' },
    estimate: { scope: 'assigned_job', archives: 'excluded' }, calendar: { kind: 'own', viewerId: 'mock-viewer' } }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'View details: Inactive open Leads' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Actions: New Leads' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'View details: Overdue Jobs' })).toBeVisible();
    await expect(canvas.getAllByText(/Reports: assigned/)[0]).toBeVisible();
  },
};
export const BackendInvalidFrozenValues: Story = {
  render: backendHost(overviewBackendAuthority, true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Actions: Accepted pre-tax value' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Actions: Accepted estimates' })).toBeVisible();
    await expect(canvas.getByText('Issued frozen values could not be verified.', { exact: true })).toBeVisible();
  },
};
