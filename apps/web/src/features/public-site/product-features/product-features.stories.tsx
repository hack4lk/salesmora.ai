import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ProductFeatures } from './product-features';
import { productFeaturesData as copy } from './product-features.data';

const meta = {
  title: 'Public Site/ProductFeatures',
  component: ProductFeatures,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ProductFeatures>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: copy.title })).toHaveAttribute('id', 'product');
    for (const feature of copy.features) {
      await expect(canvas.getByRole('heading', { name: feature.title, level: 3 })).toBeVisible();
      await expect(canvas.getByText(feature.description)).toBeVisible();
    }
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};
