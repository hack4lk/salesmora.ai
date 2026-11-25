import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WorkflowCancellationOpening, type CancellationSuggestion, type WorkflowCancellationOpeningProps } from './workflow-cancellation-opening';

const person = { id: 'alex', name: 'Alex Parker' };
const suggestions: CancellationSuggestion[] = [
  { jobId: 'job-1', jobVersion: 4, number: 'J-0014', title: 'Replace porch flashing', customerName: 'Skyler Grant', workTime: { startTime: '10:00', durationMinutes: 60 }, people: [person], assignment: 'qualified' },
  { jobId: 'job-2', jobVersion: 7, number: 'J-0015', title: 'Repair garage gutter', customerName: 'Jordan Lee', workTime: { startTime: '10:00', durationMinutes: 60 }, people: [person], assignment: 'preserved' },
];
const meta = {
  title: 'Workflows/Cancellation opening', component: WorkflowCancellationOpening,
  parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="mx-auto min-h-screen max-w-5xl bg-canvas p-4 text-ink sm:p-8"><Story/></main>],
  args: { opening: { id: 'opening-1', revision: 'opening-v2', date: '2026-11-24', timezone: 'America/New_York', workTime: { startTime: '10:00', durationMinutes: 120 }, service: 'Roofing', crew: [person], expiresAt: '2099-11-24T15:00:00Z' }, suggestions,
    state: 'open', canRead: true, canBook: true, onBack: fn(), onRefresh: fn(), onBook: fn<WorkflowCancellationOpeningProps['onBook']>(async () => {}) },
} satisfies Meta<typeof WorkflowCancellationOpening>;
export default meta;
type Story = StoryObj<typeof meta>;
const dialog = (element: HTMLElement) => within(within(element.ownerDocument.body).getByRole('dialog'));
export const Suggestions: Story = {};
export const ReviewAndConfirm: Story = {
 render: function Confirm(props) { const [filled, setFilled] = useState(false); return <WorkflowCancellationOpening {...props} state={filled ? 'filled' : props.state} onBook={async review => { await props.onBook(review); setFilled(true); }}/>; },
 play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: 'Review booking: J-0014' }));
  await expect(args.onBook).not.toHaveBeenCalled();
  const d = dialog(canvasElement);
  await expect(d.getByText('10:00 AM–11:00 AM', { exact: false })).toBeVisible();
  await userEvent.click(d.getByRole('button', { name: 'Confirm booking' }));
  await expect(args.onBook).toHaveBeenCalledWith({ openingId: 'opening-1', openingRevision: 'opening-v2', jobId: 'job-1', jobVersion: 4,
    date: '2026-11-24', timezone: 'America/New_York', workTime: suggestions[0].workTime, personIds: ['alex'] });
  await expect(await c.findByText('This opening has been filled.')).toBeVisible();
  await expect(c.queryByRole('button', { name: 'Review booking: J-0015' })).not.toBeInTheDocument();
 },
};
export const CancelReview: Story = { play: async ({ canvasElement, args }) => {
 const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Review booking: J-0014' }));
 await userEvent.click(dialog(canvasElement).getByRole('button', { name: 'Cancel' }));
 await expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).not.toBeInTheDocument();
 await expect(args.onBook).not.toHaveBeenCalled();
} };
export const Empty: Story = { args: { suggestions: [] } };
export const ReadOnly: Story = { args: { canBook: false }, play: async ({ canvasElement }) => {
 await expect(within(canvasElement).getByRole('button', { name: 'Review booking: J-0014' })).toBeDisabled();
} };
export const AccessRemoved: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
 const c = within(canvasElement); await expect(c.queryByText('Skyler Grant')).not.toBeInTheDocument();
 await expect(c.queryByText('Roofing')).not.toBeInTheDocument();
} };
export const Expired: Story = { args: { state: 'expired' } };
export const TimedOut: Story = { args: { opening: { ...meta.args.opening, expiresAt: '2020-01-01T00:00:00Z' } } };
export const Paused: Story = { args: { state: 'paused' } };
export const Filled: Story = { args: { state: 'filled' } };
export const Loading: Story = { args: { state: 'loading' } };
export const LoadError: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
 await userEvent.click(within(canvasElement).getByRole('button', { name: 'Try again' })); await expect(args.onRefresh).toHaveBeenCalledTimes(1);
} };
export const SaveError: Story = { args: { onBook: fn<WorkflowCancellationOpeningProps['onBook']>(async () => { throw Error('conflict'); }) }, play: async ({ canvasElement, args }) => {
 await userEvent.click(within(canvasElement).getByRole('button', { name: 'Review booking: J-0014' }));
 await userEvent.click(dialog(canvasElement).getByRole('button', { name: 'Confirm booking' }));
 await expect(await dialog(canvasElement).findByRole('alert')).toBeVisible();
 await expect(args.onBook).toHaveBeenCalledTimes(1);
 await expect(dialog(canvasElement).getByRole('button', { name: 'Confirm booking' })).toBeEnabled();
} };
export const SuggestionChanged: Story = {
 render: function Changed(props: WorkflowCancellationOpeningProps) {
  const [selected, setSelected] = useState(false), [changed, setChanged] = useState(false);
  useEffect(() => { if (!selected) return; const timer = setTimeout(() => setChanged(true), 600); return () => clearTimeout(timer); }, [selected]);
  return <div onClickCapture={event => { if ((event.target as HTMLElement).closest('button')?.textContent === 'Review booking') setSelected(true); }}>
    <WorkflowCancellationOpening {...props} suggestions={changed ? [] : props.suggestions}/></div>;
 },
 play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Review booking: J-0014' }));
  await expect(await dialog(canvasElement).findByText('This suggestion changed. Close this review and refresh suggestions.')).toBeVisible();
  await expect(dialog(canvasElement).getByRole('button', { name: 'Confirm booking' })).toBeDisabled();
  await expect(args.onBook).not.toHaveBeenCalled();
 },
};
export const Pending: Story = { args: { onBook: fn<WorkflowCancellationOpeningProps['onBook']>(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
 await userEvent.click(within(canvasElement).getByRole('button', { name: 'Review booking: J-0014' }));
 await userEvent.click(dialog(canvasElement).getByRole('button', { name: 'Confirm booking' }));
 await expect(dialog(canvasElement).getByRole('button', { name: 'Confirm booking' })).toBeDisabled();
 await expect(dialog(canvasElement).getByRole('button', { name: 'Cancel' })).toBeDisabled();
 await expect(args.onBook).toHaveBeenCalledTimes(1);
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };

export const BookingReview: Story = { play: async ({ canvasElement, args }) => {
 await userEvent.click(within(canvasElement).getByRole('button', { name: 'Review booking: J-0014' }));
 await expect(dialog(canvasElement).getByRole('button', { name: 'Confirm booking' })).toBeEnabled();
 await expect(args.onBook).not.toHaveBeenCalled();
} };
export const FiveSuggestions: Story = { args: { suggestions: Array.from({ length: 7 }, (_, index) => ({ ...suggestions[0], jobId: `job-${index}`, number: `J-${100 + index}` })) },
 play: async ({ canvasElement }) => { await expect(within(canvasElement).getAllByRole('button', { name: /^Review booking:/ })).toHaveLength(5); },
};
