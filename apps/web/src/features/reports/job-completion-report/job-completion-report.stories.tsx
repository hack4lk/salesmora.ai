import { useState } from 'react';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { addCalendarDays } from '@salesmora/domain';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { JobCompletionReport } from './job-completion-report';
import type { JobCompletionResult } from './job-completion-report.validation';
import { jobCompletionReportData as copy } from './job-completion-report.data';
import { formatReportDate } from '../report-date-controls/report-date-controls.validation';

const rows = [
  { id: 'job-a', recordId: 'job-a', label: 'Job A / subsequently reopened', createdDate: '2026-09-30', completionDate: '2026-10-10', cells: { status: 'Active', owner: 'Teammate A' } },
  { id: 'job-b', recordId: 'job-b', label: 'Job B', createdDate: '2026-10-02', completionDate: '2026-10-07', cells: { status: 'Completed', owner: 'Teammate B' } },
];
const result: JobCompletionResult = {
  from: '2026-10-01', to: '2026-10-31', periodLabel: 'Oct 1 to Oct 31, 2026, both dates included',
  snapshotLabel: 'Nov 5, 2026 at 10:00 / Europe/Warsaw', scopeLabel: 'All authorized Jobs and recorded completion evidence.',
  total: 2, coverage: { kind: 'complete' }, duration: { sampleSize: 2, totalElapsedDays: 15 }, evidenceId: 'completed',
  days: Array.from({ length: 31 }, (_, i) => { const date = addCalendarDays('2026-10-01', i); return {
    date, count: rows.filter(row => row.completionDate === date).length, evidenceId: `day:${date}`,
  }; }), rows, page: 1, pageSize: 25,
};
const meta = {
  title: 'Reports/JobCompletionReport', component: JobCompletionReport, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Canonical completion detail with three summary cards above static Monday-Sunday month calendars and supporting evidence. All period months render without navigation; dates outside the range are muted. Fictional host-selected latest-period events match discovery J02-J04: Oct 7 and Oct 10, durations 5 and 10 local calendar days, average 7.5/sample 2. Selecting a day subsets the enclosing period selection, never reselects events. Hosts own deterministic event selection, same-snapshot sums/counts, coverage, pagination and record/CSV dialogs. Null creation evidence has explicit missing coverage; invalid chronology is rejected. No database API or production route.' } } },
  decorators: [Story => <main className="bg-canvas p-4 sm:p-8"><div className="mx-auto max-w-7xl"><Story /></div></main>],
  args: { state: { kind: 'ready', result }, canRead: true, canExport: true, canEdit: true,
    onEvidence: fn(), onRecord: fn(), onExport: fn(), onPageChange: fn(), onPageSizeChange: fn(), onRetry: fn(), onEdit: fn() },
} satisfies Meta<typeof JobCompletionReport>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [selectedDate, select] = useState<string>();
    return <JobCompletionReport {...args} state={{ kind: 'ready', result: { ...result, selectedDate,
      rows: rows.filter(row => !selectedDate || row.completionDate === selectedDate) } }}
      onEvidence={id => { args.onEvidence(id); select(id.startsWith('day:') ? id.slice(4) : undefined); }} />;
  },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement), summary = within(c.getByRole('region', { name: 'Report summary' }));
    await expect(summary.getByRole('group', { name: 'Average elapsed calendar days' })).toHaveTextContent('7.5 days');
    await expect(summary.getByRole('group', { name: 'Elapsed-day sample size' })).toHaveTextContent('2');
    await expect(c.queryByRole('meter', { hidden: true })).not.toBeInTheDocument();
    const calendar = c.getByRole('region', { name: 'Completion calendar' });
    await expect(summary.getByRole('group', { name: 'Elapsed-day sample size' }).getBoundingClientRect().bottom).toBeLessThan(calendar.getBoundingClientRect().top);
    await expect(within(calendar).getByRole('table', { name: 'October 2026' })).toBeVisible();
    await expect(within(calendar).getAllByRole('button', { name: /View supporting evidence:/ })).toHaveLength(31);
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: 10 Oct 2026' }));
    await expect(args.onEvidence).toHaveBeenLastCalledWith('day:2026-10-10');
    await expect(c.getByRole('button', { name: 'View supporting evidence: 10 Oct 2026' })).toHaveAttribute('aria-pressed', 'true');
    await expect(c.queryByRole('button', { name: 'View record: Job B' })).not.toBeInTheDocument();
    await expect(summary.getByRole('group', { name: 'Average elapsed calendar days' })).toHaveTextContent('7.5 days');
    await userEvent.click(c.getByRole('button', { name: 'View record: Job A / subsequently reopened' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('job-a');
    await userEvent.click(c.getByRole('button', { name: 'Preview CSV' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await userEvent.click(c.getByRole('button', { name: 'View supporting evidence: 3 Oct 2026' }));
    await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
    await selectMetricEvidence(canvasElement, 'Completed Jobs');
  },
};
export const Empty: Story = { args: { state: { kind: 'ready', result: { ...result, total: 0, rows: [], duration: { sampleSize: 0, totalElapsedDays: 0 },
  days: result.days.map(day => ({ ...day, count: 0 })) } } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.empty)).toBeVisible();
  await expect(c.queryByText('0 days', { exact: true })).not.toBeInTheDocument();
} };
export const SameDay: Story = { args: { state: { kind: 'ready', result: { ...result, total: 1, duration: { sampleSize: 1, totalElapsedDays: 0 },
  rows: [{ ...rows[0]!, createdDate: '2026-10-10' }], days: result.days.map(day => ({ ...day, count: day.date === '2026-10-10' ? 1 : 0 })) } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('group', { name: 'Average elapsed calendar days' })).toHaveTextContent('0 days'); } };
export const IncompleteDuration: Story = { args: { state: { kind: 'ready', result: { ...result,
  duration: { sampleSize: 1, totalElapsedDays: 10, explanation: 'One authorized Job is missing creation-date evidence.' },
  rows: [rows[0]!, { ...rows[1]!, createdDate: null }],
} } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('group', { name: 'Average elapsed calendar days' })).toHaveTextContent('10 days');
  await expect(within(canvasElement).getAllByText(/One authorized Job is missing creation-date evidence/)).toHaveLength(2);
} };
export const NoDurationSamples: Story = { args: { state: { kind: 'ready', result: { ...result,
  duration: { sampleSize: 0, totalElapsedDays: 0, explanation: 'Creation-date evidence is missing for both authorized Jobs.' },
  rows: rows.map(row => ({ ...row, createdDate: null })),
} } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.empty)).toBeVisible();
} };
export const IncompleteCompletionHistory: Story = { args: { state: { kind: 'ready', result: { ...result,
  coverage: { kind: 'partial', explanation: 'Some authorized historical completion events are missing.' },
} } } };
export const InvalidChronology: Story = { args: { state: { kind: 'ready', result: { ...result, rows: [{ ...rows[0]!, createdDate: '2026-10-11' }, rows[1]!] } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toBeVisible(); } };
export const InvalidAverageSum: Story = { args: { state: { kind: 'ready', result: { ...result, duration: { sampleSize: 2, totalElapsedDays: 16 } } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toBeVisible(); } };
export const MissingZeroDay: Story = { args: { state: { kind: 'ready', result: { ...result, days: result.days.slice(1) } } },
  play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toBeVisible(); } };
export const Loading: Story = { args: { state: { kind: 'loading' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: { kind: 'error' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retry report' }));
  await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('group')).not.toBeInTheDocument();
} };
export const ExportDenied: Story = { args: { canExport: false }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button', { name: /Actions:|View supporting evidence:/ })) await expect(button).toBeDisabled();
  await expect(c.getByRole('button', { name: 'Preview CSV' })).toBeDisabled();
} };
export const Help: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.help });
  trigger.focus(); await userEvent.keyboard('{Enter}');
  const dialog = await body.findByRole('dialog', { name: copy.help });
  await waitFor(() => expect(dialog).toBeVisible());
  for (const text of [copy.selection, copy.trend, copy.duration]) await expect(within(dialog).getByText(text)).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
} };
export const MultipleStaticMonths: Story = { args: { state: { kind: 'ready', result: { ...result,
  from: '2026-09-28', to: '2026-11-02', periodLabel: 'Sep 28 to Nov 2, 2026, both dates included',
  days: Array.from({ length: 36 }, (_, i) => {
    const date = addCalendarDays('2026-09-28', i);
    return { date, count: rows.filter(row => row.completionDate === date).length, evidenceId: `day:${date}` };
  }),
} } }, play: async ({ canvasElement }) => {
  const calendar = within(within(canvasElement).getByRole('region', { name: 'Completion calendar' }));
  for (const month of ['September 2026', 'October 2026', 'November 2026']) await expect(calendar.getByRole('table', { name: month })).toBeVisible();
  await expect(calendar.getAllByRole('button')).toHaveLength(37);
  await expect(calendar.queryByRole('button', { name: 'View supporting evidence: 27 Sep 2026' })).not.toBeInTheDocument();
  await expect(calendar.getByLabelText(`${formatReportDate('2026-09-27')}: outside reporting period`)).toBeVisible();
  const thursday = calendar.getByRole('button', { name: 'View supporting evidence: 1 Oct 2026' }).closest('td');
  await expect(thursday?.cellIndex).toBe(3);
} };
export const CalendarKeyboard: Story = { play: async ({ canvasElement, args }) => {
  const trigger = within(canvasElement).getByRole('button', { name: 'View supporting evidence: 7 Oct 2026' });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onEvidence).toHaveBeenLastCalledWith('day:2026-10-07');
} };
export const DayColors: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: 'View supporting evidence: 7 Oct 2026' })).toHaveClass('bg-blue-100');
  await expect(c.getByRole('button', { name: 'View supporting evidence: 10 Oct 2026' })).toHaveClass('bg-blue-100');
  await expect(c.getByRole('button', { name: 'View supporting evidence: 3 Oct 2026' })).toHaveClass('bg-gray-100');
} };
export const ReadOnlyDayColors: Story = { args: { state: { kind: 'ready', result: { ...result,
  days: result.days.map(day => ({ ...day, evidenceId: undefined })),
} } }, play: async ({ canvasElement }) => {
  const calendar = within(within(canvasElement).getByRole('region', { name: 'Completion calendar' }));
  await expect(calendar.getByLabelText('7 Oct 2026: 1 completed Jobs')).toHaveClass('bg-blue-100');
  await expect(calendar.getByLabelText('3 Oct 2026: 0 completed Jobs')).toHaveClass('bg-gray-100');
} };
