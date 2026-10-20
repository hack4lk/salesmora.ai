import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LoginScreen } from './login-screen';
import { loginScreenData as copy } from './login-screen.data';
import { loginFormData as form } from '../login-form/login-form.data';
import type { LoginFormProps } from '../login-form/login-form';

const meta = {
  title: 'Auth/LoginScreen',
  component: LoginScreen,
  parameters: { layout: 'fullscreen' },
  args: { onSubmit: fn<LoginFormProps['onSubmit']>(async () => ({ ok: true })), successMessage: copy.stories.success },
} satisfies Meta<typeof LoginScreen>;
export default meta;
type Story = StoryObj<typeof meta>;

async function fill(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox', { name: /Work email/ }), form.stories.email);
  await userEvent.type(canvas.getByLabelText(form.labels.password, { selector: 'input', exact: false }), form.stories.password);
  return canvas;
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
    await expect(canvas.getByRole('img', { name: 'SalesMora.ai' })).toBeVisible();
    await expect(canvas.getByText(copy.previewNotice)).toBeVisible();
    await expect(canvas.getByRole('link', { name: copy.register })).toHaveAttribute('href', copy.registerHref);
  },
};
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const Validation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: form.submit }));
    await expect(canvas.getByRole('textbox')).toHaveFocus();
    await expect(canvas.getByText(form.errors.password)).toBeVisible();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
export const Pending: Story = {
  args: { onSubmit: fn<LoginFormProps['onSubmit']>(() => new Promise(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = await fill(canvasElement);
    await userEvent.dblClick(canvas.getByRole('button', { name: form.submit }));
    await expect(canvas.getByRole('button', { name: form.pending })).toBeDisabled();
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
export const ServerError: Story = {
  args: { onSubmit: fn<LoginFormProps['onSubmit']>(async () => ({ ok: false })) },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: form.submit }));
    await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(form.errors.submission);
    await expect(canvas.getByRole('textbox')).toHaveValue(form.stories.email);
  },
};
export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: form.submit }));
    await expect(canvas.getByRole('status')).toHaveAccessibleDescription(copy.stories.success);
  },
};

export const DeletionRequested: Story = {
  args: { accountDeletionRequested: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveAccessibleDescription(copy.deletionMessage);
    await expect(canvas.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
  },
};
