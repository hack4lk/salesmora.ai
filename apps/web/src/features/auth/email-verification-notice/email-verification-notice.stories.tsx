import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { EmailVerificationNotice, type EmailVerificationNoticeProps } from './email-verification-notice';
import { emailVerificationNoticeData as copy } from './email-verification-notice.data';
const meta = {
  title: 'Auth/EmailVerificationNotice', component: EmailVerificationNotice,
  args: { email: copy.stories.email, onResend: fn<EmailVerificationNoticeProps['onResend']>(async () => ({ ok: true })) },
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="mx-auto grid w-full max-w-form gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p></header><Story /></main>],
} satisfies Meta<typeof EmailVerificationNotice>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText(copy.stories.email)).toBeVisible();
  await expect(c.getByRole('button', { name: copy.resend })).toBeEnabled();
  await expect(args.onResend).not.toHaveBeenCalled();
} };
export const Pending: Story = { args: { onResend: fn<EmailVerificationNoticeProps['onResend']>(() => new Promise(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.dblClick(c.getByRole('button', { name: copy.resend }));
  await expect(c.getByRole('button', { name: copy.sending })).toBeDisabled();
  await expect(c.getByRole('form')).toHaveAttribute('aria-busy', 'true');
  await expect(args.onResend).toHaveBeenCalledTimes(1);
} };
export const Sent: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.resend }));
  await expect(c.getByRole('status')).toHaveAccessibleDescription(copy.sent);
  await expect(c.getByRole('button', { name: copy.resend })).toBeDisabled();
  await expect(args.onResend).toHaveBeenCalledWith();
} };
export const ServerError: Story = { args: { onResend: fn<EmailVerificationNoticeProps['onResend']>().mockResolvedValue({ ok: false }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.resend }));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.error);
  await expect(c.getByRole('button', { name: copy.resend })).toBeEnabled();
} };
export const NetworkError: Story = { args: { onResend: fn<EmailVerificationNoticeProps['onResend']>().mockRejectedValue(new Error(copy.stories.transportError)) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.resend }));
  await expect(c.getByRole('alert')).toHaveAccessibleDescription(copy.error);
  await expect(c.getByRole('button', { name: copy.resend })).toBeEnabled();
} };
export const Retry: Story = { args: { onResend: fn<EmailVerificationNoticeProps['onResend']>().mockResolvedValueOnce({ ok: false }).mockResolvedValue({ ok: true }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.resend }));
  await expect(c.getByRole('alert')).toBeVisible();
  await userEvent.click(c.getByRole('button', { name: copy.resend }));
  await expect(c.queryByRole('alert')).not.toBeInTheDocument();
  await expect(c.getByRole('status')).toBeVisible();
  await expect(args.onResend).toHaveBeenCalledTimes(2);
} };
export const RateLimited: Story = { args: { onResend: fn<EmailVerificationNoticeProps['onResend']>().mockResolvedValue({ ok: false, reason: 'rate-limited', retryAfterSeconds: 60 }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.resend }));
  await expect(c.getByRole('alert')).toHaveAccessibleName(copy.limitedTitle);
  await expect(c.getByRole('button', { name: copy.resend })).toBeDisabled();
} };
export const CooldownExpires: Story = { args: { onResend: fn<EmailVerificationNoticeProps['onResend']>().mockResolvedValue({ ok: true, retryAfterSeconds: 1 }) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.resend }));
  await expect(c.getByRole('button', { name: copy.resend })).toBeDisabled();
  await waitFor(() => expect(c.getByRole('button', { name: copy.resend })).toBeEnabled(), { timeout: 3000 });
  await userEvent.click(c.getByRole('button', { name: copy.resend }));
  await expect(args.onResend).toHaveBeenCalledTimes(2);
} };
export const Keyboard: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  c.getByRole('button', { name: copy.resend }).focus();
  await userEvent.keyboard('{Enter}');
  await expect(c.getByRole('status')).toBeVisible();
  await expect(args.onResend).toHaveBeenCalledTimes(1);
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.resend })).toBeDisabled();
  await expect(args.onResend).not.toHaveBeenCalled();
} };
export const Verified: Story = { args: { verified: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveAccessibleDescription(copy.verified);
  await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(args.onResend).not.toHaveBeenCalled();
} };
export const Mobile: Story = { args: { email: copy.stories.longEmail }, globals: { viewport: { value: 'phone', isRotated: false } } };
