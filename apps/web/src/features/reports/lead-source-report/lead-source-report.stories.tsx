import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LeadSourceReport } from './lead-source-report';
import { leadSourceResponse, leadSourceCohort, relabelLeadSource } from './lead-source-report.fixtures';
import { leadSourceReportData as copy } from './lead-source-report.data';
import type { LeadSourceResult } from './lead-source-report.validation';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { adaptLeadSourceReportResponse, leadSourceReportRequest } from './lead-source-report.adapter';
import { sourceBackendResponse, sourceBackendWorkspaceId, sourceBackendScopeKey,
  sourceBackendRange, sourceBackendEmptyFilters } from './lead-source-report.adapter.fixtures';

const result = leadSourceResponse();
const meta = {
  title: 'Reports/LeadSourceReport', component: LeadSourceReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical current-recorded-source breakdown for a lead-creation cohort. L07 fixture reconciles four cohort leads and two converted leads across Website, Referral, Phone, Gmail and Other. Conversion uses R2 distinct-lead/surviving-authorized-linked-Job semantics. Accepted estimate value sums each distinct accepted family once using frozen pre-tax cents as of the snapshot; cohort-reachable ambiguous families are separate from source groups. Conversion and estimate-price access are independently gated. Current source labels are editable, not immutable acquisition provenance. No campaign ROI, capture-receipt attribution or production query.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canReadConversion: true, canReadAcceptedValue: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof LeadSourceReport>;
export default meta;
type Story = StoryObj<typeof meta>;
const summary = (element: HTMLElement) => within(within(element).getByRole('region', { name: 'Report summary' }));
const sourceRow = (element: HTMLElement, source: string) => {
  const rows = [...element.querySelectorAll<HTMLElement>('article, tr')].filter(row =>
    row.getAttribute('aria-label') === source || row.tagName === 'TR' && row.textContent?.includes(source));
  return rows.find(row => row.getBoundingClientRect().width > 0) ?? rows[0]!;
};
const visibleRecordButtons = (element: HTMLElement) =>
  [...element.querySelectorAll<HTMLButtonElement>('button[aria-label^="View record:"]')]
    .filter(button => button.getBoundingClientRect().width > 0);
async function visibleText(element: HTMLElement, text: string) {
  await expect(within(element).getAllByText(text).find(match => match.getBoundingClientRect().width > 0)).toBeVisible();
}
export const Default: Story = {
  render: function Host(args) {
    const [kind, setKind] = useState<LeadSourceResult['evidence']['kind']>('cohort');
    return <LeadSourceReport {...args} state={{ kind: 'ready', result: leadSourceResponse(leadSourceCohort, { kind }) }}
      onEvidence={evidenceId => {
        args.onEvidence(evidenceId);
        setKind(evidenceId === 'source-converted' ? 'converted'
          : evidenceId === 'source-accepted-value' ? 'accepted-estimates' : 'cohort');
      }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), cards = summary(canvasElement);
    await expect(cards.getByRole('group', { name: copy.cohort })).toHaveTextContent('4');
    await expect(cards.getByRole('group', { name: copy.converted })).toHaveTextContent('2');
    await expect(cards.getByRole('group', { name: copy.rate })).toHaveTextContent('50%');
    for (const [source, cohort, converted, rate] of [
      ['Website', '1', '1', '100%'], ['Referral', '1', '0', '0%'], ['Phone', '1', '1', '100%'],
      ['Gmail', '1', '0', '0%'], ['Other', '0', '0', '—'],
    ]) {
      const row = sourceRow(canvasElement, source);
      await expect(row.textContent).toContain(cohort);
      await expect(row.textContent).toContain(converted);
      await expect(row.textContent).toContain(rate);
    }
    await selectMetricEvidence(canvasElement, copy.converted);
    await expect(args.onEvidence).toHaveBeenLastCalledWith('source-converted');
    await waitFor(() => expect(visibleRecordButtons(canvasElement)).toHaveLength(2));
    const record = visibleRecordButtons(canvasElement).find(button =>
      button.getAttribute('aria-label') === 'View record: Archived phone inquiry');
    await userEvent.click(record!);
    await expect(args.onRecord).toHaveBeenLastCalledWith('lead-L3');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await selectMetricEvidence(canvasElement, copy.acceptedValue);
    await expect(args.onEvidence).toHaveBeenLastCalledWith('source-accepted-value');
    await visibleText(canvasElement, 'Accepted source-cohort estimates');
    await visibleText(canvasElement, 'Unattributed');
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  },
};
export const BackendContracts: Story = {
  args: { canExport: false, canEdit: false },
  render: function BackendHost(args) {
    const [evidenceId, setEvidenceId] = useState('source-cohort');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const request = leadSourceReportRequest({ workspaceId: sourceBackendWorkspaceId, range: sourceBackendRange,
      evidenceId, page, pageSize, filters: sourceBackendEmptyFilters });
    const projection = adaptLeadSourceReportResponse(sourceBackendResponse(request, {
      canReadConversion: args.canReadConversion, canReadAcceptedValue: args.canReadAcceptedValue,
    }), {
      request, scopeKey: sourceBackendScopeKey, scope: 'workspace', archiveVisibility: 'included',
      canReadConversion: args.canReadConversion, canReadAcceptedValue: args.canReadAcceptedValue,
    });
    return <LeadSourceReport {...args} state={projection.state}
      onEvidence={id => { args.onEvidence(id); setEvidenceId(id); setPage(1); }}
      onPageChange={value => { args.onPageChange(value); setPage(value); }}
      onPageSizeChange={value => { args.onPageSizeChange(value); setPageSize(value); setPage(1); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), cards = summary(canvasElement);
    await expect(cards.getByRole('group', { name: copy.cohort })).toHaveTextContent('4');
    await expect(cards.getByRole('group', { name: copy.acceptedValue })).toHaveTextContent('$2,650.00');
    await visibleText(canvasElement, 'Source cohort leads');
    await selectMetricEvidence(canvasElement, copy.converted);
    await waitFor(() => expect(visibleRecordButtons(canvasElement)).toHaveLength(2));
    await userEvent.click(visibleRecordButtons(canvasElement)[0]!);
    await expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000000101');
    await selectMetricEvidence(canvasElement, copy.acceptedValue);
    await visibleText(canvasElement, 'Accepted source-cohort estimates');
    await visibleText(canvasElement, 'Unattributed');
    await expect(visibleRecordButtons(canvasElement)).toHaveLength(3);
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
    await selectMetricEvidence(canvasElement, copy.cohort);
    await waitFor(() => expect(visibleRecordButtons(canvasElement)).toHaveLength(4));
    await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  },
};
export const SourceReclassified: Story = { args: { state: { kind: 'ready', result: leadSourceResponse(relabelLeadSource('L1', 'referral')) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.cohort })).toHaveTextContent('4');
    await visibleText(canvasElement, '2');
    const website = sourceRow(canvasElement, 'Website');
    await expect(website.textContent).toContain('0');
    const referral = sourceRow(canvasElement, 'Referral');
    await expect(referral.textContent).toContain('2');
  } };
export const PermissionWithheld: Story = { args: { canReadConversion: false,
  state: { kind: 'ready', result: leadSourceResponse(leadSourceCohort, { canReadConversion: false }) } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: copy.cohort })).toHaveTextContent('4');
    await expect(c.getAllByText(copy.permission)).toHaveLength(2);
    await visibleText(canvasElement, 'Website');
    await visibleText(canvasElement, 'Unavailable');
    await expect(c.queryByRole('button', { name: `Actions: ${copy.converted}` })).not.toBeInTheDocument();
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeVisible();
    await expect(args.onEvidence).not.toHaveBeenCalled();
  } };
export const AccessRevokedWithStaleConversion: Story = { args: { canReadConversion: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByText('Surviving authorized linked Jobs')).not.toBeInTheDocument();
  await expect(c.queryByText('J-001 / created after period / canceled; still proves creation')).not.toBeInTheDocument();
  await expect(visibleRecordButtons(canvasElement)).toHaveLength(4);
} };
export const AcceptedValuePermissionWithheld: Story = { args: { canReadAcceptedValue: false,
  state: { kind: 'ready', result: leadSourceResponse(leadSourceCohort, { canReadAcceptedValue: false }) } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: copy.cohort })).toHaveTextContent('4');
    await expect(summary(canvasElement).getByRole('group', { name: copy.acceptedValue })).toHaveTextContent('Unavailable');
    await expect(c.getByText(copy.moneyPermission)).toBeVisible();
    await expect(c.queryByText('$1,250.00')).not.toBeInTheDocument();
    await expect(c.queryByRole('button', { name: `Actions: ${copy.acceptedValue}` })).not.toBeInTheDocument();
    await expect(args.onEvidence).not.toHaveBeenCalled();
  } };
export const AcceptedValueAccessRevokedWithStaleData: Story = { args: { canReadAcceptedValue: false },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: copy.cohort })).toHaveTextContent('4');
    await expect(c.queryByText('$1,250.00')).not.toBeInTheDocument();
    await expect(c.queryByText('Website project estimate')).not.toBeInTheDocument();
  } };
export const ConvertedEvidence: Story = { args: { state: { kind: 'ready', result: leadSourceResponse(leadSourceCohort, { kind: 'converted' }) } },
  play: async ({ canvasElement }) => {
    await expect(visibleRecordButtons(canvasElement)).toHaveLength(2);
    await visibleText(canvasElement, 'J-001 / created after period / canceled; still proves creation');
    await visibleText(canvasElement, 'J-003 / surviving linked Job');
  } };
export const MultipleJobsOneLead: Story = { args: { state: { kind: 'ready', result: {
  ...result, conversion: { kind: 'available', converted: 2 },
  groups: result.groups.map(group => group.source === 'website' ? { ...group, converted: 1 } : group),
  evidence: { kind: 'converted', rows: [
    { ...leadSourceCohort[0]!, linkedJobs: 'J-001 / canceled; J-004 / active' },
    { ...leadSourceCohort[2]!, linkedJobs: 'J-003 / active' },
  ] },
} } }, play: async ({ canvasElement }) => {
  await expect(summary(canvasElement).getByRole('group', { name: copy.converted })).toHaveTextContent('2');
  await expect(summary(canvasElement).getByRole('group', { name: copy.rate })).toHaveTextContent('50%');
  await visibleText(canvasElement, 'J-001 / canceled; J-004 / active');
} };
export const EmptyCohort: Story = { args: { state: { kind: 'ready', result: leadSourceResponse([]) } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(summary(canvasElement).getByRole('group', { name: copy.cohort })).toHaveTextContent('0');
  await expect(c.getByText(copy.empty)).toBeVisible();
  await expect(c.queryByText('0%', { exact: true })).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  await expect(c.getAllByRole('region', { name: 'Current recorded source' })
    .some(region => region.tagName === 'SECTION')).toBe(true);
} };
export const NoConversions: Story = { args: { state: { kind: 'ready', result: leadSourceResponse(leadSourceCohort.map(row => ({ ...row, converted: false })), { kind: 'converted' }) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.converted })).toHaveTextContent('0');
    await expect(summary(canvasElement).getByRole('group', { name: copy.rate })).toHaveTextContent('0%');
    await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  } };
export const Pagination: Story = {
  render: function Host(args) {
    const [kind, setKind] = useState<LeadSourceResult['evidence']['kind']>('cohort'), [page, setPage] = useState(1), [size, setSize] = useState(1);
    return <LeadSourceReport {...args} state={{ kind: 'ready', result: leadSourceResponse(leadSourceCohort, { kind, page, pageSize: size }) }}
      onEvidence={evidenceId => { args.onEvidence(evidenceId);
        setKind(evidenceId === 'source-converted' ? 'converted'
          : evidenceId === 'source-accepted-value' ? 'accepted-estimates' : 'cohort'); setPage(1); }}
      onPageChange={next => { args.onPageChange(next); setPage(next); }}
      onPageSizeChange={next => { args.onPageSizeChange(next); setSize(next); setPage(1); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View record: Referral inquiry' })).toBeVisible();
    await selectMetricEvidence(canvasElement, copy.converted);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'View record: Website inquiry' })).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
  },
};
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  await expect(c.queryByText('Website')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /^Actions:|^View record:|^Preview CSV$/ })) await expect(button).toBeDisabled();
  await expect(args.onEvidence).not.toHaveBeenCalled();
  await expect(args.onRecord).not.toHaveBeenCalled();
} };
export const NoExportAccess: Story = { args: { canExport: false }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: 'Preview CSV' });
  await expect(button).toBeDisabled(); await userEvent.click(button);
  await expect(args.onExport).not.toHaveBeenCalled();
} };
export const InvalidTotals: Story = { args: { state: { kind: 'ready', result: { ...result, cohort: 5 } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.invalid);
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const InvalidSourceGroups: Story = { args: { state: { kind: 'ready', result: { ...result, groups: result.groups.slice(1) } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.invalid); } };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.definition, copy.conversion, copy.money, copy.unattributed, copy.provenance, copy.archives])
    await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
