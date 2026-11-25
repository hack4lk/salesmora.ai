import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { LegalPage } from './legal-page';
import { publicSiteLinks as links } from '../public-site-links';

const meta = {
  title: 'Public Site/LegalPage',
  component: LegalPage,
  parameters: { layout: 'fullscreen' },
  args: { document: 'terms', links, year: 2026 },
} satisfies Meta<typeof LegalPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const termsPlay: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('main')).toBeVisible();
  await expect(canvas.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeVisible();
  await expect(canvas.getByText('Draft for legal review — not effective')).toBeVisible();
  await expect(canvas.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('aria-current', 'page');
  await expect(canvas.getByRole('link', { name: 'Product' })).toHaveAttribute('href', links.product);
};

const privacyPlay: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('main')).toBeVisible();
  await expect(canvas.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeVisible();
  await expect(canvas.getByText('Draft for legal and data-practices review — not effective')).toBeVisible();
  await expect(canvas.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('aria-current', 'page');
  await expect(canvas.getByRole('link', { name: 'Product' })).toHaveAttribute('href', links.product);
};

export const Terms: Story = { play: termsPlay };
export const Privacy: Story = { args: { document: 'privacy' }, play: privacyPlay };
export const TermsMobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: termsPlay,
};
export const PrivacyMobile: Story = {
  args: { document: 'privacy' },
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: privacyPlay,
};
