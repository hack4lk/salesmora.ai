import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PasswordRecoveryForm, type PasswordRecoveryFormProps } from './password-recovery-form';
import { passwordRecoveryFormData as copy } from './password-recovery-form.data';

const meta = {
  title: 'Auth/PasswordRecoveryForm',
  component: PasswordRecoveryForm,
  decorators: [(Story) => <main className="w-full max-w-form p-6"><p className="mb-6 text-sm leading-6 text-muted">{copy.stories.preview}</p><Story /></main>],
  args: { onSubmit: fn<PasswordRecoveryFormProps['onSubmit']>(async () => ({ ok: true })) },
} satisfies Meta<typeof PasswordRecoveryForm>;
export default meta;
type Story = StoryObj<typeof meta>;

async function fill(canvasElement: HTMLElement, email: string = copy.stories.email) {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox', { name: /Work email/ }), email);
  return canvas;
}

export const Default: Story = {};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeDisabled();
    await expect(canvas.getByRole('button', { name: copy.submit })).toBeDisabled();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const RequiredValidation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('textbox')).toHaveFocus();
    await expect(canvas.getByRole('textbox')).toHaveAccessibleDescription(copy.errors.email);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const InvalidEmail: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement, copy.stories.invalidEmail);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('textbox')).toHaveAccessibleDescription(copy.errors.email);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const Pending: Story = {
  args: { onSubmit: fn<PasswordRecoveryFormProps['onSubmit']>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.dblClick(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('form')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('textbox')).toBeDisabled();
    await expect(canvas.getByRole('button', { name: copy.pending })).toBeDisabled();
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
export const ServerError: Story = {
  args: { onSubmit: fn<PasswordRecoveryFormProps['onSubmit']>(async () => ({ ok: false })) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.errors.submission);
    await expect(canvas.getByRole('textbox')).toHaveValue(copy.stories.email);
    await expect(canvas.getByRole('button', { name: copy.submit })).toBeEnabled();
  },
};
export const ThrownError: Story = {
  args: { onSubmit: fn<PasswordRecoveryFormProps['onSubmit']>(async () => { throw new Error('Mock transport failure'); }) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.errors.submission);
    await expect(canvas.getByRole('textbox')).toHaveValue(copy.stories.email);
    await expect(canvas.getByRole('button', { name: copy.submit })).toBeEnabled();
  },
};
export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('status')).toHaveAccessibleName(copy.successTitle);
    await expect(canvas.getByRole('status')).toHaveAccessibleDescription(copy.success);
    await expect(canvas.getByRole('button', { name: copy.submit })).toBeDisabled();
  },
};
export const Retry: Story = {
  args: { onSubmit: fn<PasswordRecoveryFormProps['onSubmit']>().mockResolvedValueOnce({ ok: false }).mockResolvedValue({ ok: true }) },
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('alert')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(args.onSubmit).toHaveBeenCalledTimes(2);
  },
};
export const KeyboardSubmit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
export const NormalizedSubmission: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement, copy.stories.spacedEmail);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ email: copy.stories.spacedEmail.trim().toLowerCase() });
  },
};
export const ValidationRecovery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await fill(canvasElement);
    await expect(canvas.queryByText(copy.errors.email)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('status')).toBeVisible();
  },
};
