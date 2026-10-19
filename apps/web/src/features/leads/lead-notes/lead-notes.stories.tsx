import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { LeadNotes, type LeadNotesProps, type LeadNote } from './lead-notes';
import { leadNotesData as copy } from './lead-notes.data';

type PreviewProps = Omit<LeadNotesProps, 'onChange' | 'onAdded'>;
function Preview(args: PreviewProps) {
  const [value, setValue] = useState(args.value), [notes, setNotes] = useState(args.notes), [total, setTotal] = useState(args.total ?? args.notes.length);
  return <LeadNotes {...args} value={value} notes={notes} total={total} onChange={setValue}
    onAdded={note => { if (!notes.some(item => item.id === note.id)) setTotal(current => current + 1); setNotes(current => [note, ...current.filter(item => item.id !== note.id)]); }}
    onLoadMore={args.onLoadMore ? () => { args.onLoadMore?.(); setNotes(current => [...current, ...Array.from({ length: Math.min(20, total - current.length) }, (_, index): LeadNote => ({ id: `older-${current.length + index}`, body: copy.stories.olderBody(current.length + index), authorName: copy.stories.author, createdAt: new Date(Date.parse(copy.stories.now) - (current.length + index + 1) * 86400000).toISOString() }))]); } : undefined}/>;
}
const meta = { title: 'Leads/LeadNotes', component: Preview, parameters: { layout: 'fullscreen' },
  args: { leadId: copy.stories.leadId, notes: copy.stories.notes, value: '', now: copy.stories.now, timezone: copy.stories.timezone,
    onAdd: fn<LeadNotesProps['onAdd']>(async request => ({ ok: true, note: { id: request.submissionId, body: request.body, authorName: copy.stories.author, createdAt: copy.stories.now } })), onLoadMore: fn(), onRetry: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="w-full max-w-3xl"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><Story/></div></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { notes: [] } };
export const Draft: Story = { args: { value: copy.stories.draft } };
export const Many: Story = { args: { total: 27, notes: Array.from({ length: 20 }, (_, index): LeadNote => ({ id: `note-${index}`, body: copy.stories.olderBody(index), authorName: copy.stories.author, createdAt: new Date(Date.parse(copy.stories.now) - index * 86400000).toISOString() })) } };
export const Loading: Story = { args: { notes: [], loading: true } };
export const LoadError: Story = { args: { notes: [], loadError: copy.stories.loadError }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.retry }));await expect(args.onRetry).toHaveBeenCalledTimes(1);
} };
export const Disabled: Story = { args: { disabled: true, value: copy.stories.draft } };
export const RequiredValidation: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.submit }));await expect(c.getByRole('textbox', { name: copy.label })).toHaveFocus();await expect(c.getByText(copy.required)).toBeVisible();await expect(args.onAdd).not.toHaveBeenCalled();
} };
export const OverLimit: Story = { args: { value: copy.stories.oversized }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.submit }));await expect(c.getByText(copy.tooLong)).toBeVisible();await expect(args.onAdd).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { value: copy.stories.draft, onAdd: fn<LeadNotesProps['onAdd']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.submit }));fireEvent.submit(c.getByRole('form'));await expect(args.onAdd).toHaveBeenCalledTimes(1);await expect(c.getByRole('textbox', { name: copy.label })).toBeDisabled();
} };
export const ServerError: Story = { args: { value: copy.stories.draft, onAdd: fn<LeadNotesProps['onAdd']>(async () => ({ ok: false })) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.submit }));await waitFor(() => expect(c.getByText(copy.failed)).toBeVisible());await expect(c.getByRole('textbox', { name: copy.label })).toHaveValue(copy.stories.draft);
} };
export const Added: Story = { args: { value: `  ${copy.stories.draft}  ` }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.submit }));await waitFor(() => expect(c.getByRole('textbox', { name: copy.label })).toHaveValue(''));await expect(args.onAdd).toHaveBeenCalledWith({ leadId: copy.stories.leadId, submissionId: expect.any(String), body: copy.stories.draft });await expect(c.getByRole('list').querySelector('li')).toHaveTextContent(copy.stories.draft.replace(/\s+/g, ' '));
} };
export const Retry: Story = { args: Draft.args, play: async ({ canvasElement, args }) => {
  args.onAdd.mockResolvedValueOnce({ ok: false });const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.submit }));await waitFor(() => expect(c.getByText(copy.failed)).toBeVisible());await userEvent.click(c.getByRole('button', { name: copy.submit }));await waitFor(() => expect(args.onAdd).toHaveBeenCalledTimes(2));await expect(args.onAdd.mock.calls[0][0].submissionId).toEqual(args.onAdd.mock.calls[1][0].submissionId);
} };
export const OlderNotes: Story = { args: Many.args, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);await userEvent.click(c.getByRole('button', { name: copy.older }));await expect(args.onLoadMore).toHaveBeenCalledTimes(1);await expect(c.getAllByRole('listitem')).toHaveLength(27);await expect(c.queryByRole('button', { name: copy.older })).not.toBeInTheDocument();
} };
export const PlainText: Story = { args: { notes: [{ ...copy.stories.notes[0], body: copy.stories.plainText }] }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('link')).not.toBeInTheDocument();await expect(canvasElement.querySelector('script')).toBeNull();
} };
export const Narrow: Story = { args: { value: copy.stories.draft, notes: [{ ...copy.stories.notes[0], authorName: copy.stories.longAuthor, body: copy.stories.plainText }] }, parameters: { viewport: { value: 'phone' } } };
