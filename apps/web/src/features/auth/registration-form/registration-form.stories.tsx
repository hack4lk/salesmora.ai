import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RegistrationForm, type RegistrationFormProps } from './registration-form';
import { registrationFormData as copy } from './registration-form.data';

const meta = {
  title: 'Auth/RegistrationForm',
  component: RegistrationForm,
  decorators: [(Story) => <main className="w-full max-w-form p-6"><p className="mb-6 text-sm leading-6 text-muted">{copy.stories.preview}</p><Story /></main>],
  args: {
    onSubmit: fn<RegistrationFormProps['onSubmit']>(async () => ({ ok: true as const })),
    termsHref: copy.stories.termsHref, privacyHref: copy.stories.privacyHref,
    onTermsClick: fn((event) => event.preventDefault()), onPrivacyClick: fn((event) => event.preventDefault()),
    successMessage: copy.stories.success,
  },
} satisfies Meta<typeof RegistrationForm>;
export default meta;
type Story = StoryObj<typeof meta>;

async function fill(canvasElement: HTMLElement, overrides: Partial<{ email: string; password: string; confirmPassword: string }> = {}) {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox', { name: /Your name/ }), copy.stories.name);
  await userEvent.type(canvas.getByRole('textbox', { name: /Work email/ }), overrides.email ?? copy.stories.email);
  await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), overrides.password ?? copy.stories.password);
  await userEvent.type(canvas.getByLabelText(copy.labels.confirmPassword, { exact: false, selector: 'input' }), overrides.confirmPassword ?? copy.stories.password);
  await userEvent.click(canvas.getByRole('checkbox'));
  return canvas;
}

export const Default: Story = {};
export const RequiredValidation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('textbox', { name: /Your name/ })).toHaveFocus();
    for (const message of [copy.errors.name, copy.errors.email, copy.errors.password, copy.errors.confirmPassword, copy.errors.termsAccepted]) await expect(canvas.getByText(message)).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const InvalidEmail: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement, { email: copy.stories.invalidEmail });
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('textbox', { name: /Work email/ })).toHaveAccessibleDescription(copy.errors.email);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const ShortPassword: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement, { password: copy.stories.shortPassword, confirmPassword: copy.stories.shortPassword });
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByText(copy.errors.password)).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const PasswordMismatch: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement, { confirmPassword: copy.stories.otherPassword });
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByText(copy.errors.confirmPassword)).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const Pending: Story = {
  args: { onSubmit: fn<RegistrationFormProps['onSubmit']>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.dblClick(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('button', { name: copy.pending })).toBeDisabled();
    await expect(canvas.getByRole('form')).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('textbox', { name: /Your name/ })).toBeDisabled();
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
export const ServerError: Story = {
  args: { onSubmit: fn<RegistrationFormProps['onSubmit']>(async () => ({ ok: false as const, message: copy.stories.serverError })) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.stories.serverError);
    await expect(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' })).toHaveValue(copy.stories.password);
    await expect(canvas.getByRole('button', { name: copy.submit })).toBeEnabled();
  },
};
export const ThrownError: Story = {
  args: { onSubmit: fn<RegistrationFormProps['onSubmit']>(async () => { throw new Error('Mock failure'); }) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.errors.submission);
  },
};
export const Success: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('status')).toHaveAccessibleDescription(copy.stories.success);
    await expect(args.onSubmit).toHaveBeenCalledWith({ name: copy.stories.name, email: copy.stories.email, password: copy.stories.password, termsAccepted: true });
    await expect(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' })).toHaveValue('');
    await expect(canvas.getByRole('button', { name: copy.submit })).toBeDisabled();
  },
};
export const Retry: Story = {
  args: { onSubmit: fn<RegistrationFormProps['onSubmit']>().mockResolvedValueOnce({ ok: false, message: copy.stories.serverError }).mockResolvedValue({ ok: true }) },
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
    canvas.getByLabelText(copy.labels.confirmPassword, { exact: false, selector: 'input' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

export const ValidationRecovery: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByText(copy.errors.name)).toBeVisible();
    await fill(canvasElement);
    await expect(canvas.queryByText(copy.errors.name)).not.toBeInTheDocument();
    await expect(canvas.queryByText(copy.errors.confirmPassword)).not.toBeInTheDocument();
    await expect(canvas.queryByText(copy.errors.termsAccepted)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};

export const TermsRequired: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox'));
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('checkbox')).toHaveFocus();
    await expect(canvas.getByRole('checkbox')).toHaveAccessibleDescription(copy.errors.termsAccepted);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const NormalizedSubmission: Story = {
  play: async ({ canvasElement, args }) => {
    const password = ` ${copy.stories.password} `;
    const canvas = await fill(canvasElement, { email: ` ${copy.stories.email} `, password, confirmPassword: password });
    const name = canvas.getByRole('textbox', { name: /Your name/ });
    await userEvent.clear(name);
    await userEvent.type(name, ` ${copy.stories.name} `);
    await userEvent.click(canvas.getByRole('button', { name: copy.submit }));
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(args.onSubmit).toHaveBeenCalledWith({ name: copy.stories.name, email: copy.stories.email, password, termsAccepted: true });
  },
};
