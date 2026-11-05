import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureFormContentEditor, type CaptureFormContentEditorProps } from './capture-form-content-editor';
import { captureFormContentEditorData as copy } from './capture-form-content-editor.data';
import { captureFormPreviewExample } from '../capture-form-preview/capture-form-preview.data';
function Preview(args: CaptureFormContentEditorProps) {
  const [value, setValue] = useState(args.value);
  return <main className="min-h-screen bg-canvas p-4 sm:p-8"><CaptureFormContentEditor {...args} value={value} onChange={next => { args.onChange(next); setValue(next); }} /></main>;
}
const meta = {
  title: 'Lead Capture/CaptureFormContentEditor', component: CaptureFormContentEditor, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value: { title: captureFormPreviewExample.title, intro: captureFormPreviewExample.intro!, unavailableMessage: captureFormPreviewExample.unavailableMessage!, showBusinessEmail: true, showBusinessPhone: true }, canRead: true, canEdit: true, onChange: fn() },
} satisfies Meta<typeof CaptureFormContentEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const EditText: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), title = c.getByRole('textbox', { name: copy.title }), intro = c.getByRole('textbox', { name: copy.intro });
  await userEvent.clear(title); await userEvent.type(title, copy.stories.updatedTitle);
  await userEvent.clear(intro); await userEvent.type(intro, copy.stories.updatedIntro);
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...args.value, title: copy.stories.updatedTitle, intro: copy.stories.updatedIntro });
} };
export const EmptyTitle: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), title = c.getByRole('textbox', { name: copy.title });
  await userEvent.clear(title); await userEvent.type(title, '   '); await userEvent.tab();
  await expect(title).toHaveAttribute('aria-invalid', 'true');
  await expect(c.getByText(copy.titleError)).toBeVisible();
} };
export const OptionalIntroduction: Story = { play: async ({ canvasElement, args }) => {
  await userEvent.clear(within(canvasElement).getByRole('textbox', { name: copy.intro }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...args.value, intro: '' });
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  for (const input of [...within(canvasElement).getAllByRole('textbox'), ...within(canvasElement).getAllByRole('checkbox')]) await expect(input).toBeDisabled();
  await expect(args.onChange).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { canEdit: false }, play: async ({ canvasElement }) => {
  for (const input of [...within(canvasElement).getAllByRole('textbox'), ...within(canvasElement).getAllByRole('checkbox')]) await expect(input).toBeDisabled();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
  await expect(c.queryByText(captureFormPreviewExample.title)).not.toBeInTheDocument();
} };
export const Narrow: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } };

export const EditPausedMessage: Story = { play: async ({ canvasElement, args }) => {
  const input = within(canvasElement).getByRole('textbox', { name: copy.paused });
  await userEvent.clear(input); await userEvent.type(input, copy.stories.updatedPaused);
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...args.value, unavailableMessage: copy.stories.updatedPaused });
} };

export const TogglePausedContacts: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('checkbox', { name: copy.showBusinessEmail }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...args.value, showBusinessEmail: false });
  await userEvent.click(c.getByRole('checkbox', { name: copy.showBusinessPhone }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...args.value, showBusinessEmail: false, showBusinessPhone: false });
} };
