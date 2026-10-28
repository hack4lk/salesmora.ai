import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { GanttJobTooltip } from './gantt-job-tooltip';
import { ganttJobTooltipData as copy } from './gantt-job-tooltip.data';

const meta = {
  title: 'Gantt Chart/GanttJobTooltip',
  component: GanttJobTooltip,
  parameters: { layout: 'fullscreen' },
  args: {
    job: copy.jobs.default,
    teamMembers: copy.stories.teamMembers,
    children: (props) => (
      <button type="button" className="rounded-md bg-success px-3 py-2 text-sm font-semibold text-white focus-visible:focus-ring" {...props}>
        {copy.jobs.default.number}
      </button>
    ),
  },
  decorators: [(Story) => (
    <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
      <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
      <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
      <Story />
    </main>
  )],
} satisfies Meta<typeof GanttJobTooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

const open = async (canvasElement: HTMLElement) => {
  await userEvent.hover(within(canvasElement).getByRole('button'));
  const tip = within(canvasElement.ownerDocument.body).getByRole('tooltip');
  await waitFor(() => expect(tip).toBeVisible());
  return within(tip);
};

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const tip = await open(canvasElement);
    await expect(tip.getByText(args.job.number)).toBeVisible();
    await expect(tip.getByText(args.job.title)).toBeVisible();
    await expect(tip.getByText(args.job.customerName)).toBeVisible();
    await expect(tip.getByText(args.job.primaryOwnerName!)).toBeVisible();
    await expect(tip.getByText('Alex Chen, Jordan Lee')).toBeVisible();
    await expect(tip.queryByText(copy.overdue)).toBeNull();
  },
};
export const Overdue: Story = {
  args: { job: copy.jobs.overdue },
  play: async ({ canvasElement }) => {
    await expect((await open(canvasElement)).getByText(copy.overdue)).toBeVisible();
  },
};
export const NoPeople: Story = {
  args: { job: copy.jobs.noPeople },
  play: async ({ canvasElement }) => {
    const tip = await open(canvasElement);
    await expect(tip.getByText(copy.unassigned)).toBeVisible();
    await expect(tip.getByText(copy.noTeam)).toBeVisible();
  },
};
export const FormerTeammate: Story = {
  args: { job: copy.jobs.formerTeammate },
  play: async ({ canvasElement }) => {
    await expect((await open(canvasElement)).getByText(`Alex Chen, ${copy.formerTeammate}`)).toBeVisible();
  },
};
export const LongContent: Story = {
  args: { job: copy.jobs.long },
  play: async ({ canvasElement, args }) => {
    const tip = await open(canvasElement);
    await expect(tip.getByText(args.job.title)).toBeVisible();
    await expect(tip.getByText(args.job.customerName)).toBeVisible();
  },
};
