import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { FinancialReport } from './financial-report';
import {
  defaultFinancialPeriod,
  financialReportResponse,
  financialReportTimezone,
  financialReportToday,
  fullFinancialAccess,
} from './financial-report.fixtures';
import { financialReportData as copy } from './financial-report.data';
import type { FinancialEvidencePage, FinancialReportAccess } from './financial-report.validation';
import { adaptFinancialReportResponses, financialReportRequests } from './financial-report.adapter';
import { financialBackendResponses, financialBackendScopeKey, financialBackendWorkspaceId } from './financial-report.adapter.fixtures';
import { resolveReportPeriod } from '../report-date-controls/report-date-controls.validation';
import { reportSummaryData } from '../report-summary/report-summary.data';

const meta = {
  title: 'Reports/FinancialReport',
  component: FinancialReport,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8">
    <div className="mx-auto max-w-6xl"><Story /></div>
  </main>],
  args: {
    state: { kind: 'ready', result: financialReportResponse() },
    period: defaultFinancialPeriod,
    today: financialReportToday,
    timezone: financialReportTimezone,
    access: fullFinancialAccess,
    canRead: true,
    onPeriodApply: fn(),
    onEvidence: fn(),
    onRecord: fn(),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    onRetry: fn(),
  },
  render: args => <FinancialReport {...args} />,
} satisfies Meta<typeof FinancialReport>;
export default meta;
type Story = StoryObj<typeof meta>;

const materialsAccess: FinancialReportAccess = {
  ...fullFinancialAccess,
  canReadWorkOrderCosts: false,
};
const estimateValuesAccess: FinancialReportAccess = {
  ...fullFinancialAccess,
  canReadEstimateValues: false,
};

export const Default: Story = {
  render: function Host(args) {
    const [period, setPeriod] = useState(args.period);
    const [selected, setSelected] = useState<FinancialEvidencePage['kind']>('accepted');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(2);
    const result = financialReportResponse({ period, selected, page, pageSize, access: args.access });
    return <FinancialReport {...args} period={period} state={{ kind: 'ready', result }}
      onPeriodApply={value => {
        setPeriod(value);
        setPage(1);
        args.onPeriodApply(value);
      }}
      onEvidence={value => {
        setSelected(value);
        setPage(1);
        args.onEvidence(value);
      }}
      onPageChange={value => {
        setPage(value);
        args.onPageChange(value);
      }}
      onPageSizeChange={value => {
        setPageSize(value);
        setPage(1);
        args.onPageSizeChange(value);
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('heading', { name: copy.periodEstimates })).toBeVisible();
    const record = canvas.getByRole('button', {
      name: 'View record: Estimate E-0101 / Hall renovation',
    });
    await userEvent.click(record);
    await expect(args.onRecord).toHaveBeenLastCalledWith('estimate-101');
  },
};

export const EmptyPeriod: Story = {
  args: {
    period: { preset: 'custom', from: '2026-08-01', to: '2026-08-30' },
    state: { kind: 'ready', result: financialReportResponse({
      period: { preset: 'custom', from: '2026-08-01', to: '2026-08-30' },
      selected: 'accepted',
    }) },
  },
};
export const Loading: Story = { args: { state: { kind: 'loading' } } };
export const Error: Story = {
  args: { state: { kind: 'error', message: 'Financial report data is temporarily unavailable.' } },
};
export const AccessDenied: Story = { args: { canRead: false } };
export const EstimateValuesUnavailable: Story = {
  args: {
    access: estimateValuesAccess,
    state: { kind: 'ready', result: financialReportResponse({ access: estimateValuesAccess }) },
  },
};
export const MaterialEvidence: Story = {
  args: {
    state: { kind: 'ready', result: financialReportResponse({ selected: 'materials' }) },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Current material-cost evidence' })).toBeVisible();
    const table = canvas.getByRole('table', { name: 'Current material-cost evidence' });
    const evidence = within(table);
    await expect(evidence.getByRole('cell', { name: 'Copper cable' })).toBeVisible();
    const record = evidence.getAllByRole('button', {
      name: 'View record: WO-0001 / Panel upgrade',
    })[0]!;
    await userEvent.click(record);
    await expect(args.onRecord).toHaveBeenLastCalledWith('work-order-001');
  },
};
export const WorkOrderCostsUnavailable: Story = {
  args: {
    access: materialsAccess,
    state: { kind: 'ready', result: financialReportResponse({
      access: materialsAccess,
      selected: 'materials',
    }) },
  },
};

export const BackendContracts: Story = {
  render: function BackendHost(args) {
    const [period, setPeriod] = useState(args.period);
    const [selected, setSelected] = useState<FinancialEvidencePage['kind']>('accepted');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const range = resolveReportPeriod(period, financialReportToday, 'history').range;
    if (!range) throw new globalThis.Error('The Financial backend story requires valid period bounds.');
    const requests = financialReportRequests({ workspaceId: financialBackendWorkspaceId, range, selected, page, pageSize });
    const adapted = adaptFinancialReportResponses(financialBackendResponses(requests, args.access), {
      requests, selected, period, scopeKey: financialBackendScopeKey, canRead: args.canRead, access: args.access,
      today: financialReportToday, timezone: financialReportTimezone, estimateScope: 'workspace',
      estimateArchives: 'included', materialScope: 'workspace', canReadJobLabels: true,
    });
    return <FinancialReport {...args} period={period} state={adapted.state}
      onPeriodApply={value => { setPeriod(value); setPage(1); args.onPeriodApply(value); }}
      onEvidence={value => { setSelected(value); setPage(1); args.onEvidence(value); }}
      onPageChange={value => { setPage(value); args.onPageChange(value); }}
      onPageSizeChange={value => { setPageSize(value); setPage(1); args.onPageSizeChange(value); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.periodEstimates })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'View record: Estimate EST-0101 / Hall renovation' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000000101');
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: `Actions: ${copy.awaitingCount}` }));
    await userEvent.click(await body.findByRole('menuitem', { name: reportSummaryData.evidence }));
    await expect(canvas.getByRole('table', { name: 'Awaiting-decision estimate evidence' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: `Actions: ${copy.knownCosts}` }));
    await userEvent.click(await body.findByRole('menuitem', { name: reportSummaryData.evidence }));
    const table = canvas.getByRole('table', { name: 'Current material-cost evidence' });
    await expect(within(table).getByRole('cell', { name: 'Copper cable' })).toBeVisible();
    await userEvent.click(within(table).getAllByRole('button', { name: 'View record: WO-0001 / Panel upgrade' })[0]!);
    await expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000001101');
    for (const size of ['50', '100', '25']) {
      await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Rows per page' }), size);
      await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(Number(size));
      await expect(canvas.getByRole('table', { name: 'Current material-cost evidence' })).toBeVisible();
    }
  },
};
export const BackendPartialAuthority: Story = {
  render: BackendContracts.render,
  args: { access: { ...fullFinancialAccess, canReadWorkOrderCosts: false, canReadEstimateValues: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('table', { name: 'Accepted estimate evidence' })).toBeVisible();
    await expect(canvas.queryByRole('columnheader', { name: 'Frozen pre-tax value' })).not.toBeInTheDocument();
    await expect(canvas.getByText(copy.costPermission)).toBeVisible();
  },
};
export const BackendEmptyPeriod: Story = {
  render: BackendContracts.render,
  args: { period: { preset: 'custom', from: '2026-08-01', to: '2026-08-30' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'No matching records' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: copy.currentEstimates })).toBeVisible();
    await expect(canvas.getAllByText(copy.missingCostCoverage(5, 6))[0]).toBeVisible();
  },
};
