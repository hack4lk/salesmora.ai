import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ReportDateControls, type ReportDateControlsProps } from './report-date-controls';
import { reportDateControlsData as copy } from './report-date-controls.data';

function Preview(args: ReportDateControlsProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8">
    <p className="mb-6 mt-0 text-sm text-muted">Component review. Fictional workspace date; no report data or API requests.</p>
    <ReportDateControls {...args} value={value} onApply={next => { args.onApply(next); setValue(next); }} />
  </main>;
}
const meta = {
  title: 'Reports/ReportDateControls',
  component: ReportDateControls,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Compact report period controls, limited to date selection and Apply/Cancel. The host supplies today in the workspace timezone and owns applied selection, authorized queries, server instant boundaries and query errors. Render outside other forms. Metric date definitions and current-state explanations belong beside results, not in this component. Relative presets store only their name; custom dates remain fixed.' } } },
  render: args => <Preview {...args} />,
  args: {
    value: { preset: 'last30days' }, context: 'history', today: '2026-11-05', timezone: 'Europe/Warsaw', onApply: fn(),
  },
} satisfies Meta<typeof ReportDateControls>;
export default meta;
type Story = StoryObj<typeof meta>;

async function checkPeriodHelp(canvasElement: HTMLElement, count: number) {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = c.getByRole('button', { name: copy.periodHelp });
  await expect(c.queryByText(copy.count(count))).not.toBeInTheDocument();
  await userEvent.click(trigger);
  const dialog = await body.findByRole('dialog', { name: copy.periodHelp });
  await expect(dialog).toHaveTextContent(copy.count(count));
  await expect(dialog).toHaveTextContent(copy.help);
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
}

export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent('7 Oct 2026 to 5 Nov 2026');
  await checkPeriodHelp(canvasElement, 30);
  await expect(c.queryByLabelText(copy.from)).not.toBeInTheDocument();
  await expect(c.getAllByRole('region')).toHaveLength(1);
  const region = c.getByRole('region', { name: copy.title });
  const bounds = region.getBoundingClientRect();
  const parent = region.parentElement!;
  const style = getComputedStyle(parent);
  const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  expect(Math.abs(bounds.width - available)).toBeLessThan(1);
  expect(bounds.height).toBeLessThan(220);
  await expect(c.queryByRole('heading', { name: 'Date basis, per metric' })).not.toBeInTheDocument();
  await expect(c.queryByRole('heading', { name: 'As of now' })).not.toBeInTheDocument();
} };
export const Calendar: Story = { args: {
  context: 'calendar', value: { preset: 'next7days' },
}, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent('5 Nov 2026 to 11 Nov 2026');
  await checkPeriodHelp(canvasElement, 7);
} };
export const ApplyAndCancel: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), status = c.getByRole('status');
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.range }), 'custom');
  await userEvent.clear(c.getByLabelText(copy.from, { exact: false }));
  await userEvent.type(c.getByLabelText(copy.from, { exact: false }), '2026-10-01');
  await expect(status).toHaveTextContent('7 Oct 2026 to 5 Nov 2026');
  await expect(args.onApply).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: copy.cancel }));
  await expect(c.getByRole('combobox')).toHaveValue('last30days');
  await userEvent.selectOptions(c.getByRole('combobox'), 'custom');
  await userEvent.clear(c.getByLabelText(copy.from, { exact: false }));
  await userEvent.type(c.getByLabelText(copy.from, { exact: false }), '2026-10-01');
  await userEvent.click(c.getByRole('button', { name: copy.apply }));
  await expect(args.onApply).toHaveBeenLastCalledWith({ preset: 'custom', from: '2026-10-01', to: '2026-11-05' });
  await expect(status).toHaveTextContent('1 Oct 2026 to 5 Nov 2026');
  await checkPeriodHelp(canvasElement, 36);
} };
export const MissingDates: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox'), 'custom');
  await userEvent.clear(c.getByLabelText(copy.from, { exact: false }));
  await userEvent.click(c.getByRole('button', { name: copy.apply }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.errors.missing);
  await expect(c.getByLabelText(copy.from, { exact: false })).toHaveFocus();
  await expect(args.onApply).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: copy.cancel }));
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
} };
export const ReversedDates: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox'), 'custom');
  await userEvent.clear(c.getByLabelText(copy.to, { exact: false }));
  await userEvent.type(c.getByLabelText(copy.to, { exact: false }), '2026-10-01');
  await userEvent.click(c.getByRole('button', { name: copy.apply }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.errors.order);
  await expect(c.getByLabelText(copy.to, { exact: false })).toHaveFocus();
  await expect(args.onApply).not.toHaveBeenCalled();
} };
export const MaximumRange: Story = { args: { value: { preset: 'custom', from: '2024-01-01', to: '2024-12-31' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await checkPeriodHelp(canvasElement, 366);
  await userEvent.click(c.getByRole('button', { name: copy.apply }));
  await expect(args.onApply).toHaveBeenCalledWith(args.value);
} };
export const RangeTooLong: Story = { args: MaximumRange.args, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.clear(c.getByLabelText(copy.to, { exact: false }));
  await userEvent.type(c.getByLabelText(copy.to, { exact: false }), '2025-01-01');
  await userEvent.click(c.getByRole('button', { name: copy.apply }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.errors.tooLong);
  await checkPeriodHelp(canvasElement, 366);
  await expect(args.onApply).not.toHaveBeenCalled();
} };
export const SingleDay: Story = { args: { value: { preset: 'custom', from: '2026-03-29', to: '2026-03-29' } }, play: async ({ canvasElement }) => {
  await checkPeriodHelp(canvasElement, 1);
} };
export const Pending: Story = { args: { pending: true, value: { preset: 'custom', from: '2026-10-01', to: '2026-11-05' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.apply })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled();
  await checkPeriodHelp(canvasElement, 36);
  await expect(c.getByRole('combobox')).toBeDisabled();
  await expect(c.getByLabelText(copy.from, { exact: false })).toBeDisabled();
  await expect(c.getByLabelText(copy.to, { exact: false })).toBeDisabled();
  await expect(args.onApply).not.toHaveBeenCalled();
} };
export const InvalidWorkspaceContext: Story = { args: { timezone: 'Invalid/Timezone' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.errors.context);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const InvalidAppliedRange: Story = { args: { value: { preset: 'custom', from: '2026-02-29', to: '2026-03-01' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.errors.invalid);
} };
export const KeyboardApply: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  const trigger = c.getByRole('button', { name: copy.periodHelp });
  trigger.focus();
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  const body = within(canvasElement.ownerDocument.body);
  await expect(await body.findByRole('dialog', { name: copy.periodHelp })).toHaveTextContent(copy.count(30));
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.tab();
  await expect(c.getByRole('combobox')).toHaveFocus();
  await userEvent.tab();
  await expect(c.getByRole('button', { name: copy.apply })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onApply).toHaveBeenCalledWith({ preset: 'last30days' });
} };
export const Narrow: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
