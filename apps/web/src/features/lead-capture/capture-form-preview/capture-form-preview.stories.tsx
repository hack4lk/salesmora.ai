import { useState } from 'react';
import { CaptureFormContentEditor } from '../capture-form-content-editor/capture-form-content-editor';
import { captureFormContentEditorData as textCopy } from '../capture-form-content-editor/capture-form-content-editor.data';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CaptureFormPreview, type CaptureFormPreviewProps } from './capture-form-preview';
import { captureFormPreviewData as copy, captureFormPreviewExample as definition } from './capture-form-preview.data';
import { visitorCaptureFormData as visitorCopy } from '../visitor-capture-form/visitor-capture-form.data';

const meta = {
  title: 'Lead Capture/CaptureFormPreview', component: CaptureFormPreview, parameters: { layout: 'fullscreen' },
  args: { definition, canRead: true },
  render: args => <main className="min-h-screen bg-canvas p-3 sm:p-8"><CaptureFormPreview {...args} /></main>,
} satisfies Meta<typeof CaptureFormPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
async function fillAndSubmit(canvasElement: HTMLElement) {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('textbox', { name: 'Name' }), copy.stories.name);
  await userEvent.type(c.getByRole('textbox', { name: 'Email (optional)' }), copy.stories.email);
  await userEvent.type(c.getByRole('textbox', { name: 'Service needed' }), copy.stories.service);
  await userEvent.click(c.getByRole('button', { name: visitorCopy.submit }));
  await expect(await c.findByRole('status')).toHaveTextContent(definition.thankYou!);
}
function EditableDraft(args: CaptureFormPreviewProps) {
  const [content, setContent] = useState({ title: args.definition.title, intro: args.definition.intro ?? '', unavailableMessage: args.definition.unavailableMessage ?? '', showBusinessEmail: args.definition.showBusinessEmail !== false, showBusinessPhone: args.definition.showBusinessPhone !== false });
  return <main className="grid min-h-screen items-start gap-6 bg-canvas p-3 lg:grid-cols-2 sm:p-8">
    <CaptureFormContentEditor value={content} onChange={setContent} canRead={args.canRead} canEdit />
    <CaptureFormPreview {...args} definition={{ ...args.definition, ...content }} />
  </main>;
}
export const Default: Story = { render: args => <EditableDraft {...args} /> };
export const EditableText: Story = { render: args => <EditableDraft {...args} />, play: async ({ canvasElement }) => {
  const c = within(canvasElement), title = c.getByRole('textbox', { name: textCopy.title }), intro = c.getByRole('textbox', { name: textCopy.intro });
  await userEvent.clear(title); await userEvent.type(title, textCopy.stories.updatedTitle);
  await userEvent.clear(intro); await userEvent.type(intro, textCopy.stories.updatedIntro);
  await expect(c.getByRole('heading', { name: textCopy.stories.updatedTitle })).toBeVisible();
  await expect(c.getByText(textCopy.stories.updatedIntro, { selector: 'p' })).toBeVisible();
  await userEvent.clear(intro);
  await expect(c.queryByText(textCopy.stories.updatedIntro, { selector: 'p' })).not.toBeInTheDocument();
  await expect(c.getByRole('button', { name: visitorCopy.submit })).toBeVisible();
} };
export const Mobile: Story = { args: { initialViewport: 'mobile' } };
export const SwitchViewport: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('textbox', { name: 'Name' }), copy.stories.name);
  await userEvent.click(c.getByRole('button', { name: copy.mobile }));
  await expect(c.getByRole('button', { name: copy.mobile })).toHaveAttribute('aria-pressed', 'true');
  await expect(c.getByRole('textbox', { name: 'Name' })).toHaveValue(copy.stories.name);
  await userEvent.click(c.getByRole('button', { name: copy.desktop }));
  await expect(c.getByRole('textbox', { name: 'Name' })).toHaveValue(copy.stories.name);
} };
export const TestSubmission: Story = { play: async ({ canvasElement }) => { await fillAndSubmit(canvasElement); } };
export const ResetTest: Story = { play: async ({ canvasElement }) => {
  await fillAndSubmit(canvasElement);
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.reset }));
  await expect(c.getByRole('textbox', { name: 'Name' })).toHaveValue('');
  await expect(c.queryByRole('status')).not.toBeInTheDocument();
} };
export const PausedPreview: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.state }), 'paused');
  await expect(await c.findByRole('status')).toHaveTextContent(definition.unavailableMessage!);
  await expect(c.getByText(definition.businessEmail!)).toBeVisible();
  await expect(c.queryByRole('button', { name: visitorCopy.submit })).not.toBeInTheDocument();
} };
export const ResumePreview: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await fillAndSubmit(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.state }), 'paused');
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.state }), 'active');
  await expect(c.getByRole('textbox', { name: 'Name' })).toHaveValue('');
} };
function ChangingDraft(args: CaptureFormPreviewProps) {
  const [changed, setChanged] = useState(false);
  return <main className="grid min-h-screen gap-4 bg-canvas p-3 sm:p-8"><button type="button" className="min-h-11 justify-self-start rounded-xl border border-line bg-paper px-4 focus-visible:focus-ring" onClick={() => setChanged(true)}>{copy.stories.change}</button><CaptureFormPreview {...args} definition={{ ...args.definition, title: changed ? copy.stories.updatedTitle : args.definition.title }} /></main>;
}
export const DraftChange: Story = { render: args => <ChangingDraft {...args} />, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await fillAndSubmit(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.stories.change }));
  await expect(c.getByRole('heading', { name: copy.stories.updatedTitle })).toBeVisible();
  await expect(c.getByRole('textbox', { name: 'Name' })).toHaveValue('');
  await expect(c.queryByRole('status')).not.toBeInTheDocument();
} };
export const InvalidDraft: Story = { args: { definition: { ...definition, fields: [] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.invalid)).toBeVisible();
  await expect(c.queryByRole('button', { name: visitorCopy.submit })).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.denied)).toBeVisible();
  await expect(c.queryByText(definition.businessName)).not.toBeInTheDocument();
  await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
} };
export const LongContent: Story = { args: { definition: { ...definition, businessName: definition.businessName.repeat(8), title: definition.title.repeat(8), intro: definition.intro!.repeat(8) } } };
export const Narrow: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } }, args: { initialViewport: 'mobile' } };

export const EditablePausedMessage: Story = { render: args => <EditableDraft {...args} />, play: async ({ canvasElement }) => {
  const c = within(canvasElement), input = c.getByRole('textbox', { name: textCopy.paused });
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.state }), 'paused');
  await userEvent.clear(input); await userEvent.type(input, textCopy.stories.updatedPaused);
  await expect(c.getByRole('status')).toHaveTextContent(textCopy.stories.updatedPaused);
  await expect(c.getByText(definition.businessEmail!)).toBeVisible();
  await expect(c.queryByRole('button', { name: visitorCopy.submit })).not.toBeInTheDocument();
  await userEvent.clear(input); await userEvent.type(input, '   ');
  await expect(c.getByRole('status')).toHaveTextContent(visitorCopy.unavailable);
} };

export const OptionalPausedContacts: Story = { render: args => <EditableDraft {...args} />, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  const email = c.getByRole('checkbox', { name: textCopy.showBusinessEmail }), phone = c.getByRole('checkbox', { name: textCopy.showBusinessPhone });
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.state }), 'paused');
  await expect(c.getByText(definition.businessEmail!)).toBeVisible();
  await expect(c.getByText(definition.businessPhone!)).toBeVisible();
  await userEvent.click(email);
  await expect(c.queryByText(definition.businessEmail!)).not.toBeInTheDocument();
  await expect(c.getByText(definition.businessPhone!)).toBeVisible();
  await userEvent.click(phone);
  await expect(c.queryByText(definition.businessPhone!)).not.toBeInTheDocument();
  await expect(c.getByRole('status')).toHaveTextContent(definition.unavailableMessage!);
  await userEvent.click(email);
  await expect(c.getByText(definition.businessEmail!)).toBeVisible();
  await expect(c.queryByText(definition.businessPhone!)).not.toBeInTheDocument();
  await userEvent.click(phone);
  await expect(c.getByText(definition.businessPhone!)).toBeVisible();
  await userEvent.click(email); await userEvent.click(phone);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.state }), 'active');
  await expect(c.getByRole('textbox', { name: 'Email (optional)' })).toBeVisible();
  await expect(c.getByRole('textbox', { name: 'Phone (optional)' })).toBeVisible();
} };
