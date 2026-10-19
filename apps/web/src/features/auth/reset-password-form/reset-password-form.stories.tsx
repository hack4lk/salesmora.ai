import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ResetPasswordForm, type ResetPasswordFormProps } from './reset-password-form';
import { resetPasswordFormData as copy } from './reset-password-form.data';
const meta = {
  title: 'Auth/ResetPasswordForm', component: ResetPasswordForm,
  args: { onSubmit: fn<ResetPasswordFormProps['onSubmit']>(async () => ({ ok: true })) },
  decorators: [(Story) => <div className="mx-auto w-full max-w-form p-6"><Story /></div>],
} satisfies Meta<typeof ResetPasswordForm>;
export default meta;
type Story = StoryObj<typeof meta>;
async function fill(canvasElement: HTMLElement, password = copy.stories.password) {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByLabelText(copy.password, { selector: 'input', exact: false }), password);
  await userEvent.type(canvas.getByLabelText(copy.confirmation, { selector: 'input', exact: false }), password);
  return canvas;
}
export const Default: Story = {};
export const Required: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByLabelText(copy.password, { selector: 'input', exact: false })).toHaveFocus();
  await expect(canvas.getByText(copy.errors.password)).toBeVisible();
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const Mismatch: Story = { play: async ({ canvasElement, args }) => {
  const canvas = await fill(canvasElement);
  await userEvent.type(canvas.getByLabelText(copy.confirmation, { selector: 'input', exact: false }), 'different');
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByText(copy.errors.confirmation)).toBeVisible();
  await expect(args.onSubmit).not.toHaveBeenCalled();
} };
export const Pending: Story = {
  args: { onSubmit: fn<ResetPasswordFormProps['onSubmit']>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.dblClick(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('button', { name: copy.pending })).toBeDisabled();
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
export const ServerError: Story = {
  args: { onSubmit: fn<ResetPasswordFormProps['onSubmit']>(async () => ({ ok: false })) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.errors.submission);
  },
};
export const InvalidLink: Story = {
  args: { onSubmit: fn<ResetPasswordFormProps['onSubmit']>(async () => ({ ok: false, reason: 'invalid-link' })) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.errors.invalidLink);
    await expect(canvas.getByRole('link', { name: copy.requestLink })).toHaveAttribute('href', copy.requestHref);
  },
};
export const Success: Story = { play: async ({ canvasElement, args }) => {
  const canvas = await fill(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
  await expect(canvas.getByRole('status')).toHaveAccessibleDescription(copy.success);
  await expect(canvas.getByLabelText(copy.password, { selector: 'input', exact: false })).toHaveValue('');
  await expect(args.onSubmit).toHaveBeenCalledWith(copy.stories.password);
} };
export const Keyboard: Story = { play: async ({ canvasElement }) => {
  const canvas = await fill(canvasElement);
  await userEvent.keyboard('{Enter}');
  await expect(canvas.getByRole('status')).toBeVisible();
} };
