import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { GmailSampleCheck, type GmailSampleCheckProps } from './gmail-sample-check';
import { gmailSampleCheckData as copy } from './gmail-sample-check.data';
const sample = { subject: copy.stories.subject, body: copy.stories.body };
const rules: GmailSampleCheckProps['rules'] = { location: 'both', mode: 'all', phrases: [{ id: 'service', text: copy.stories.phrase }, { id: 'contact', text: copy.stories.contact }] };
const meta = {
  title: 'Lead Capture/GmailSampleCheck', component: GmailSampleCheck, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{copy.stories.description}</p><Story /></main>],
  args: { sample, rules, canRead: true },
} satisfies Meta<typeof GmailSampleCheck>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.matches, { exact: true })).toBeVisible();
  await expect(c.getByText(copy.found.both)).toBeVisible(); await expect(c.getByText(copy.found.body)).toBeVisible();
} };
export const NoMatch: Story = { args: { sample: { subject: copy.stories.missing, body: '' } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.noMatch, { exact: true })).toBeVisible();
} };
export const AnyPhrase: Story = { args: { rules: { ...rules, mode: 'any', phrases: [...rules.phrases, { id: 'other', text: copy.stories.missing }] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.matches, { exact: true })).toBeVisible(); await expect(c.getByText(copy.found.none)).toBeVisible();
} };
export const SubjectOnly: Story = { args: { rules: { ...rules, location: 'subject', phrases: [rules.phrases[0]] } } };
export const BodyOnly: Story = { args: { rules: { ...rules, location: 'body' } } };
export const NoSample: Story = { args: { sample: null } };
export const InvalidRules: Story = { args: { rules: { ...rules, phrases: [] } } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByText(copy.stories.phrase)).not.toBeInTheDocument();
} };
function RecheckPreview(args: GmailSampleCheckProps) {
  const [example, setExample] = useState(args.sample);
  return <div className="grid gap-4"><button type="button" className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-primary focus-visible:focus-ring" onClick={() => setExample({ subject: copy.stories.missing, body: '' })}>{copy.stories.change}</button><GmailSampleCheck {...args} sample={example} /></div>;
}
export const Recheck: Story = { render: args => <RecheckPreview {...args} />, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.matches, { exact: true })).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.stories.change })); await expect(c.getByText(copy.noMatch, { exact: true })).toBeVisible();
} };
export const LongContent: Story = { args: { rules: { ...rules, phrases: [{ id: 'long', text: copy.stories.phrase.repeat(15) }] } } };
