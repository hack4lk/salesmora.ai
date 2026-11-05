import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureSourceSelection, type CaptureSourceSelectionProps } from './capture-source-selection';
import { captureSourceSelectionData as copy } from './capture-source-selection.data';

function Preview(args: CaptureSourceSelectionProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><h1 className="m-0 text-heading font-semibold">{copy.stories.title}</h1>
    <p className="mb-6 mt-2 text-sm text-muted">{copy.stories.description}</p>
    <CaptureSourceSelection {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} />
  </main>;
}
const meta = {
  title: 'Lead Capture/CaptureSourceSelection', component: CaptureSourceSelection, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value: { name: '', source: null }, canRead: true, canEdit: true, gmailAccess: 'available', onChange: fn(), onReviewPlans: fn() },
} satisfies Meta<typeof CaptureSourceSelection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Website: Story = { args: { value: { name: copy.stories.name, source: 'website' } } };
export const Gmail: Story = { args: { value: { name: copy.stories.name, source: 'gmail' } } };
export const EditSelection: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('textbox', { name: copy.name }), copy.stories.name);
  await userEvent.click(c.getByRole('radio', { name: copy.website.title }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ name: copy.stories.name, source: 'website' });
  await userEvent.click(c.getByRole('radio', { name: copy.gmail.title }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ name: copy.stories.name, source: 'gmail' });
  await expect(c.getByRole('radio', { name: copy.website.title })).not.toBeChecked();
} };
export const FreePlan: Story = { args: { gmailAccess: 'upgrade-required' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('radio', { name: copy.gmail.title })).toBeDisabled();
  await userEvent.click(c.getByRole('radio', { name: copy.gmail.title }));
  await expect(args.onChange).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: copy.plans }));
  await expect(args.onReviewPlans).toHaveBeenCalledTimes(1);
  await userEvent.click(c.getByRole('radio', { name: copy.website.title }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ name: '', source: 'website' });
} };
export const StaleGmailSelection: Story = { args: { ...Gmail.args, gmailAccess: 'upgrade-required' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('radio', { name: copy.gmail.title })).toBeChecked();
  await expect(c.getByRole('radio', { name: copy.gmail.title })).toBeDisabled();
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stale);
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const LoadingAccess: Story = { args: { gmailAccess: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('radio', { name: copy.gmail.title })).toBeDisabled();
  await expect(c.getByRole('radio', { name: copy.website.title })).toBeEnabled();
  await expect(c.getByRole('status')).toHaveTextContent(copy.loading);
} };
export const GmailUnavailable: Story = { args: { ...Gmail.args, gmailAccess: 'unavailable' } };
export const ReadOnly: Story = { args: { ...Website.args, canEdit: false, gmailAccess: 'upgrade-required' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('textbox')).toBeDisabled();
  for (const radio of c.getAllByRole('radio')) await expect(radio).toBeDisabled();
  await expect(c.queryByRole('button', { name: copy.plans })).not.toBeInTheDocument();
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { ...Website.args, pending: true, gmailAccess: 'upgrade-required' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('textbox')).toBeDisabled();
  for (const radio of c.getAllByRole('radio')) await expect(radio).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.plans })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.plans }));
  await expect(args.onReviewPlans).not.toHaveBeenCalled();
} };
export const PermissionDenied: Story = { args: { ...Website.args, canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.forbidden);
  await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
  await expect(c.queryByRole('radio')).not.toBeInTheDocument();
} };
export const ValidationErrors: Story = { args: { errors: { name: copy.stories.nameError, source: copy.stories.sourceError } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  await expect(c.getByText(copy.stories.nameError)).toBeVisible();
  await expect(c.getByRole('alert')).toHaveTextContent(copy.stories.sourceError);
} };
export const NameLimit: Story = { play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByRole('textbox');
  await userEvent.type(input, 'a'.repeat(81));
  await expect(input).toHaveValue('a'.repeat(80));
} };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), user = userEvent.setup({ document: canvasElement.ownerDocument });
  const website = c.getByRole('radio', { name: copy.website.title });
  website.focus(); await user.keyboard(' '); await expect(website).toBeChecked();
  await user.keyboard('{ArrowRight}');
  await expect(c.getByRole('radio', { name: copy.gmail.title })).toBeChecked();
  await expect(args.onChange).toHaveBeenLastCalledWith({ name: '', source: 'gmail' });
} };
export const LongName: Story = { args: { value: { name: copy.stories.longName, source: 'website' } } };
export const Narrow: Story = { args: { ...Website.args }, globals: { viewport: { value: 'phone', isRotated: false } } };
