import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { ResetPasswordScreen } from './reset-password-screen';
import { resetPasswordScreenData as copy } from './reset-password-screen.data';
import { resetPasswordFormData as form } from '../reset-password-form/reset-password-form.data';
const meta = {
  title: 'Auth/ResetPasswordScreen', component: ResetPasswordScreen,
  parameters: { layout: 'fullscreen' },
  args: { onSubmit: fn(async () => ({ ok: true as const })) },
} satisfies Meta<typeof ResetPasswordScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
  await expect(canvas.getByRole('link', { name: copy.backToLogin })).toHaveAttribute('href', copy.loginHref);
} };
export const InvalidLink: Story = { args: { invalidLink: true }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('alert')).toHaveAccessibleDescription(form.errors.invalidLink);
  await expect(canvas.getByRole('button', { name: form.submit })).not.toBeInTheDocument();
} };
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
