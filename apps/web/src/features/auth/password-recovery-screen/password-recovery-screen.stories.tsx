import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { PasswordRecoveryScreen } from './password-recovery-screen';
import { passwordRecoveryScreenData as copy } from './password-recovery-screen.data';

const meta = {
  title: 'Auth/PasswordRecoveryScreen',
  component: PasswordRecoveryScreen,
  args: { onSubmit: fn(async () => ({ ok: true as const })) },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PasswordRecoveryScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
    await expect(canvas.getByRole('textbox')).toBeEnabled();
    await expect(canvas.getByRole('link', { name: copy.backToLogin })).toHaveAttribute('href', copy.loginHref);
  },
};
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
