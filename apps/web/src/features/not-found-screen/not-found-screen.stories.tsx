import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { NotFoundScreen } from './not-found-screen';
import { notFoundScreenData as copy } from './not-found-screen.data';

const meta = {
  title: 'Pages/NotFoundScreen',
  component: NotFoundScreen,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NotFoundScreen>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
    await expect(canvas.getByRole('img', { name: copy.brandName })).toHaveAttribute('src', copy.logoSrc);
    await expect(canvas.getByRole('link', { name: copy.signIn })).toHaveAttribute('href', copy.signInHref);
    await expect(canvas.getByRole('link', { name: copy.register })).toHaveAttribute('href', copy.registerHref);
  },
};
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
