import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CaptureSetupHeader, type CaptureSetupHeaderProps } from './capture-setup-header';
import { captureSetupHeaderData as copy } from './capture-setup-header.data';

function Preview(args: CaptureSetupHeaderProps) {
  const [dirty, setDirty] = useState(args.dirty);
  return <main className="min-h-screen bg-canvas p-4 sm:p-8"><CaptureSetupHeader {...args} dirty={dirty} onSave={async () => { await args.onSave(); setDirty(false); }} />
    <p className="mb-0 mt-8 text-sm text-muted">{copy.stories.description}</p></main>;
}
const meta = {
  title: 'Lead Capture/CaptureSetupHeader', component: CaptureSetupHeader, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { name: copy.stories.name, step: 'source', completedSteps: [], canEdit: true, dirty: false, onSave: fn(async () => {}), onContinue: fn(), onNavigate: fn() },
} satisfies Meta<typeof CaptureSetupHeader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WebsiteIntake: Story = { args: { step: 'intake', completedSteps: ['source'], source: 'website' } };
export const GmailReview: Story = { args: { step: 'review', completedSteps: ['source', 'intake'], source: 'gmail' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button', { name: copy.continue })).not.toBeInTheDocument();
  await expect(c.getByText(copy.reviewHelp)).toBeVisible();
} };
export const DraftRevision: Story = { args: { ...WebsiteIntake.args, revision: true, dirty: true } };
export const SaveDraft: Story = { args: { dirty: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('status')).toHaveTextContent(copy.saved);
  await expect(c.getByRole('button', { name: copy.save })).toBeDisabled();
} };
export const SaveError: Story = { args: { dirty: true, onSave: fn(async () => { throw new Error('preview'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(c.getByRole('alert')).toHaveTextContent(copy.failed);
  await expect(await c.findByRole('status')).toHaveTextContent(copy.dirty);
  await expect(c.getByRole('button', { name: copy.save })).toBeEnabled();
} };
export const Saving: Story = { args: { dirty: true, onSave: fn(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.save }));
  await expect(c.getByRole('status')).toHaveTextContent(copy.saving);
  for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.saving }));
  await expect(args.onSave).toHaveBeenCalledTimes(1);
} };
export const Pending: Story = { args: { ...WebsiteIntake.args, dirty: true, pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.exit }));
  await expect(args.onNavigate).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { ...WebsiteIntake.args, canEdit: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('button', { name: copy.save })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: copy.continue })).not.toBeInTheDocument();
  await expect(c.getByRole('status')).toHaveTextContent(copy.readOnly);
} };
export const BlockedContinue: Story = { args: { continueDisabled: true, continueHint: copy.stories.blocked } };
export const Continue: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.continue }));
  await expect(args.onContinue).toHaveBeenCalledTimes(1);
  await expect(args.onSave).not.toHaveBeenCalled();
} };
export const StepNavigation: Story = { args: { ...GmailReview.args }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.stepLabel(1, copy.steps.source) }));
  await expect(args.onNavigate).toHaveBeenLastCalledWith('source');
  await userEvent.click(c.getByRole('button', { name: copy.back }));
  await expect(args.onNavigate).toHaveBeenLastCalledWith('intake');
} };
export const KeepEditing: Story = { args: { ...WebsiteIntake.args, dirty: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.back }));
  const dialog = await body.findByRole('alertdialog');
  await userEvent.click(within(dialog).getByRole('button', { name: copy.stay }));
  await expect(args.onNavigate).not.toHaveBeenCalled();
  await expect(await c.findByRole('status')).toHaveTextContent(copy.dirty);
} };
export const DiscardChanges: Story = { args: { ...WebsiteIntake.args, dirty: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.exit }));
  const dialog = await body.findByRole('alertdialog');
  await userEvent.click(within(dialog).getByRole('button', { name: copy.discard }));
  await expect(args.onNavigate).toHaveBeenCalledWith('list');
} };
export const UnsavedReview: Story = { args: { ...WebsiteIntake.args, dirty: true }, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.exit }));
  const body = within(canvasElement.ownerDocument.body);
  await waitFor(async () => { await expect(body.getByRole('alertdialog')).toBeVisible(); });
  await waitFor(async () => { await expect(body.getByRole('button', { name: copy.stay })).toHaveFocus(); });
} };
export const LongName: Story = { args: { ...WebsiteIntake.args, name: copy.stories.longName } };
export const Narrow: Story = { args: { ...DraftRevision.args }, globals: { viewport: { value: 'phone', isRotated: false } } };

export const ContentBeforeActions: Story = {
  args: { children: <section aria-label={copy.stories.content} className="min-h-96 rounded-2xl border border-line bg-paper p-6"><h2 className="m-0 text-xl font-semibold">{copy.stories.content}</h2></section> },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), content = c.getByRole('region', { name: copy.stories.content });
    const footer = canvasElement.querySelector('footer')!;
    await expect(footer.getBoundingClientRect().top).toBeGreaterThanOrEqual(content.getBoundingClientRect().bottom);
    await expect(c.getByRole('heading', { level: 1 }).getBoundingClientRect().bottom).toBeLessThan(content.getBoundingClientRect().top);
  },
};
