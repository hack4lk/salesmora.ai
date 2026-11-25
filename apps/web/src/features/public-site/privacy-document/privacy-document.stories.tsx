import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { PrivacyDocument } from './privacy-document';
import { privacyDocumentData as copy } from './privacy-document.data';

const meta = {
  title: 'Public Site/PrivacyDocument',
  component: PrivacyDocument,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PrivacyDocument>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: copy.title, level: 1 })).toBeVisible();
    await expect(canvas.getByText(copy.notice.title)).toBeVisible();
    const navigation = within(canvas.getByRole('navigation', { name: copy.contentsLabel }));
    for (const section of copy.sections) {
      await expect(navigation.getByRole('link', { name: section.title })).toHaveAttribute('href', `#${section.id}`);
      await expect(canvasElement.querySelector(`#${section.id}`)).toBeInTheDocument();
    }
    await expect(canvas.getByText(/SalesMora is a product of Karpuk Creative, LLC/)).toBeVisible();
    await expect(canvas.getByText(/do not sell personal information or use it for targeted advertising/)).toBeVisible();
    await expect(canvas.getByText(/eligible for deletion after 90 days of inactivity/)).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'info@salesmora.ai' })).toHaveAttribute('href', 'mailto:info@salesmora.ai');
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};
