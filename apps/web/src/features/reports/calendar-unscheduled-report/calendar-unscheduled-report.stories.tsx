import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarUnscheduledReport } from './calendar-unscheduled-report';
import { calendarUnscheduledResponse, calendarUnscheduledVisits, calendarUnscheduledWorkOrders } from './calendar-unscheduled-report.fixtures';
import { calendarUnscheduledReportData as copy } from './calendar-unscheduled-report.data';
import type { CalendarUnscheduledResult } from './calendar-unscheduled-report.validation';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';

const result = calendarUnscheduledResponse();
const meta = {
  title: 'Reports/CalendarUnscheduledReport', component: CalendarUnscheduledReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical current unscheduled queue report. C04: an explicitly shared Job and two Work Orders count as one visit, one Job and two Work Order records. Three callouts drive one evidence table with independent record-unit pagination; no visit-date filtering. Mock hosts exclude closed/archived records and retain authorized active draft Work Orders before counting. Qualified identity establishes sharing, not matching labels or crew. Own scope shows only Me; Work Order-only evidence contains no parent Job data. Calendar visit and record links are independently permitted; no scheduling action, production queries, routes or real CSV generation.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true, canOpenCalendar: true,
    onEvidence: fn(), onCalendar: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof CalendarUnscheduledReport>;
export default meta;
type Story = StoryObj<typeof meta>;
const summary = (element: HTMLElement) => within(within(element).getByRole('region', { name: 'Report summary' }));
async function visibleText(element: HTMLElement, text: string) {
  await expect(within(element).getAllByText(text).find(match => match.getBoundingClientRect().width > 0)).toBeVisible();
}
const invalid: Story['play'] = async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid);
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
};
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), s = summary(canvasElement);
  for (const [kind, value] of [['visits', '1'], ['jobs', '1'], ['workOrders', '2']] as const)
    await expect(s.getByRole('group', { name: copy.labels[kind] })).toHaveTextContent(value);
  await expect(c.getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(1);
  await expect(c.getAllByRole('button', { name: /^View record:/ })).toHaveLength(3);
  await visibleText(canvasElement, 'Alex, Blair');
  await selectMetricEvidence(canvasElement, copy.labels.jobs);
  await expect(args.onEvidence).toHaveBeenLastCalledWith('unscheduled-jobs');
  await userEvent.click(c.getByRole('button', { name: 'View Calendar: U1 / explicitly shared unscheduled visit' }));
  await expect(args.onCalendar).toHaveBeenLastCalledWith({ kind: 'unscheduled', visitId: 'workspace-fixture:U1' });
  await userEvent.click(c.getByRole('button', { name: 'View record: WO-001 / active Work Order' }));
  await expect(args.onRecord).toHaveBeenLastCalledWith('workspace-fixture:W1');
  await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
  await expect(args.onExport).toHaveBeenCalledTimes(1);
  await expect(c.queryByRole('button', { name: /^Schedule/ })).not.toBeInTheDocument();
  await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  await expect(c.getByRole('region', { name: 'Supporting evidence' }).getBoundingClientRect().top)
    .toBeGreaterThanOrEqual(c.getByRole('region', { name: 'Report summary' }).getBoundingClientRect().bottom);
} };
export const JobRecords: Story = { args: { state: { kind: 'ready', result: calendarUnscheduledResponse(undefined, { kind: 'jobs' }) } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('button', { name: /^View record:/ })).toHaveLength(1);
    await expect(c.getByRole('button', { name: 'View record: J-001 / active Job' })).toBeVisible();
    await expect(c.queryByRole('button', { name: 'View record: WO-001 / active Work Order' })).not.toBeInTheDocument();
  } };
export const WorkOrderRecords: Story = { args: { state: { kind: 'ready', result: calendarUnscheduledResponse(undefined, { kind: 'workOrders' }) } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('button', { name: /^View record:/ })).toHaveLength(2);
    await expect(within(canvasElement).queryByRole('button', { name: 'View record: J-001 / active Job' })).not.toBeInTheDocument();
  } };
export const EvidenceAndPagination: Story = {
  render: function Host(args) {
    const [kind, setKind] = useState<CalendarUnscheduledResult['evidence']['kind']>('workOrders'), [page, setPage] = useState(1), [size, setSize] = useState(1);
    return <CalendarUnscheduledReport {...args} state={{ kind: 'ready', result: calendarUnscheduledResponse(undefined, { kind, page, pageSize: size }) }}
      onEvidence={evidenceId => { args.onEvidence(evidenceId); setKind(evidenceId === 'unscheduled-visits' ? 'visits' : evidenceId === 'unscheduled-jobs' ? 'jobs' : 'workOrders'); setPage(1); }}
      onPageChange={next => { args.onPageChange(next); setPage(next); }}
      onPageSizeChange={next => { args.onPageSizeChange(next); setSize(next); setPage(1); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View record: WO-002 / active Work Order' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: copy.labels.visits })).toHaveTextContent('1');
    await selectMetricEvidence(canvasElement, copy.labels.jobs);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'View record: J-001 / active Job' })).toBeVisible();
    await selectMetricEvidence(canvasElement, copy.labels.workOrders);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await selectMetricEvidence(canvasElement, copy.labels.visits);
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  },
};
export const OwnScope: Story = { args: { state: { kind: 'ready', result: calendarUnscheduledResponse(undefined, { scope: { kind: 'own', viewerId: 'blair' } }) } },
  play: async ({ canvasElement }) => {
    await visibleText(canvasElement, 'Me');
    await expect(within(canvasElement).queryByText(/Alex|Blair|No authorized participant/)).not.toBeInTheDocument();
  } };
export const WorkOrderOnly: Story = { args: { state: { kind: 'ready', result: {
  ...calendarUnscheduledResponse(calendarUnscheduledWorkOrders, { kind: 'workOrders' }), scopeLabel: 'Authorized Work Orders only' } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), evidence = within(c.getByRole('region', { name: 'Supporting evidence' }));
    await expect(summary(canvasElement).getByRole('group', { name: copy.labels.jobs })).toHaveTextContent('0');
    await expect(evidence.queryByText(/Job|Blair/)).not.toBeInTheDocument();
    await expect(c.getAllByRole('button', { name: /^View record:/ })).toHaveLength(2);
  } };
export const AuthorizedDrafts: Story = { args: { state: { kind: 'ready', result: calendarUnscheduledResponse(calendarUnscheduledWorkOrders.map(visit => ({
  ...visit, records: visit.records.map(record => ({ ...record, status: 'draft' })) })), { kind: 'workOrders' }) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.labels.workOrders })).toHaveTextContent('2');
    await visibleText(canvasElement, 'Work Order / WO-001 / active Work Order / draft');
  } };
export const NoCalendarAccess: Story = { args: { canOpenCalendar: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^View Calendar:/ })).not.toBeInTheDocument();
  await expect(within(canvasElement).getAllByRole('button', { name: /^View record:/ })).toHaveLength(3);
} };
export const NoRecordAccess: Story = { args: { state: { kind: 'ready', result: calendarUnscheduledResponse(calendarUnscheduledVisits.map(visit => ({
  ...visit, records: visit.records.map(record => ({ ...record, recordId: undefined })) }))) } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^View record:/ })).not.toBeInTheDocument();
  await expect(within(canvasElement).getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(1);
} };
export const NoEvidenceReferences: Story = { args: { state: { kind: 'ready', result: { ...result, evidenceIds: {} } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument();
} };
export const Empty: Story = { args: { state: { kind: 'ready', result: calendarUnscheduledResponse([]) } }, play: async ({ canvasElement }) => {
  await expect(summary(canvasElement).getByRole('group', { name: copy.labels.visits })).toHaveTextContent('0');
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const NoAuthorizedParticipant: Story = { args: { state: { kind: 'ready', result: calendarUnscheduledResponse(calendarUnscheduledVisits.map(visit => ({
  ...visit, participantIds: [] }))) } }, play: async ({ canvasElement }) => { await visibleText(canvasElement, 'No authorized participant'); } };
export const InvalidUnits: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { visits: 3, jobs: 1, workOrders: 2 } } } }, play: invalid };
export const InvalidOwnScope: Story = { args: { state: { kind: 'ready', result: { ...result, scope: { kind: 'own', viewerId: 'alex' } } } }, play: invalid };
export const ClosedRecord: Story = { args: { state: { kind: 'ready', result: { ...result,
  visits: result.visits.map(visit => ({ ...visit, records: visit.records.map(record => ({ ...record, status: 'completed' })) })) } } }, play: invalid };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  await expect(c.queryByText('U1 / explicitly shared unscheduled visit')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  for (const button of within(canvasElement).getAllByRole('button', { name: /^Actions:|^View Calendar:|^View record:|^Preview CSV$/ })) await expect(button).toBeDisabled();
  await expect(args.onCalendar).not.toHaveBeenCalled();
  await expect(args.onRecord).not.toHaveBeenCalled();
} };
export const NoExportAccess: Story = { args: { canExport: false }, play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: 'Preview CSV' });
  await expect(button).toBeDisabled(); await userEvent.click(button);
  await expect(args.onExport).not.toHaveBeenCalled();
} };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.definition, copy.units, copy.active, copy.access]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
