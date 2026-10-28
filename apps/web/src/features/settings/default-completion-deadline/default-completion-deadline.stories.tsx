import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DefaultCompletionDeadline, type DefaultCompletionDeadlineProps, type DefaultDeadlineValues } from './default-completion-deadline';
import { defaultCompletionDeadlineData as copy } from './default-completion-deadline.data';
const unset: DefaultDeadlineValues = { mode: 'unset' };
const business: DefaultDeadlineValues = { mode: 'relative', days: copy.stories.defaultDays, count: 'business' };
function Preview(args: DefaultCompletionDeadlineProps) {
  const [values, setValues] = useState(args.values), [saved, setSaved] = useState(args.savedValues);
  return <DefaultCompletionDeadline {...args} values={values} savedValues={saved} onChange={next => { args.onChange(next); setValues(next); }} onDiscard={() => { args.onDiscard(); setValues(saved); }}
    onSave={async next => { await args.onSave(next); const { revision: _revision, ...result } = next; void _revision; setSaved(result); }}/>
}
const meta = { title: 'Settings/DefaultCompletionDeadline', component: DefaultCompletionDeadline, render: args => <Preview {...args}/>,
  args: { values: unset, savedValues: unset, revision: 'default-preview-v1', timezone: copy.stories.timezone, exampleCreatedDate: copy.stories.date, canManage: true,
    onChange: fn(), onDiscard: fn(), onReload: fn(), onSave: fn() },
  decorators: [Story => <main className="mx-auto grid min-h-screen w-full max-w-4xl content-start gap-6 p-4 sm:p-8"><p className="m-0 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story/></main>], parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DefaultCompletionDeadline>;
export default meta; type Story = StoryObj<typeof meta>;
const body = (element: HTMLElement) => within(element.ownerDocument.body);
async function review(element: HTMLElement) { await userEvent.click(body(element).getByRole('button', { name: copy.review })); }
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('radio', { name: copy.unset })).toBeChecked(); await expect(c.queryByLabelText(copy.days)).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: copy.review })).toBeDisabled();
} };
export const RelativeBusiness: Story = { args: { values: business, savedValues: business } };
export const RelativeCalendar: Story = { args: { values: { ...business, count: 'calendar' }, savedValues: { ...business, count: 'calendar' } } };
export const BusinessWeekend: Story = { args: { values: { ...business, days: 1 } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.stories.monday)).toBeVisible(); } };
export const CalendarWeekend: Story = { args: { values: { ...business, days: 1, count: 'calendar' } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.stories.saturday)).toBeVisible(); } };
export const Review: Story = { args: { values: business }, play: async ({ canvasElement, args }) => {
  await review(canvasElement); await waitFor(() => expect(body(canvasElement).getByLabelText(copy.summary)).toHaveFocus()); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const Confirm: Story = { args: { values: business }, play: async ({ canvasElement, args }) => {
  await review(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirm }));
  await expect(args.onSave).toHaveBeenCalledOnce(); await expect(args.onSave).toHaveBeenCalledWith({ ...business, revision: 'default-preview-v1' });
  await waitFor(() => expect(body(canvasElement).getByRole('button', { name: copy.review })).toBeDisabled());
} };
export const ClearDefault: Story = { args: { values: unset, savedValues: business }, play: async ({ canvasElement, args }) => {
  await review(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirm })); await expect(args.onSave).toHaveBeenCalledWith({ mode: 'unset', revision: 'default-preview-v1' });
} };
export const SwitchModes: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: copy.relative })); await expect(c.getByLabelText(copy.count)).toHaveValue('business');
  await userEvent.clear(c.getByLabelText(copy.days)); await userEvent.type(c.getByLabelText(copy.days), '30'); await userEvent.selectOptions(c.getByLabelText(copy.count), 'calendar');
  await userEvent.click(c.getByRole('radio', { name: copy.unset })); await userEvent.click(c.getByRole('radio', { name: copy.relative }));
  await expect(c.getByLabelText(copy.days)).toHaveValue(30); await expect(c.getByLabelText(copy.count)).toHaveValue('calendar'); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const InvalidDays: Story = { args: { values: { ...business, days: 0 } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.invalid); await expect(within(canvasElement).getByRole('button', { name: copy.review })).toBeDisabled(); } };
export const TooManyDays: Story = { args: { values: { ...business, days: 366 } } };
export const FractionalDays: Story = { args: { values: { ...business, days: 1.5 } } };
export const ReadOnly: Story = { args: { values: business, savedValues: business, canManage: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByLabelText(copy.days)).toBeDisabled(); await expect(c.getByRole('radio', { name: copy.unset })).toBeDisabled(); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const Saving: Story = { args: { values: business, pending: true } };
export const SaveError: Story = { args: { values: business, error: copy.saveError, onSave: fn(async () => { throw new Error(copy.saveError); }) }, play: async ({ canvasElement }) => {
  await review(canvasElement); await userEvent.click(body(canvasElement).getByRole('button', { name: copy.confirm })); await expect(body(canvasElement).getByRole('dialog')).toBeInTheDocument();
} };
export const Conflict: Story = { args: { values: business, conflict: true }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledOnce(); } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('radio')).not.toBeInTheDocument(); } };
export const LoadError: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.reload })); await expect(args.onReload).toHaveBeenCalledOnce(); } };
export const Discard: Story = { args: { values: business }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.discard })); await expect(within(canvasElement).getByRole('radio', { name: copy.unset })).toBeChecked(); await expect(args.onSave).not.toHaveBeenCalled(); } };
export const LongTimezone: Story = { args: { values: business, timezone: copy.stories.longTimezone } };
function RevisionPreview(args: DefaultCompletionDeadlineProps) {
  const [revision, setRevision] = useState(args.revision);
  useEffect(() => { const change = () => setRevision('default-preview-v2'); window.addEventListener('deadline-default-revision', change); return () => window.removeEventListener('deadline-default-revision', change); }, []);
  return <Preview {...args} revision={revision}/>;
}
export const RevisionChanged: Story = { args: { values: business }, render: args => <RevisionPreview {...args}/>, play: async ({ canvasElement, args }) => {
  await review(canvasElement); canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('deadline-default-revision')); await waitFor(() => expect(body(canvasElement).queryByRole('dialog')).not.toBeInTheDocument()); await expect(args.onSave).not.toHaveBeenCalled();
} };
export const Keyboard: Story = { args: { values: business }, play: async ({ canvasElement }) => {
  within(canvasElement).getByRole('button', { name: copy.review }).focus(); await userEvent.keyboard('{Enter}'); await waitFor(() => expect(body(canvasElement).getByLabelText(copy.summary)).toHaveFocus());
} };
