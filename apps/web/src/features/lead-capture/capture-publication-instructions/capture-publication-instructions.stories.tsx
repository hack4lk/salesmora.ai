import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { CapturePublicationInstructions, type CapturePublicationInstructionsProps } from './capture-publication-instructions';
import { capturePublicationInstructionsData as copy } from './capture-publication-instructions.data';
import type { CapturePublication } from './capture-publication-instructions.validation';
const fixture = copy.stories;
const publication: CapturePublication = { id: 'public-form', version: 1, name: fixture.name, hostedUrl: fixture.url, status: 'active', embeds: [{ method: 'iframe', code: fixture.code }, { method: 'javascript', code: fixture.script }] };
const meta = {
  title: 'Lead Capture/CapturePublicationInstructions', component: CapturePublicationInstructions, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{fixture.description}</p><Story /></main>],
  args: { publication, canRead: true, onCopy: fn<NonNullable<CapturePublicationInstructionsProps['onCopy']>>(async () => {}) },
} satisfies Meta<typeof CapturePublicationInstructions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const CopyLink: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.copyLink })); await expect(args.onCopy).toHaveBeenCalledWith(fixture.url); await expect(await c.findByText(copy.copiedLink)).toBeVisible();
} };
export const CopyCode: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.copyCode })); await expect(args.onCopy).toHaveBeenCalledWith(fixture.code); await expect(await c.findByText(copy.copiedCode)).toBeVisible();
} };
export const JavaScript: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: copy.methods.javascript })); await expect(c.getByRole('textbox', { name: copy.code })).toHaveValue(fixture.script);
  await userEvent.click(c.getByRole('button', { name: copy.copyCode })); await expect(args.onCopy).toHaveBeenCalledWith(fixture.script);
  await expect(canvasElement.querySelector('script')).toBeNull(); await expect(canvasElement.querySelector('iframe')).toBeNull();
} };
export const WordPress: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('radio', { name: copy.platforms.wordpress })); await expect(c.getByText(copy.wordpressSteps[1])).toBeVisible();
} };
export const CopyFailure: Story = { args: { onCopy: fn<NonNullable<CapturePublicationInstructionsProps['onCopy']>>(async () => { throw new Error('Mock clipboard failure'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.copyCode })); await expect(await c.findByText(copy.copyFailed)).toBeVisible();
  await userEvent.click(c.getByRole('textbox', { name: copy.code })); await expect(c.getByRole('textbox', { name: copy.code })).toHaveFocus();
} };
export const CopyPending: Story = { args: { onCopy: fn<NonNullable<CapturePublicationInstructionsProps['onCopy']>>(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), button = c.getByRole('button', { name: copy.copyLink }); await userEvent.click(button); fireEvent.click(button);
  await expect(args.onCopy).toHaveBeenCalledTimes(1); await expect(c.getByRole('button', { name: copy.copyCode })).toBeDisabled(); await expect(c.getByRole('radio', { name: copy.methods.javascript })).toBeDisabled();
} };
export const Paused: Story = { args: { publication: { ...publication, status: 'paused' } } };
export const Scheduled: Story = { args: { publication: { ...publication, status: 'scheduled', scheduledAt: fixture.scheduled, timezone: fixture.timezone } } };
export const Archived: Story = { args: { publication: { ...publication, status: 'archived' } } };
export const Unavailable: Story = { args: { publication: { ...publication, status: 'blocked' } } };
export const BeforePublication: Story = { args: { publication: null }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.draft)).toBeVisible(); await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const IframeOnly: Story = { args: { publication: { ...publication, embeds: [publication.embeds[0]] } } };
export const InvalidDetails: Story = { args: { publication: { ...publication, hostedUrl: 'javascript:alert(1)' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid); await expect(c.queryByRole('link')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('button', { name: copy.copyCode })).toBeDisabled(); await expect(args.onCopy).not.toHaveBeenCalled();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
} };
function UpdatedPublicationPreview(args: CapturePublicationInstructionsProps) {
  const [current, setCurrent] = useState(args.publication);
  return <div className="grid gap-4"><button type="button" className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-primary focus-visible:focus-ring" onClick={() => setCurrent({ ...publication, version: 2, hostedUrl: fixture.updatedUrl, embeds: publication.embeds.map(embed => ({ ...embed, code: embed.code.replaceAll(fixture.url, fixture.updatedUrl) })) })}>{fixture.changed}</button><CapturePublicationInstructions {...args} publication={current} /></div>;
}
export const ChangedPublication: Story = { render: args => <UpdatedPublicationPreview {...args} />, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.copyLink })); await expect(await c.findByText(copy.copiedLink)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: fixture.changed })); await expect(c.queryByText(copy.copiedLink)).not.toBeInTheDocument(); await userEvent.click(c.getByRole('button', { name: copy.copyLink })); await expect(args.onCopy).toHaveBeenLastCalledWith(fixture.updatedUrl);
} };
export const LongContent: Story = { args: { publication: { ...publication, name: fixture.long.repeat(3), hostedUrl: `${fixture.url}/${'long-form-identifier'.repeat(15)}`, embeds: publication.embeds.map(embed => ({ ...embed, code: embed.code.replaceAll(fixture.url, `${fixture.url}/${'long-form-identifier'.repeat(15)}`) })) } } };
