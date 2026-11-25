import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SiteHeader } from './site-header';
import { siteHeaderData as copy } from './site-header.data';

const links = {
  home: '/',
  product: '/#product',
  plans: '/#plans',
  faq: '/#faq',
  signIn: '/login',
  createAccount: '/register',
};

const meta = {
  title: 'Public Site/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen' },
  args: { links },
} satisfies Meta<typeof SiteHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: copy.homeLabel })).toHaveAttribute('href', links.home);
    await expect(canvas.getByRole('navigation', { name: copy.mainNavigation })).toBeVisible();
    await expect(canvas.getByRole('link', { name: copy.product })).toHaveAttribute('href', links.product);
    await expect(canvas.getByRole('link', { name: copy.plans })).toHaveAttribute('href', links.plans);
    await expect(canvas.getByRole('link', { name: copy.faq })).toHaveAttribute('href', links.faq);
    await expect(canvas.getByRole('link', { name: copy.signIn })).toHaveAttribute('href', links.signIn);
    await expect(canvas.getByRole('link', { name: copy.createAccount })).toHaveAttribute('href', links.createAccount);
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: copy.homeLabel })).toHaveFocus();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};
