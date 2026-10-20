import { useState, type ComponentProps } from 'react';
import { fn, expect, userEvent, within, waitFor, fireEvent } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WorkOrderCrewNotes, type WorkOrderCrewNote } from './work-order-crew-notes';

const notes: WorkOrderCrewNote[] = [
  { id: 'n2', body: 'Gate code was changed. Customer will text the new one.\nShut-off valve is behind the washer.', authorName: 'Sam Rivera', createdAt: '2026-10-19T15:20:00Z' },
  { id: 'n1', body: 'Arrived on site, customer not home yet.', authorName: 'Sam Rivera', createdAt: '2026-10-19T13:05:00Z' },
];
const Stateful = (args: ComponentProps<typeof WorkOrderCrewNotes>) => {
  const [list, setList] = useState(args.notes);
  return <WorkOrderCrewNotes {...args} notes={list} onAdd={async body => { await args.onAdd(body); setList(l => [{ id: `n${l.length + 3}`, body, authorName: 'Sam Rivera', createdAt: '2026-10-19T16:00:00Z' }, ...l]); }} />;
};
const meta = { title: 'Work Orders/WorkOrderCrewNotes', component: WorkOrderCrewNotes, render: args => <Stateful {...args} />, args: { status: 'in-progress', notes, canAdd: true, onAdd: fn() },
  decorators: [Story => <main className="max-w-xl bg-canvas p-6"><Story /></main>] } satisfies Meta<typeof WorkOrderCrewNotes>;
export default meta; type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  fireEvent.change(c.getByLabelText(/Note for the crew/), { target: { value: 'Parts delivered' } });
  await userEvent.click(c.getByRole('button', { name: 'Add note' }));
  await expect(args.onAdd).toHaveBeenCalledWith('Parts delivered');
  await waitFor(() => expect(c.getByText('Parts delivered')).toBeInTheDocument());
} };
export const Empty: Story = { args: { notes: [] } };
export const Draft: Story = { args: { status: 'draft', notes: [] } };
export const Canceled: Story = { args: { status: 'canceled' } };
export const Archived: Story = { args: { status: 'completed', archived: true } };
export const ReadOnly: Story = { args: { canAdd: false } };
export const SaveFails: Story = { args: { onAdd: fn(async () => { throw new Error('x'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  fireEvent.change(c.getByLabelText(/Note for the crew/), { target: { value: 'Will fail' } });
  await userEvent.click(c.getByRole('button', { name: 'Add note' }));
  await expect(await c.findByText(/We could not save this note/)).toBeInTheDocument();
  await expect(c.getByLabelText(/Note for the crew/)).toHaveValue('Will fail');
} };
