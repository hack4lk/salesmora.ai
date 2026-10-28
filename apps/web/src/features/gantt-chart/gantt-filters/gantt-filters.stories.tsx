import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { emptyGanttFilters, GanttFilters, type GanttFiltersProps } from './gantt-filters';
import { ganttFiltersData as copy } from './gantt-filters.data';

function Preview(args: GanttFiltersProps) {
  const [filters, setFilters] = useState(args.filters);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
    <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <GanttFilters {...args} filters={filters} onFiltersChange={(next) => { args.onFiltersChange(next); setFilters(next); }} />
  </main>;
}

const meta = {
  title: 'Gantt Chart/GanttFilters',
  component: GanttFilters,
  parameters: { layout: 'fullscreen' },
  render: (args) => <Preview {...args} />,
  args: {
    filters: emptyGanttFilters,
    teamMembers: copy.stories.teamMembers,
    customers: copy.stories.customers,
    onFiltersChange: fn(),
  },
} satisfies Meta<typeof GanttFilters>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText(copy.status)).toHaveValue('all');
    await userEvent.selectOptions(c.getByLabelText(copy.status), 'scheduled');
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith({ ...emptyGanttFilters, status: 'scheduled' });
    await expect(c.getByText(copy.chip(copy.status, 'Scheduled'))).toBeVisible();
  },
};
export const ActiveFilters: Story = {
  args: { filters: { status: 'in-progress', team: 'user-2', customer: 'cust-1' } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText(copy.chip(copy.status, 'In progress'))).toBeVisible();
    await expect(c.getByText(copy.chip(copy.team, 'Alex Chen'))).toBeVisible();
    await expect(c.getByText(copy.chip(copy.customer, 'Maple Street Renovations'))).toBeVisible();
  },
};
export const ClearAll: Story = {
  args: { filters: { status: 'waiting', team: 'user-1', customer: 'cust-2' } },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /clear all/i }));
    await expect(args.onFiltersChange).toHaveBeenLastCalledWith(emptyGanttFilters);
  },
};
