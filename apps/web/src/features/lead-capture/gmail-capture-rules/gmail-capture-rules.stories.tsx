import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { GmailCaptureRules, type GmailCaptureRulesProps } from './gmail-capture-rules';
import { gmailCaptureRulesData as copy } from './gmail-capture-rules.data';

const phrases = [{ id: 'quote', text: copy.stories.first }, { id: 'service', text: copy.stories.second }];
function Preview(args: GmailCaptureRulesProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1><p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <GmailCaptureRules {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} />
  </main>;
}
const meta = {
  title: 'Lead Capture/GmailCaptureRules', component: GmailCaptureRules, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value: { location: 'both', mode: 'all', phrases }, canRead: true, canEdit: true, onChange: fn<GmailCaptureRulesProps['onChange']>() },
} satisfies Meta<typeof GmailCaptureRules>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const SubjectOnly: Story = { args: { value: { location: 'subject', mode: 'all', phrases } } };
export const BodyOnly: Story = { args: { value: { location: 'body', mode: 'any', phrases } } };
export const AnyPhrase: Story = { args: { value: { location: 'both', mode: 'any', phrases } } };
export const ChangeRule: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.location }), 'subject');
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.mode }), 'any');
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...args.value, location: 'subject', mode: 'any' });
  await expect(c.getByText(copy.summaryStart(copy.summaryModes.any, copy.summaryLocations.subject))).toBeVisible();
} };
export const EditPhrase: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), input = c.getByRole('textbox', { name: copy.phrase(1) });
  await userEvent.clear(input); await userEvent.type(input, copy.stories.changed);
  await expect(args.onChange.mock.calls.at(-1)?.[0].phrases[0]).toEqual({ id: 'quote', text: copy.stories.changed });
  await expect(c.getByText(copy.stories.changed, { selector: 'li span' })).toBeVisible();
} };
export const AddRemovePhrase: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.add }));
  await expect(c.getByRole('textbox', { name: copy.phrase(3) })).toHaveFocus();
  await userEvent.type(c.getByRole('textbox', { name: copy.phrase(3) }), copy.stories.changed);
  const added = args.onChange.mock.calls.at(-1)?.[0].phrases[2];
  if (!added) throw new Error('Added phrase missing from draft');
  await expect(added.id).not.toBe('quote');
  await userEvent.click(c.getByRole('button', { name: copy.remove(2) }));
  await expect(c.getByRole('textbox', { name: copy.phrase(2) })).toHaveFocus();
  await expect(args.onChange.mock.calls.at(-1)?.[0].phrases).toEqual([phrases[0], added]);
} };
export const EmptyPhrase: Story = { args: { value: { location: 'both', mode: 'all', phrases: [{ id: 'empty', text: '' }] }, showErrors: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  await expect(c.getByText(copy.incomplete)).toBeVisible();
  await expect(c.getByRole('button', { name: copy.remove(1) })).toBeDisabled();
} };
export const DuplicatePhrase: Story = { args: { value: { location: 'both', mode: 'any', phrases: [phrases[0], { id: 'duplicate', text: ` ${copy.stories.first.toUpperCase()} ` }] }, showErrors: true } };
export const NoPhrases: Story = { args: { value: { location: 'both', mode: 'all', phrases: [] }, showErrors: true } };
export const PhraseLimit: Story = { args: { value: { location: 'both', mode: 'all', phrases: Array.from({ length: 20 }, (_, index) => ({ id: `phrase-${index}`, text: `${copy.stories.first} ${index + 1}` })) } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.add })).toBeDisabled();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const role of ['combobox', 'textbox', 'button'] as const) for (const control of c.getAllByRole(role)) await expect(control).toBeDisabled();
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { canEdit: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const role of ['combobox', 'textbox'] as const) for (const control of c.getAllByRole(role)) await expect(control).toBeDisabled();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
  await expect(c.queryByText(copy.stories.first)).not.toBeInTheDocument();
} };
export const LongContent: Story = { args: { value: { location: 'both', mode: 'all', phrases: [{ id: 'long', text: copy.stories.long }] } } };
export const Narrow: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } };
