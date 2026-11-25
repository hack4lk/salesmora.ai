import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { WorkflowCancellationCard, type WorkflowCancellationCardProps } from './workflow-cancellation-card';

const meta = {
 title: 'Workflows/Cancellation review', component: WorkflowCancellationCard, parameters: { layout: 'fullscreen' },
 decorators: [Story => <main className="min-h-screen bg-assistant-panel p-4 text-assistant-foreground sm:p-8"><div className="mx-auto max-w-2xl"><Story/></div></main>],
 args: { value: { name: 'Fill roofing openings', serviceId: 'roofing', durationMinutes: 60, gapMinutes: 30, recipientId: 'morgan', notifications: { inApp: true, email: true } },
  timezone: 'America/New_York', services: [{ id: 'roofing', name: 'Roofing' }], recipients: [{ id: 'morgan', name: 'Morgan Ellis' }, { id: 'alex', name: 'Alex Parker' }],
  canPublish: true, onPublish: fn<WorkflowCancellationCardProps['onPublish']>(async () => {}), onCancel: fn() },
} satisfies Meta<typeof WorkflowCancellationCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = {};
export const Publish: Story = {
 render: function Published(props) { const [done, setDone] = useState(false); return <WorkflowCancellationCard {...props} state={done ? 'published' : 'draft'} onPublish={async value => { await props.onPublish(value); setDone(true); }}/>; },
 play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByLabelText('In-app')).toBeChecked(); await expect(c.getByLabelText('Email')).toBeChecked();
  await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
  await expect(args.onPublish).toHaveBeenCalledWith(args.value);
  await expect(await c.findByText('Workflow published.')).toBeVisible();
 },
};
export const ChangeSettings: Story = { play: async ({ canvasElement, args }) => {
 const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Change settings' }));
 await userEvent.selectOptions(c.getByLabelText('Notify'), 'alex');
 await userEvent.clear(c.getByLabelText('Planned duration (minutes)')); await userEvent.type(c.getByLabelText('Planned duration (minutes)'), '90');
 await userEvent.click(c.getByLabelText('Email'));
 await userEvent.click(c.getByRole('button', { name: 'Back to review' }));
 await expect(c.getByText('90 minutes of work · 30-minute gap · America/New_York')).toBeVisible();
 await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
 await expect(args.onPublish).toHaveBeenCalledWith(expect.objectContaining({ recipientId: 'alex', durationMinutes: 90, notifications: { inApp: true, email: false } }));
} };
export const MissingSetup: Story = { args: { services: [] }, play: async ({ canvasElement }) => {
 await expect(within(canvasElement).getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const InvalidDuration: Story = { play: async ({ canvasElement }) => {
 const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Change settings' }));
 await userEvent.clear(c.getByLabelText('Planned duration (minutes)'));
 await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const BothChannelsOff: Story = { play: async ({ canvasElement }) => {
 const c = within(canvasElement); await userEvent.click(c.getByLabelText('In-app')); await userEvent.click(c.getByLabelText('Email'));
 await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeDisabled();
} };
export const ReadOnly: Story = { args: { canPublish: false } };
export const Expired: Story = { args: { state: 'expired' } };
export const SaveError: Story = { args: { onPublish: fn<WorkflowCancellationCardProps['onPublish']>(async () => { throw Error('unavailable'); }) }, play: async ({ canvasElement }) => {
 const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Publish workflow' }));
 await expect(await c.findByRole('alert')).toHaveTextContent('The workflow could not be published.');
 await expect(c.getByRole('button', { name: 'Publish workflow' })).toBeEnabled();
} };
export const Cancel: Story = { play: async ({ canvasElement, args }) => {
 await userEvent.click(within(canvasElement).getByRole('button', { name: 'Cancel' }));
 await expect(args.onCancel).toHaveBeenCalledTimes(1); await expect(args.onPublish).not.toHaveBeenCalled();
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
