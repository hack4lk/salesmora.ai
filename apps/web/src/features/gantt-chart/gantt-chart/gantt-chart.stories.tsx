import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ganttChartPreviewData } from '../gantt-chart.fixtures';
import { ganttFiltersData as filterCopy } from '../gantt-filters/gantt-filters.data';
import { ganttChartData as copy } from './gantt-chart.data';
import { GanttChartPreview } from './gantt-chart.preview';

const firstJob = ganttChartPreviewData.jobs[0];

const meta = {
  title: 'Gantt Chart/GanttChart',
  component: GanttChartPreview,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GanttChartPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('heading', { name: copy.title })).toBeVisible();
    await expect(c.getByText(firstJob.title)).toBeVisible();
  },
};
export const ExpandJob: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const toggle = c.getAllByRole('button', { name: /Toggle work orders/ })[0];
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getAllByText(firstJob.workOrders[0].title).length).toBeGreaterThan(0);
  },
};
export const FilteredByCustomer: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText(filterCopy.customer), firstJob.customerId);
    await expect(c.getByText(firstJob.title)).toBeVisible();
    await expect(c.getAllByRole('button', { name: /Toggle work orders/ })).toHaveLength(
      ganttChartPreviewData.jobs.filter((job) => job.customerId === firstJob.customerId).length,
    );
  },
};
export const NoMatches: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText(filterCopy.status), 'canceled');
    await expect(c.getAllByText(copy.noJobsFound).length).toBeGreaterThan(0);
  },
};
export const FilteredByOwner: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const owner = ganttChartPreviewData.jobs.find((job) => job.primaryOwnerId)!;
    await userEvent.selectOptions(c.getByLabelText(filterCopy.team), owner.primaryOwnerId!);
    await expect(c.getByText(owner.title)).toBeVisible();
  },
};
export const Truncated: Story = {
  args: { truncated: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(copy.truncated)).toBeVisible();
  },
};
export const LinkedBars: Story = {
  args: { workspaceId: copy.stories.workspaceId },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getAllByRole('link', { name: /Open job/ })[0];
    await expect(link).toHaveAttribute('href', `/jobs/${firstJob.id}?workspace=${copy.stories.workspaceId}`);
  },
};
