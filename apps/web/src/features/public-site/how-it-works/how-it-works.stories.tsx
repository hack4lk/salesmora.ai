import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { HowItWorks } from './how-it-works';
import { howItWorksData as copy } from './how-it-works.data';

const meta = {
  title: 'Public Site/HowItWorks',
  component: HowItWorks,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HowItWorks>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: copy.title })).toHaveAttribute('id', 'how-it-works');
    for (const step of copy.steps) {
      await expect(canvas.getByRole('heading', { name: step.title, level: 3 })).toBeVisible();
      await expect(canvas.getByText(step.cardDescription)).toBeVisible();
    }
    for (const article of canvas.getAllByRole('article')) {
      const art = article.querySelector('div');
      if (!art) throw new Error('Step illustration is missing.');
      await expect(getComputedStyle(art).backgroundImage).toContain('linear-gradient');
      await expect(art.getBoundingClientRect().height).toBeGreaterThanOrEqual(170);
    }
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};
