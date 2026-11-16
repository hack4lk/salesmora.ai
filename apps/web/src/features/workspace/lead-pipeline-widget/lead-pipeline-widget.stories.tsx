import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LeadPipelineWidget } from './lead-pipeline-widget';
import { leadPipelineWidgetData as copy } from './lead-pipeline-widget.data';
const meta = {
  title: 'Home/LeadPipelineWidget', component: LeadPipelineWidget,
  decorators: [(Story) => <main className="mx-auto w-full max-w-3xl p-4 sm:p-8"><h1 className="mb-2 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></main>],
  args: { counts: copy.stories.counts, onViewPipeline: fn() },
} satisfies Meta<typeof LeadPipelineWidget>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(copy.total(47))).toBeVisible();
  await expect(canvas.getAllByRole('meter')).toHaveLength(5);
  await expect(canvas.getByRole('meter', { name: copy.stages[0].label })).toHaveAttribute('aria-valuenow', '18');
  await expect(canvas.getByRole('meter', { name: copy.stages[0].label })).toHaveAttribute('aria-valuemax', '47');
  for (const stage of copy.stages) {
    const count = copy.stories.counts[stage.id];
    const meter = canvas.getByRole('meter', { name: stage.label });
    await expect(meter).toHaveAttribute('aria-valuenow', String(count));
    await expect(meter).toHaveAttribute('aria-valuetext', copy.stageValue(count, 47));
    await expect(meter.querySelector('rect')).toHaveAttribute('width', String(count / 47 * 100));
  }
} };
export const Empty: Story = { args: { counts: copy.stories.empty }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(copy.empty)).toBeVisible();
  await expect(canvas.getByText(copy.total(0))).toBeVisible();
  for (const meter of canvas.getAllByRole('meter')) {
    await expect(meter).toHaveAttribute('aria-valuenow', '0');
    await expect(meter).toHaveAttribute('aria-valuemax', '1');
  }
} };
export const FirstLead: Story = { args: { counts: copy.stories.firstLead }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(copy.total(1))).toBeVisible();
  await expect(canvas.getByRole('meter', { name: copy.stages[0].label })).toHaveAttribute('aria-valuetext', copy.stageValue(1, 1));
  await expect(canvas.queryByText(copy.empty)).not.toBeInTheDocument();
} };
export const PipelineUnavailable: Story = { args: { onViewPipeline: undefined }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: `${copy.action} ${copy.unavailable}` })).toBeDisabled();
} };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  const button = within(canvasElement).getByRole('button', { name: copy.action });
  button.focus(); await expect(button).toHaveFocus(); await userEvent.keyboard('{Enter}');
  await expect(args.onViewPipeline).toHaveBeenCalledTimes(1);
} };
export const LargeCounts: Story = { args: { counts: copy.stories.largeCounts } };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const MobileLargeCounts: Story = { args: LargeCounts.args, globals: Mobile.globals };
export const HomeSample: Story = { args: { counts: copy.stories.homeCounts }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(copy.total(8))).toBeVisible();
  for (const stage of copy.stages) {
    await expect(canvas.getByRole('meter', { name: stage.label })).toHaveAttribute('aria-valuenow', String(copy.stories.homeCounts[stage.id]));
  }
} };
export const LinkedPipeline: Story = { args: { pipelineHref: copy.stories.pipelineHref, onViewPipeline: undefined }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('link', { name: copy.action })).toHaveAttribute('href', copy.stories.pipelineHref);
  await expect(canvas.queryByRole('button', { name: copy.action })).not.toBeInTheDocument();
} };
export const DescriptionTooltip: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(canvas.queryByText(copy.description)).not.toBeInTheDocument();
  const trigger = canvas.getByRole('button', { name: copy.about });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  const dialog = body.getByRole('dialog', { name: copy.about });
  await expect(within(dialog).getByText(copy.description)).toBeVisible();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(trigger).toHaveFocus());
} };
