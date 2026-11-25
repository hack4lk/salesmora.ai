import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { HomePage } from './home-page';
import { homeFaqData } from '../home-faq/home-faq.data';
import { homeHeroData } from '../home-hero/home-hero.data';
import { planOverviewData } from '../plan-overview/plan-overview.data';
import { publicSiteLinks as links } from '../public-site-links';

const meta = {
  title: 'Public Site/HomePage',
  component: HomePage,
  parameters: { layout: 'fullscreen' },
  args: { links, year: 2026 },
} satisfies Meta<typeof HomePage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('main')).toBeVisible();
    await expect(canvas.getByRole('heading', { name: homeHeroData.title, level: 1 })).toBeVisible();
    await expect(canvas.getByRole('region', { name: planOverviewData.title })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', links.terms);
  },
};

export const Interactions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const question = homeFaqData.questions[0];
    await userEvent.click(canvas.getByText(question.question));
    await expect(canvas.getByText(question.answer)).toBeVisible();
    await userEvent.click(canvas.getByText(question.question));
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};
