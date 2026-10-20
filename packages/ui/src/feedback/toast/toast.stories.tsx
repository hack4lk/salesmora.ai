import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Toast, type ToastProps } from './toast';
import { toastData as copy } from './toast.data';

function Preview(args: ToastProps) {
  const [open, setOpen] = useState(args.open);
  const [resolved, setResolved] = useState(false);
  const origin = useRef<HTMLButtonElement>(null);
  return <main className="min-h-screen bg-canvas p-6 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1>
    <p className="mb-6 mt-3 text-muted">{copy.stories.description}</p>
    <button type="button" ref={origin} onClick={() => { setResolved(false); setOpen(true); }}
      className="min-h-11 cursor-pointer rounded-xl bg-primary px-5 py-3 font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{copy.stories.show}</button>
    <Toast {...args} open={open} returnFocusRef={origin} kind={resolved ? 'success' : args.kind} title={resolved ? copy.titles.success : args.title}
      message={resolved ? args.kind === 'conflict' ? copy.stories.reloaded : copy.stories.retried : args.message}
      action={!resolved && args.action ? { ...args.action, onClick: () => { args.action?.onClick(); setResolved(true); } } : undefined}
      onClose={() => { args.onClose(); setOpen(false); }}/>
  </main>;
}
const meta = { title: 'Feedback/Toast', component: Preview, parameters: { layout: 'fullscreen' },
  args: { open: true, kind: 'success', message: copy.stories.success, autoHideMs: null, onClose: fn() },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Success: Story = {};
export const Error: Story = { args: { kind: 'error', message: copy.stories.error } };
export const Conflict: Story = { args: { kind: 'conflict', message: copy.stories.conflict, action: { label: copy.stories.reload, onClick: fn() } } };
export const WithRetry: Story = { args: { ...Error.args, action: { label: copy.stories.retry, onClick: fn() } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.stories.retry }));
  await expect(args.action?.onClick).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('status')).toHaveTextContent(copy.stories.retried);
} };
export const Pending: Story = { args: { ...Error.args, action: { label: copy.stories.retry, onClick: fn(), pending: true } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('button', { name: copy.close })).toBeDisabled();
  await expect(c.getByRole('button', { name: copy.pending })).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  await expect(args.onClose).not.toHaveBeenCalled();
} };
export const LongMessage: Story = { args: { ...Conflict.args, message: copy.stories.long } };
export const Narrow: Story = { ...LongMessage, parameters: { viewport: { value: 'mobile1' } } };
export const Dismiss: Story = { args: { open: false }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.stories.show }));
  const close = c.getByRole('button', { name: copy.close });
  close.focus();
  await userEvent.keyboard('{Enter}');
  await expect(args.onClose).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('button', { name: copy.stories.show })).toHaveFocus();
} };
export const AutoDismiss: Story = { args: { message: copy.stories.timer, autoHideMs: 1500 }, play: async ({ canvasElement, args }) => {
  await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1), { timeout: 4000 });
  await waitFor(() => expect(within(canvasElement).queryByRole('status')).not.toBeInTheDocument());
} };
