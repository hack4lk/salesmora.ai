import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';
import { HomeHero } from './home-hero';
import { homeHeroData as copy } from './home-hero.data';

const links = { createAccount: '/register', product: '/#product' };

const meta = {
  title: 'Public Site/HomeHero',
  component: HomeHero,
  parameters: { layout: 'fullscreen' },
  args: { links },
} satisfies Meta<typeof HomeHero>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
    await expect(canvas.queryByText('Your AI sidekick for service businesses')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Built for home-service teams. You stay in control.')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Generated concept image and illustrative interface, not actual customers or a live workspace.')).not.toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: copy.createAccount })).toHaveAttribute('href', links.createAccount);
    await expect(canvas.getByRole('link', { name: copy.explore })).toHaveAttribute('href', links.product);
    const image = canvas.getByRole('img', { name: copy.imageAlt });
    await expect(image).toBeVisible();
    await waitFor(() => expect(image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0).toBe(true));
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};
