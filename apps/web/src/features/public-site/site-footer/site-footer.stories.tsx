import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { SiteFooter } from './site-footer';
import { siteFooterData as copy } from './site-footer.data';

const links = {
  terms: '/terms',
  privacy: '/privacy',
  support: 'mailto:info@salesmora.ai',
  howItWorks: '/#how-it-works',
  faq: '/#faq',
  createAccount: '/register',
  signIn: '/login',
};
const platformLinks = { terms: 'https://salesmora.ai/terms', privacy: 'https://salesmora.ai/privacy' };

const meta = {
  title: 'Public Site/SiteFooter',
  component: SiteFooter,
  parameters: { layout: 'fullscreen' },
  args: { context: 'marketing', links, year: 2026 },
} satisfies Meta<typeof SiteFooter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Marketing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(copy.product)).toBeVisible();
    await expect(canvas.getByRole('link', { name: copy.howItWorks })).toHaveAttribute('href', links.howItWorks);
    await expect(canvas.getByRole('link', { name: copy.createAccount })).toHaveAttribute('href', links.createAccount);
    await expect(canvas.getByRole('link', { name: copy.privacy })).toHaveAttribute('href', links.privacy);
  },
};
export const Workspace: Story = {
  args: { context: 'workspace', links, year: 2026 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: copy.navigation.workspace })).toBeVisible();
    await expect(canvas.getByRole('link', { name: copy.support })).toHaveAttribute('href', links.support);
  },
};
export const Authentication: Story = { args: { context: 'auth', links, year: 2026 } };

const customerPlay: NonNullable<Story['play']> = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText(copy.product)).toBeVisible();
  for (const [label, href] of [[copy.customerTerms, platformLinks.terms], [copy.customerPrivacy, platformLinks.privacy]]) {
    const link = canvas.getByRole('link', { name: `${label} ${copy.newTab}` });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
};

export const HostedForm: Story = { args: { context: 'hosted', links: platformLinks }, play: customerPlay };
export const EmbeddedForm: Story = {
  args: { context: 'embedded', links: platformLinks },
  decorators: [(Story) => <div style={{ maxWidth: 500, padding: 16 }}><Story /></div>],
  play: customerPlay,
};
export const CustomerEstimate: Story = { args: { context: 'estimate', links: platformLinks }, play: customerPlay };
export const PrintableWorkOrder: Story = { args: { context: 'print', links: platformLinks }, play: customerPlay };
