import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WorkOrderVisitChoice, type WorkOrderVisitChoiceProps } from './work-order-visit-choice';
import { workOrderVisitChoiceData as copy } from './work-order-visit-choice.data';
const visit = { scheduledDate: copy.stories.date, arrivalWindow: '09:00-11:00' as const, timezone: copy.stories.timezone, canJoin: true, references: [copy.stories.job, copy.stories.workOrder] };
function Preview(args: WorkOrderVisitChoiceProps & { changeAccess?: boolean }) {
  const [value, setValue] = useState(args.value), [allowed, setAllowed] = useState(true);
  return <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="mx-auto grid max-w-xl gap-4 rounded-2xl bg-paper p-4 sm:p-6">
    <WorkOrderVisitChoice {...args} jobVisit={args.jobVisit && { ...args.jobVisit, canJoin: args.jobVisit.canJoin && allowed }} value={value} onChange={next => { setValue(next); args.onChange(next); }}/>
    {args.changeAccess && <button type="button" className="min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring" onClick={() => setAllowed(old => !old)}>{allowed ? copy.stories.revoke : copy.stories.restore}</button>}
  </div></main>;
}
const meta = { title: 'Work Orders/WorkOrderVisitChoice', component: WorkOrderVisitChoice, render: Preview, parameters: { layout: 'fullscreen' },
  args: { jobVisit: visit, value: null, onChange: fn() } } satisfies Meta<typeof WorkOrderVisitChoice>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('radio', { name: copy.useJob })).not.toBeChecked();
  await expect(c.getByRole('radio', { name: copy.separate })).not.toBeChecked();
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const Selection: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('radio', { name: copy.useJob }));
  await expect(c.getByText(copy.sharedHelp)).toBeVisible(); await expect(args.onChange).toHaveBeenLastCalledWith('job');
  await userEvent.click(c.getByRole('radio', { name: copy.separate }));
  await expect(c.getByRole('radio', { name: copy.useJob })).not.toBeChecked(); await expect(args.onChange).toHaveBeenLastCalledWith('separate');
} };
export const JobVisit: Story = { args: { value: 'job' } };
export const SeparateVisit: Story = { args: { value: 'separate' } };
export const NoArrivalWindow: Story = { args: { jobVisit: { ...visit, arrivalWindow: null } } };
export const UnscheduledJob: Story = { args: { jobVisit: null } };
export const JoiningUnavailable: Story = { args: { jobVisit: { ...visit, canJoin: false, references: [copy.stories.job] } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('radio', { name: copy.useJob })).toBeDisabled();
  await userEvent.click(c.getByRole('radio', { name: copy.separate })); await expect(args.onChange).toHaveBeenLastCalledWith('separate');
  await expect(c.queryByText(copy.stories.workOrder)).not.toBeInTheDocument();
} };
export const ChangedPermission: Story = { render: args => <Preview {...args} changeAccess/>, args: { value: 'job' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.stories.revoke }));
  await expect(c.getByRole('radio', { name: copy.useJob })).not.toBeChecked(); await expect(c.getByRole('radio', { name: copy.separate })).not.toBeChecked();
  await expect(args.onChange).not.toHaveBeenCalled(); await expect(c.getByText(copy.required)).toBeVisible();
} };
export const Disabled: Story = { args: { disabled: true, value: 'job' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const radio of c.getAllByRole('radio')) await expect(radio).toBeDisabled(); await expect(args.onChange).not.toHaveBeenCalled();
} };
export const Loading: Story = { args: { state: 'loading' } };
export const Error: Story = { args: { state: 'error', onRetry: fn() }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByRole('radio')).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onRetry).toHaveBeenCalledOnce();
} };
export const LongReferences: Story = { args: { jobVisit: { ...visit, references: [copy.stories.job, copy.stories.longReference] } } };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.tab(); await expect(c.getByRole('radio', { name: copy.useJob })).toHaveFocus();
  await userEvent.keyboard(' '); await expect(args.onChange).toHaveBeenLastCalledWith('job');
  await userEvent.keyboard('{ArrowDown}'); await expect(c.getByRole('radio', { name: copy.separate })).toBeChecked();
  await expect(args.onChange).toHaveBeenLastCalledWith('separate');
} };
