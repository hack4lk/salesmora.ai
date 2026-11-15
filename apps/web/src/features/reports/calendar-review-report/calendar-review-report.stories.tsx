import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CalendarReviewReport } from './calendar-review-report';
import { calendarReviewResponse, calendarReviewVisits, calendarReviewWorkOrders } from './calendar-review-report.fixtures';
import { calendarReviewReportData as copy } from './calendar-review-report.data';
import type { CalendarReviewResult } from './calendar-review-report.validation';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';

const result = calendarReviewResponse();
const meta = {
  title: 'Reports/CalendarReviewReport', component: CalendarReviewReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical current schedule review, with one table for per-person overlapping visit pairs or distinct past-date visits. Approved C02 fixture has one Alex V1/V2 pair; V2/V3 are adjacent, V4 has an unknown window. Date ranges stay exact; past means strictly before business-local today on authorized active records, never missed attendance. Pair order is irrelevant; explicit shared visit/crew membership is deduplicated. Hosts authorize/filter the full snapshot before counting/paging. Missing windows are disclosed, not classified as free time. Own and Work Order scopes withhold hidden participants/parent Job data. Calendar links and record references are independent; no rescheduling action, production queries, routes or real CSV generation.' } } },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-6xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true, canOpenCalendar: true,
    onEvidence: fn(), onCalendar: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof CalendarReviewReport>;
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
  await expect(s.getByRole('group', { name: copy.overlaps })).toHaveTextContent('1');
  await expect(s.getByRole('group', { name: copy.past })).toHaveTextContent('4');
  await expect(c.queryByText(/authorized scheduled visits have no arrival window/)).not.toBeInTheDocument();
  await expect(c.queryByText(copy.unknown)).not.toBeInTheDocument();
  await expect(c.queryByText(copy.review)).not.toBeInTheDocument();
  await expect(c.getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(2);
  await expect(c.queryByRole('button', { name: 'View Calendar: V3 / separate Work Order visit' })).not.toBeInTheDocument();
  await selectMetricEvidence(canvasElement, copy.past);
  await expect(args.onEvidence).toHaveBeenLastCalledWith('past-visits');
  await userEvent.click(c.getByRole('button', { name: 'View Calendar: V1 / shared visit' }));
  await expect(args.onCalendar).toHaveBeenLastCalledWith({ date: '2026-11-05', weekDate: '2026-11-02', visitId: 'workspace-fixture:V1' });
  await userEvent.click(c.getByRole('button', { name: 'View record: WO-001 / shared Work Order' }));
  await expect(args.onRecord).toHaveBeenLastCalledWith('workspace-fixture:W1');
  await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
  await expect(args.onExport).toHaveBeenCalledTimes(1);
  await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
} };
export const PastScheduledVisits: Story = { args: { state: { kind: 'ready', result: calendarReviewResponse(undefined, { kind: 'past' }) } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(4);
    await expect(c.getAllByRole('button', { name: /^View record:/ })).toHaveLength(6);
    await visibleText(canvasElement, 'Unknown arrival window');
    await visibleText(canvasElement, 'Past scheduled date / review current schedule; attendance unknown');
    await expect(c.queryByText(copy.review)).not.toBeInTheDocument();
  } };
export const EvidenceAndPagination: Story = {
  render: function Host(args) {
    const [kind, setKind] = useState<CalendarReviewResult['evidence']['kind']>('past'), [page, setPage] = useState(1), [size, setSize] = useState(1);
    return <CalendarReviewReport {...args} state={{ kind: 'ready', result: calendarReviewResponse(undefined, { kind, page, pageSize: size }) }}
      onEvidence={evidenceId => { args.onEvidence(evidenceId); setKind(evidenceId === 'past-visits' ? 'past' : 'overlaps'); setPage(1); }}
      onPageChange={next => { args.onPageChange(next); setPage(next); }}
      onPageSizeChange={next => { args.onPageSizeChange(next); setSize(next); setPage(1); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(c.getByRole('button', { name: 'View Calendar: V2 / separate Job visit' })).toBeVisible();
    await expect(summary(canvasElement).getByRole('group', { name: copy.past })).toHaveTextContent('4');
    await selectMetricEvidence(canvasElement, copy.overlaps);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await expect(c.getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(2);
    await selectMetricEvidence(canvasElement, copy.past);
    await userEvent.click(c.getByRole('button', { name: 'Go to next page' }));
    await userEvent.selectOptions(c.getByRole('combobox', { name: 'Rows per page' }), '25');
    await expect(args.onPageSizeChange).toHaveBeenLastCalledWith(25);
    await expect(c.getByRole('button', { name: 'Current page, 1' })).toBeVisible();
    await expect(c.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
  },
};
export const TodayIsNotPast: Story = { args: { state: { kind: 'ready', result: calendarReviewResponse(undefined, { kind: 'past', today: '2026-11-05' }) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.past })).toHaveTextContent('0');
    await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
  } };
export const AcrossCalendarWeeks: Story = { args: { state: { kind: 'ready',
  result: calendarReviewResponse(calendarReviewVisits.slice(0, 2).map((visit, index) => index ? { ...visit, date: '2026-11-11' } : visit),
    { kind: 'past', today: '2026-11-12', from: '2026-11-05', to: '2026-11-11' }) } },
  play: async ({ canvasElement, args }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.past })).toHaveTextContent('2');
    await expect(summary(canvasElement).getByRole('group', { name: copy.overlaps })).toHaveTextContent('0');
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'View Calendar: V2 / separate Job visit' }));
    await expect(args.onCalendar).toHaveBeenLastCalledWith({ date: '2026-11-11', weekDate: '2026-11-09', visitId: 'workspace-fixture:V2' });
  } };
export const UnknownWindows: Story = { args: { state: { kind: 'ready',
  result: calendarReviewResponse(calendarReviewVisits.map(visit => ({ ...visit, arrivalWindow: null }))) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.overlaps })).toHaveTextContent('0');
    await expect(within(canvasElement).queryByText(/authorized scheduled visits have no arrival window/)).not.toBeInTheDocument();
    await expect(within(canvasElement).queryByText(copy.unknown)).not.toBeInTheDocument();
  } };
export const SharedPairPerPerson: Story = { args: { state: { kind: 'ready',
  result: calendarReviewResponse(calendarReviewVisits.map(visit => ({ ...visit, participantIds: ['alex', 'blair', 'alex'] }))) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.overlaps })).toHaveTextContent('2');
    await expect(within(canvasElement).getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(4);
    await visibleText(canvasElement, 'Blair');
  } };
export const OwnScope: Story = { args: { state: { kind: 'ready', result: calendarReviewResponse(undefined, { scope: { kind: 'own', viewerId: 'alex' } }) } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await visibleText(canvasElement, 'Me');
    await expect(c.queryByText(/Alex|Blair/)).not.toBeInTheDocument();
    await expect(summary(canvasElement).getByRole('group', { name: copy.overlaps })).toHaveTextContent('1');
  } };
export const OwnPastVisits: Story = { args: { state: { kind: 'ready',
  result: calendarReviewResponse(undefined, { kind: 'past', scope: { kind: 'own', viewerId: 'blair' } }) } },
  play: async ({ canvasElement }) => {
    await expect(summary(canvasElement).getByRole('group', { name: copy.past })).toHaveTextContent('1');
    await expect(within(canvasElement).queryByText(/Alex|Blair/)).not.toBeInTheDocument();
  } };
export const WorkOrderOnly: Story = { args: { state: { kind: 'ready', result: {
  ...calendarReviewResponse(calendarReviewWorkOrders, { kind: 'past' }), scopeLabel: 'Authorized Work Orders only' } } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), evidence = within(c.getByRole('region', { name: 'Supporting evidence' }));
    await expect(summary(canvasElement).getByRole('group', { name: copy.past })).toHaveTextContent('2');
    await expect(evidence.queryByText(/Job|Blair/)).not.toBeInTheDocument();
    await expect(c.getAllByRole('button', { name: /^View record:/ })).toHaveLength(3);
  } };
export const NoCalendarAccess: Story = { args: { canOpenCalendar: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^View Calendar:/ })).not.toBeInTheDocument();
  await expect(within(canvasElement).getAllByRole('button', { name: /^View record:/ })).toHaveLength(4);
} };
export const NoRecordAccess: Story = { args: { state: { kind: 'ready', result: calendarReviewResponse(calendarReviewVisits.map(visit => ({
  ...visit, records: visit.records.map(record => ({ ...record, recordId: undefined })) }))) } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^View record:/ })).not.toBeInTheDocument();
  await expect(within(canvasElement).getAllByRole('button', { name: /^View Calendar:/ })).toHaveLength(2);
} };
export const Empty: Story = { args: { state: { kind: 'ready', result: calendarReviewResponse([]) } }, play: async ({ canvasElement }) => {
  await expect(summary(canvasElement).getByRole('group', { name: copy.overlaps })).toHaveTextContent('0');
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const NoEvidenceReferences: Story = { args: { state: { kind: 'ready', result: { ...result, evidenceIds: {} } } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument();
} };
export const InvalidPair: Story = { args: { state: { kind: 'ready', result: { ...result,
  evidence: { kind: 'overlaps', rows: [{ personId: 'blair', leftVisitId: 'workspace-fixture:V1', rightVisitId: 'workspace-fixture:V2' }] } } } }, play: invalid };
export const InvalidOwnScope: Story = { args: { state: { kind: 'ready', result: { ...result, scope: { kind: 'own', viewerId: 'alex' } } } }, play: invalid };
export const InvalidPastDate: Story = { args: { state: { kind: 'ready',
  result: { ...calendarReviewResponse(undefined, { kind: 'past' }), today: '2026-11-05' } } }, play: invalid };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toBeVisible();
  await expect(c.queryByRole('region', { name: 'Supporting evidence' })).not.toBeInTheDocument();
  await expect(c.queryByText('V1 / shared visit')).not.toBeInTheDocument();
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
  for (const text of [copy.overlapDefinition, copy.pastDefinition, copy.unknown, copy.review]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
