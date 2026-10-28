import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { getPresetRange } from '../gantt-timeline';
import { GanttDateRange, type GanttDateRangeProps } from './gantt-date-range';
import { ganttDateRangeData as copy } from './gantt-date-range.data';

function Preview({ onChange, ...args }: GanttDateRangeProps) {
  const [value, setValue] = useState(args.value);
  return (
    <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
      <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
      <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
      <GanttDateRange {...args} value={value} onChange={(range) => { onChange(range); setValue(range); }} />
    </main>
  );
}

const meta = {
  title: 'Gantt Chart/GanttDateRange',
  component: GanttDateRange,
  render: (args) => <Preview {...args} />,
  parameters: { layout: 'fullscreen' },
  args: { today: copy.stories.today, value: getPresetRange(copy.stories.today, 60), onChange: fn() },
} satisfies Meta<typeof GanttDateRange>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: copy.preset(60) })).toHaveAttribute('aria-pressed', 'true');
    await expect(c.getByRole('button', { name: copy.preset(30) })).toHaveAttribute('aria-pressed', 'false');
    await expect(c.getByLabelText(copy.from)).toHaveValue(args.value.startDate);
    await expect(c.getByLabelText(copy.to)).toHaveValue(args.value.endDate);
  },
};
export const ChoosePreset: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: copy.preset(90) }));
    await expect(args.onChange).toHaveBeenCalledWith(getPresetRange(copy.stories.today, 90));
    await expect(c.getByRole('button', { name: copy.preset(90) })).toHaveAttribute('aria-pressed', 'true');
    await expect(c.getByLabelText(copy.to)).toHaveValue('2027-01-18');
  },
};
export const CustomRange: Story = {
  args: { value: copy.stories.custom },
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    for (const days of [30, 60, 90]) await expect(c.getByRole('button', { name: copy.preset(days) })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.change(c.getByLabelText(copy.to), { target: { value: '2026-12-31' } });
    await expect(args.onChange).toHaveBeenLastCalledWith({ startDate: copy.stories.custom.startDate, endDate: '2026-12-31' });
    await expect(c.queryByRole('alert')).toBeNull();
  },
};
export const EndBeforeStart: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    fireEvent.change(c.getByLabelText(copy.to), { target: { value: '2026-10-01' } });
    await expect(c.getByRole('alert')).toHaveTextContent(copy.errors.order);
    await expect(c.getByLabelText(copy.to)).toHaveAttribute('aria-invalid', 'true');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const TooLong: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    fireEvent.change(c.getByLabelText(copy.to), { target: { value: '2028-01-01' } });
    await expect(c.getByRole('alert')).toHaveTextContent(copy.errors.tooLong);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const MissingDate: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    fireEvent.change(c.getByLabelText(copy.from), { target: { value: '' } });
    await expect(c.getByRole('alert')).toHaveTextContent(copy.errors.missing);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const RecoversAfterError: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    fireEvent.change(c.getByLabelText(copy.from), { target: { value: '' } });
    await expect(c.getByRole('alert')).toBeVisible();
    await userEvent.click(c.getByRole('button', { name: copy.preset(30) }));
    await expect(c.queryByRole('alert')).toBeNull();
    await expect(args.onChange).toHaveBeenCalledWith(getPresetRange(copy.stories.today, 30));
  },
};
