import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { GmailEmailExample, type GmailEmailExampleProps } from './gmail-email-example';
import { gmailEmailExampleData as copy } from './gmail-email-example.data';
import { gmailSamplePickerData as pickerCopy } from '../gmail-sample-picker/gmail-sample-picker.data';
const filled = { subject: copy.stories.subject, body: copy.stories.body };
function Preview(args: GmailEmailExampleProps) {
  const [value, setValue] = useState(args.value), [complete, setComplete] = useState(false);
  return <main className="min-h-screen bg-canvas p-4 sm:p-8"><p className="mx-auto mb-6 mt-0 max-w-3xl text-sm leading-6 text-muted">{copy.stories.description}</p>
    <GmailEmailExample {...args} mailbox={args.mailbox ? { ...args.mailbox, onUse: async sample => { await args.mailbox!.onUse(sample); setValue({ subject: sample.subject, body: sample.body }); setComplete(false); } } : undefined} value={value} onChange={next => { args.onChange(next); setValue(next); setComplete(false); }} onExtract={async snapshot => { await args.onExtract(snapshot); setComplete(true); }} />
    {complete && <p role="status" className="mx-auto mb-0 mt-6 max-w-3xl rounded-xl border border-line bg-paper p-4 text-sm text-muted">{copy.stories.completed}</p>}
  </main>;
}
const meta = {
  title: 'Lead Capture/GmailEmailExample', component: GmailEmailExample, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value: { subject: '', body: '' }, canRead: true, canEdit: true, onChange: fn<GmailEmailExampleProps['onChange']>(), onExtract: fn<GmailEmailExampleProps['onExtract']>(async () => { await new Promise(resolve => setTimeout(resolve, 800)); }) },
} satisfies Meta<typeof GmailEmailExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Filled: Story = { args: { value: filled } };
export const Extract: Story = { args: { value: filled }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.extract }));
  await expect(args.onExtract).toHaveBeenCalledWith(filled);
  await expect(await c.findByText(copy.stories.completed)).toBeVisible();
} };
export const Extracting: Story = { args: { value: filled, pending: true }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.extracting);
  for (const input of c.getAllByRole('textbox')) await expect(input).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.extracting })).toBeDisabled();
} };
export const PreventDuplicateExtraction: Story = { args: { value: filled, onExtract: fn<GmailEmailExampleProps['onExtract']>(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.extract }));
  await expect(c.getByRole('button', { name: copy.extracting })).toBeDisabled();
  fireEvent.submit(c.getByRole('form'));
  await expect(args.onExtract).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('textbox', { name: copy.body })).toHaveValue(filled.body);
} };
export const ExtractionFailure: Story = { args: { value: filled, onExtract: fn<GmailEmailExampleProps['onExtract']>(async () => { throw new Error('Simulated extraction failure'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.extract }));
  await expect(await c.findByRole('alert')).toHaveTextContent(copy.failure);
  await expect(c.getByRole('textbox', { name: copy.body })).toHaveValue(filled.body);
  await waitFor(async () => { await expect(c.getByRole('alert').parentElement).toHaveFocus(); });
} };
export const RetryExtraction: Story = { args: { value: filled }, play: async ({ canvasElement, args }) => {
  args.onExtract.mockRejectedValueOnce(new Error('Simulated failure')).mockResolvedValueOnce(undefined);
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.extract }));
  await expect(await c.findByRole('alert')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.extract }));
  await expect(await c.findByText(copy.stories.completed)).toBeVisible();
  await expect(args.onExtract).toHaveBeenCalledTimes(2);
} };
export const BodyRequired: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.extract }));
  const body = c.getByRole('textbox', { name: copy.body });
  await expect(body).toHaveAttribute('aria-invalid', 'true');
  await waitFor(async () => { await expect(body).toHaveFocus(); });
  await expect(args.onExtract).not.toHaveBeenCalled();
} };
export const SubjectOptional: Story = { args: { value: { ...filled, subject: '' } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.extract }));
  await expect(args.onExtract).toHaveBeenCalledWith({ ...filled, subject: '' });
} };
export const PreservePastedText: Story = { args: { value: { subject: '  Inquiry  ', body: `  ${filled.body}\n\n` } }, play: async ({ canvasElement, args }) => {
  await userEvent.click(within(canvasElement).getByRole('button', { name: copy.extract }));
  await expect(args.onExtract).toHaveBeenCalledWith(args.value);
} };
export const TooLong: Story = { args: { value: { subject: 'x'.repeat(501), body: 'x'.repeat(20001) } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.extract }));
  await expect(c.getByText(copy.errors.subject)).toBeVisible();
  await expect(c.getByText(copy.errors.length)).toBeVisible();
  await expect(c.getByRole('textbox', { name: copy.body })).toHaveValue(args.value.body);
  await expect(args.onExtract).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { value: filled, canEdit: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  for (const input of c.getAllByRole('textbox')) await expect(input).toBeDisabled();
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { value: filled, canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('alert')).toHaveTextContent(copy.denied);
  await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
  await expect(c.queryByText(filled.body)).not.toBeInTheDocument();
} };
export const Narrow: Story = { args: { value: filled }, globals: { viewport: { value: 'mobile1', isRotated: false } } };
const message = { id: 'fictional-message', subject: filled.subject, body: filled.body, sender: 'Alex Morgan <alex@example.com>', receivedAt: '2026-11-04T12:00:00Z' };
const mailbox = { bindingKey: 'fictional-draft:account:version', accountEmail: 'pilot@example.com', connected: true,
  onSearch: fn(async () => [{ id: message.id, subject: message.subject, sender: message.sender, receivedAt: message.receivedAt }]),
  onPreview: fn(async () => message), onUse: fn(async () => {}) };
export const MailboxExampleThenExtraction: Story = { args: { mailbox }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.type(c.getByRole('textbox', { name: pickerCopy.searchLabel }), 'water heater');
  await userEvent.click(c.getByRole('button', { name: pickerCopy.search }));
  await userEvent.click(await c.findByRole('button', { name: `${pickerCopy.preview}: ${message.subject}` }));
  await userEvent.click(await c.findByRole('button', { name: pickerCopy.use }));
  await expect(c.getByRole('textbox', { name: copy.body })).toHaveValue(filled.body);
  await expect(args.onExtract).not.toHaveBeenCalled();
  await userEvent.click(c.getByRole('button', { name: copy.extract }));
  await expect(args.onExtract).toHaveBeenCalledWith(filled);
} };
export const PasteWhenMailboxDisconnected: Story = { args: { value: filled, mailbox: { ...mailbox, connected: false } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText(pickerCopy.reconnect)).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.extract }));
  await expect(args.onExtract).toHaveBeenCalledWith(filled);
} };
