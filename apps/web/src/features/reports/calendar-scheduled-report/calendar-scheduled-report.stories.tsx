import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarScheduledReport } from './calendar-scheduled-report';
import { calendarScheduledResponse, calendarScheduledVisits, calendarWorkOrderOnlyVisits } from './calendar-scheduled-report.fixtures';
import { calendarScheduledReportData as copy } from './calendar-scheduled-report.data';
import type { CalendarScheduledResult } from './calendar-scheduled-report.validation';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';

const result = calendarScheduledResponse();
const meta = {
  title: 'Reports/CalendarScheduledReport', component: CalendarScheduledReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical current scheduled-visits report with C01/C03/C05/C06 mock-host fixtures. Counts explicit qualified visit identities, deduplicates participant membership, keeps person totals non-additive and uses Calendar’s four-visit busy person-day threshold. Exact inclusive visit-date ranges, not normalized week results; one evidence table switches between visits and busy person-days. Calendar and record access are independent. Sources are already authorized active records; no parent-Job access is inferred from Work Orders. Own scope withholds other participants/rosters and residual unassigned totals. Overlap, past-date review, unscheduled queues, workspace filters and production integration are later slices.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true, canOpenCalendar: true,
    onEvidence: fn(), onCalendar: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof CalendarScheduledReport>;
export default meta;
type Story = StoryObj<typeof meta>;
const summary = (element: HTMLElement) => within(within(element).getByRole('region', { name: 'Report summary' }));
async function visibleText(element: HTMLElement, text: string) {
  await expect(within(element).getAllByText(text).find(match => match.getBoundingClientRect().width > 0)).toBeVisible();
}
const invalid: Story['play'] = async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid);
  await expect(c.queryByRole('region', { name: 'Report summary' })).not.toBeInTheDocument();
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
};
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), s = summary(canvasElement);
  await expect(s.getByRole('group', { name: copy.visits })).toHaveTextContent('4');
  await expect(s.getByRole('group', { name: copy.busy })).toHaveTextContent('1');
  await expect(c.getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(4);
  await expect(c.getAllByRole('button', { name: /^View record:/ })).toHaveLength(6);
  await visibleText(canvasElement, 'Alex, Blair');
  await selectMetricEvidence(canvasElement, copy.busy);
  await expect(args.onEvidence).toHaveBeenLastCalledWith('busy-person-days');
  await userEvent.click(c.getByRole('button', { name: 'View Calendar: V1 / shared visit' }));
  await expect(args.onCalendar).toHaveBeenLastCalledWith({ date: '2026-11-05', weekDate: '2026-11-02', visitId: 'workspace-fixture:V1' });
  await userEvent.click(c.getByRole('button', { name: 'View record: WO-001 / shared Work Order' }));
  await expect(args.onRecord).toHaveBeenLastCalledWith('workspace-fixture:W1');
  await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
  await expect(args.onExport).toHaveBeenCalledTimes(1);
  await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  await expect(c.getByRole('region', { name: 'Supporting evidence' }).getBoundingClientRect().top)
    .toBeGreaterThanOrEqual(c.getByRole('region', { name: 'Report summary' }).getBoundingClientRect().bottom);
} };
export const BusyPersonDays: Story = { args: { state: { kind: 'ready', result: calendarScheduledResponse(undefined, { kind: 'busy-person-days' }) } },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(1);
    await expect(c.queryByRole('button', { name: /^View record:/ })).not.toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'View Calendar: Alex / 2026-11-05' }));
    await expect(args.onCalendar).toHaveBeenLastCalledWith({ date: '2026-11-05', weekDate: '2026-11-02', personId: 'alex' });
    await expect(summary(canvasElement).getByRole('group', { name: copy.visits })).toHaveTextContent('4');
  } };
export const EvidenceAndPagination: Story = {
  render: function Host(args) {
    const [kind, setKind] = useState<CalendarScheduledResult['evidence']['kind']>('visits'), [page, setPage] = useState(1), [size, setSize] = useState(1);
    return <CalendarScheduledReport {...args} state={{ kind: 'ready', result: calendarScheduledResponse(undefined, { kind, page, pageSize: size }) }}
      onEvidence={evidenceId => { args.onEvidence(evidenceId); setKind(evidenceId === 'busy-person-days' ? 'busy-person-days' : 'visits'); setPage(1); }}
      onPageChange={next => { args.onPageChange(next); setPage(next); }}
      onPageSizeChange={next => { args.onPageSizeChange(next); setSize(next); setPage(1); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View Calendar: V2 / separate Job visit' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: copy.visits })).toHaveTextContent('4');
    await selectMetricEvidence(canvasElement, copy.busy);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await expect(c.getByRole('button', { name: 'View Calendar: Alex / 2026-11-05' })).toBeVisible();
    await selectMetricEvidence(canvasElement, copy.visits);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  },
};
const secondWeek = calendarScheduledVisits[1]!;
export const AcrossCalendarWeeks: Story = { args: { state: { kind: 'ready', result: calendarScheduledResponse([...calendarScheduledVisits,
  { ...secondWeek, id: 'workspace-fixture:V5', label: 'V5 / next Calendar week', date: '2026-11-11',
    records: secondWeek.records.map(record => ({ ...record, id: `${record.id}:V5`, recordId: `${record.id}:V5` })) }]) } },
  play: async ({ canvasElement, args }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.visits })).toHaveTextContent('5');
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'View Calendar: V5 / next Calendar week' }));
    await expect(args.onCalendar).toHaveBeenLastCalledWith({ date: '2026-11-11', weekDate: '2026-11-09', visitId: 'workspace-fixture:V5' });
  } };
export const OwnScope: Story = { args: { state: { kind: 'ready', result: calendarScheduledResponse(undefined, { scope: { kind: 'own', viewerId: 'blair' } }) } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: copy.visits })).toHaveTextContent('1');
    await expect(c.getByText('Me', { exact: true, selector: 'span' })).toBeVisible();
    await expect(c.queryByText(/Alex|Blair/)).not.toBeInTheDocument();
    await expect(c.queryByText(new RegExp(copy.unassigned))).not.toBeInTheDocument();
  } };
const orders = calendarScheduledResponse(calendarWorkOrderOnlyVisits);
export const WorkOrderOnly: Story = { args: { state: { kind: 'ready', result: { ...orders, scopeLabel: 'Authorized Work Orders only' } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), evidence = within(c.getByRole('region', { name: 'Supporting evidence' }));
    await expect(summary(canvasElement).getByRole('group', { name: copy.visits })).toHaveTextContent('2');
    await expect(evidence.queryByText(/Job|Blair/)).not.toBeInTheDocument();
    await expect(c.queryByText('Blair', { exact: true })).not.toBeInTheDocument();
    await expect(c.getAllByRole('button', { name: /^View record:/ })).toHaveLength(3);
  } };
export const NoCalendarAccess: Story = { args: { canOpenCalendar: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^View Calendar:/ })).not.toBeInTheDocument();
  await expect(within(canvasElement).getAllByRole('button', { name: /^View record:/ })).toHaveLength(6);
} };
const noRecords = calendarScheduledResponse(calendarScheduledVisits.map(visit => ({ ...visit, records: visit.records.map(record => ({ ...record, recordId: undefined })) })));
export const NoRecordAccess: Story = { args: { state: { kind: 'ready', result: noRecords } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^View record:/ })).not.toBeInTheDocument();
  await expect(within(canvasElement).getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(4);
} };
export const NoEvidenceReferences: Story = { args: { state: { kind: 'ready', result: { ...result, evidenceIds: {} } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument();
} };
export const Empty: Story = { args: { state: { kind: 'ready', result: calendarScheduledResponse([]) } }, play: async ({ canvasElement }) => {
  await expect(summary(canvasElement).getByRole('group', { name: copy.visits })).toHaveTextContent('0');
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const NoBusyDays: Story = { args: { state: { kind: 'ready', result: calendarScheduledResponse(calendarScheduledVisits.slice(0, 3), { kind: 'busy-person-days' }) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.busy })).toHaveTextContent('0');
    await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  } };
const unassigned = { ...secondWeek, id: 'workspace-fixture:unassigned', label: 'Visit without authorized participant', participantIds: [],
  records: secondWeek.records.map(record => ({ ...record, id: `${record.id}:unassigned`, recordId: undefined })) };
export const NoAuthorizedParticipant: Story = { args: { state: { kind: 'ready', result: calendarScheduledResponse([unassigned]) } },
  play: async ({ canvasElement }) => { await visibleText(canvasElement, copy.unassigned); } };
export const InvalidAggregates: Story = { args: { state: { kind: 'ready', result: { ...result, counts: { visits: 6, busyPersonDays: 1 } } } }, play: invalid };
export const InvalidOwnRoster: Story = { args: { state: { kind: 'ready', result: { ...result, scope: { kind: 'own', viewerId: 'alex' } } } }, play: invalid };
const duplicate = calendarScheduledVisits[0]!;
export const DuplicateVisits: Story = { args: { state: { kind: 'ready', result: { ...result,
  evidence: { kind: 'visits', rows: [duplicate, duplicate, ...calendarScheduledVisits.slice(2)] } } } }, play: invalid };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  await expect(c.queryByText('Alex')).not.toBeInTheDocument();
} };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /^Actions:|^View Calendar:|^View record:|^Preview CSV$/ })) await expect(button).toBeDisabled();
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
  for (const text of [copy.definition, copy.sharing, copy.busyDefinition, copy.current]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
