import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RegistrationScreen } from './registration-screen';
import { registrationScreenData as copy } from './registration-screen.data';
import { registrationFormData as formCopy } from '../registration-form/registration-form.data';
import type { RegistrationFormProps } from '../registration-form/registration-form';

const meta = {
  title: 'Auth/RegistrationScreen',
  component: RegistrationScreen,
  parameters: { layout: 'fullscreen' },
  args: { onSubmit: fn<RegistrationFormProps['onSubmit']>(async () => ({ ok: true })) },
} satisfies Meta<typeof RegistrationScreen>;
export default meta;
type Story = StoryObj<typeof meta>;

async function fill(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox', { name: /Your name/ }), formCopy.stories.name);
  await userEvent.type(canvas.getByRole('textbox', { name: /Work email/ }), formCopy.stories.email);
  await userEvent.type(canvas.getByLabelText(formCopy.labels.password, { exact: false, selector: 'input' }), formCopy.stories.password);
  await userEvent.type(canvas.getByLabelText(formCopy.labels.confirmPassword, { exact: false, selector: 'input' }), formCopy.stories.password);
  await userEvent.click(canvas.getByRole('checkbox'));
  return canvas;
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
    await expect(canvas.getByRole('img', { name: 'SalesMora.ai' })).toBeVisible();
    await expect(canvas.getByText(copy.previewNotice)).toBeVisible();
    await expect(canvas.getByRole('link', { name: copy.signIn })).toHaveAttribute('href', copy.loginHref);
  },
};
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const Validation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: formCopy.submit }));
    await expect(canvas.getByRole('textbox', { name: /Your name/ })).toHaveFocus();
    await expect(canvas.getByText(formCopy.errors.termsAccepted)).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const Pending: Story = {
  args: { onSubmit: fn<RegistrationFormProps['onSubmit']>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.dblClick(canvas.getByRole('button', { name: formCopy.submit }));
    await expect(canvas.getByRole('button', { name: formCopy.pending })).toBeDisabled();
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
export const ServerError: Story = {
  args: { onSubmit: fn<RegistrationFormProps['onSubmit']>(async () => ({ ok: false, message: copy.stories.serverError })) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: formCopy.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(copy.stories.serverError);
    await expect(canvas.getByRole('textbox', { name: /Work email/ })).toHaveValue(formCopy.stories.email);
  },
};
export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: formCopy.submit }));
    await expect(canvas.getByRole('status')).toHaveAccessibleName(copy.successTitle);
    await expect(canvas.getByRole('status')).toHaveAccessibleDescription(copy.successMessage);
  },
};
