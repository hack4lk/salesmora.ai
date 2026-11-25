import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { HomeCta } from './home-cta';
import { homeCtaData as copy } from './home-cta.data';

const links = { createAccount: '/register', plans: '/#plans' };

const meta = {
  title: 'Public Site/HomeCta',
  component: HomeCta,
  parameters: { layout: 'fullscreen' },
  args: { links },
} satisfies Meta<typeof HomeCta>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: copy.title })).toBeVisible();
    await expect(canvas.getByRole('link', { name: copy.createAccount })).toHaveAttribute('href', links.createAccount);
    await expect(canvas.getByRole('link', { name: copy.plans })).toHaveAttribute('href', links.plans);
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};
