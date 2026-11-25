import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ProtectedAccountLayout } from './protected-account-layout';

const meta = {
  title: 'Workspace/ProtectedAccountLayout',
  component: ProtectedAccountLayout,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Set up your workspace',
    description: 'Add your business details.',
    children: <p>Workspace setup preview</p>,
  },
} satisfies Meta<typeof ProtectedAccountLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = within(canvas.getByRole('contentinfo'));
    await expect(footer.getByText(/SalesMora is a product of Karpuk Creative, LLC/)).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
    await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    await expect(footer.getByRole('link', { name: 'Contact & support' })).toHaveAttribute('href', 'mailto:info@salesmora.ai');
  },
};

export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } }, play: Default.play };
