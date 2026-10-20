import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LoginForm, type LoginFormProps } from './login-form';
import { loginFormData as copy } from './login-form.data';

const meta = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  decorators: [(Story) => <main className="w-full max-w-form p-6"><p className="mb-6 text-sm leading-6 text-muted">{copy.stories.preview}</p><Story /></main>],
  args: {
    onSubmit: fn<LoginFormProps['onSubmit']>(async () => ({ ok: true })),
    forgotPasswordHref: copy.stories.forgotPasswordHref,
    onForgotPasswordClick: fn((event) => event.preventDefault()),
    successMessage: copy.stories.success,
  },
} satisfies Meta<typeof LoginForm>;
export default meta;
type Story = StoryObj<typeof meta>;

async function fill(canvasElement: HTMLElement, email: string = copy.stories.email, password: string = copy.stories.password) {
  const canvas = within(canvasElement);
  if (email) await userEvent.type(canvas.getByRole('textbox', { name: /Work email/ }), email);
  if (password) await userEvent.type(canvas.getByLabelText(copy.labels.password, { selector: 'input', exact: false }), password);
  return canvas;
}

export const Default: Story = {};
export const RequiredValidation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('textbox')).toHaveFocus();
    await expect(canvas.getByText(copy.errors.email)).toBeVisible();
    await expect(canvas.getByText(copy.errors.password)).toBeVisible();
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
export const PasswordRequired: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement, copy.stories.email, '');
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByLabelText(copy.labels.password, { selector: 'input', exact: false })).toHaveFocus();
    await expect(canvas.getByText(copy.errors.password)).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const Pending: Story = {
  args: { onSubmit: fn<LoginFormProps['onSubmit']>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.dblClick(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('form')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('button', { name: copy.pending })).toBeDisabled();
    await expect(canvas.getByRole('textbox')).toBeDisabled();
    await expect(canvas.getByLabelText(copy.labels.password, { selector: 'input', exact: false })).toBeDisabled();
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
export const ServerError: Story = {
  args: { onSubmit: fn<LoginFormProps['onSubmit']>(async () => ({ ok: false })) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.errors.submission);
    await expect(canvas.getByRole('textbox')).toHaveValue(copy.stories.email);
    await expect(canvas.getByLabelText(copy.labels.password, { selector: 'input', exact: false })).toHaveValue(copy.stories.password);
    await expect(canvas.getByRole('button', { name: copy.submit })).toBeEnabled();
  },
};
export const ThrownError: Story = {
  args: { onSubmit: fn<LoginFormProps['onSubmit']>(async () => { throw new Error('Mock transport failure'); }) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.errors.submission);
    await expect(canvas.getByRole('button', { name: copy.submit })).toBeEnabled();
  },
};
export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('status')).toHaveAccessibleDescription(copy.stories.success);
    await expect(canvas.getByLabelText(copy.labels.password, { selector: 'input', exact: false })).toHaveValue('');
    await expect(canvas.getByRole('button', { name: copy.submit })).toBeDisabled();
  },
};
export const Retry: Story = {
  args: { onSubmit: fn<LoginFormProps['onSubmit']>().mockResolvedValueOnce({ ok: false }).mockResolvedValue({ ok: true }) },
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
    const canvas = await fill(canvasElement, copy.stories.spacedEmail, copy.stories.spacedPassword);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ email: copy.stories.spacedEmail.trim().toLowerCase(), password: copy.stories.spacedPassword });
  },
};
export const ExistingPassword: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement, copy.stories.email, copy.stories.existingPassword);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ email: copy.stories.email, password: copy.stories.existingPassword });
    await expect(canvas.getByRole('status')).toBeVisible();
  },
};
export const ValidationRecovery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await fill(canvasElement);
    await expect(canvas.queryByText(copy.errors.email)).not.toBeInTheDocument();
    await expect(canvas.queryByText(copy.errors.password)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('status')).toBeVisible();
  },
};
export const RecoveryLink: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: copy.forgotPassword });
    await expect(link).toHaveAttribute('href', copy.stories.forgotPasswordHref);
    await userEvent.click(link);
    await expect(args.onForgotPasswordClick).toHaveBeenCalledTimes(1);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
