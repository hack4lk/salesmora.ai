import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { TermsDocument } from './terms-document';
import { termsDocumentData as copy } from './terms-document.data';

const meta = {
  title: 'Public Site/TermsDocument',
  component: TermsDocument,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TermsDocument>;
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
    await expect(canvas.getByText(/age of legal majority.*only in the United States/)).toBeVisible();
    await expect(canvas.getByText(/promptly removing access when a user should no longer have it/)).toBeVisible();
    await expect(canvas.getByText(/actions taken in its workspace by users it authorizes, within the access assigned/)).toBeVisible();
    await expect(canvas.getByText(/paid access continues for seven days/)).toBeVisible();
    await expect(canvas.getByText(/do not sell Customer Data, use it for advertising, or use it to train general-purpose AI models/)).toBeVisible();
    await expect(canvas.getByText(/suspend access when reasonably necessary/)).toBeVisible();
    await expect(canvas.getByText(/state or federal courts in Maryland/)).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: Default.play,
};
