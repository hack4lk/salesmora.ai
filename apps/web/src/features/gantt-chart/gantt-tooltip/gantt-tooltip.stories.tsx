import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { GanttTooltip } from './gantt-tooltip';
import { ganttTooltipData as copy } from './gantt-tooltip.data';

const content = (
  <>
    <p className="m-0 text-sm font-semibold">{copy.stories.title}</p>
    <p className="mb-0 mt-1 text-sm text-muted">{copy.stories.body}</p>
  </>
);
const triggerClass = 'rounded-md bg-success px-3 py-2 text-sm font-semibold text-white focus-visible:focus-ring';

const meta = {
  title: 'Gantt Chart/GanttTooltip',
  component: GanttTooltip,
  parameters: { layout: 'fullscreen' },
  args: {
    content,
    children: (props) => <button type="button" className={triggerClass} {...props}>{copy.stories.trigger}</button>,
  },
  decorators: [(Story) => (
    <main className="min-h-screen bg-canvas p-4 text-ink sm:p-6">
      <h1 className="m-0 text-xl font-semibold">{copy.stories.heading}</h1>
      <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
      <Story />
    </main>
  )],
} satisfies Meta<typeof GanttTooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

const tooltip = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body).queryByRole('tooltip');

export const ShowsOnHover: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: copy.stories.trigger });
    await expect(tooltip(canvasElement)).toBeNull();
    await userEvent.hover(trigger);
    await waitFor(() => expect(tooltip(canvasElement)).toBeVisible());
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip(canvasElement)!.id);
    await userEvent.unhover(trigger);
    await waitFor(() => expect(tooltip(canvasElement)).toBeNull());
  },
};
export const ShowsOnFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await waitFor(() => expect(tooltip(canvasElement)).toBeVisible());
  },
};
export const EscapeDismisses: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await waitFor(() => expect(tooltip(canvasElement)).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(tooltip(canvasElement)).toBeNull());
  },
};
export const FlipsAboveAtBottomEdge: Story = {
  decorators: [(Story) => <div className="fixed bottom-4 left-4"><Story /></div>],
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: copy.stories.trigger });
    await userEvent.hover(trigger);
    await waitFor(() => expect(tooltip(canvasElement)).toBeVisible());
    await expect(tooltip(canvasElement)!.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top);
  },
};
export const StaysInsideRightEdge: Story = {
  decorators: [(Story) => <div className="fixed right-4 top-40"><Story /></div>],
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button', { name: copy.stories.trigger }));
    await waitFor(() => expect(tooltip(canvasElement)).toBeVisible());
    await expect(tooltip(canvasElement)!.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
  },
};
