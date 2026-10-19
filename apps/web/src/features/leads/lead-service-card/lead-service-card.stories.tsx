import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { LeadServiceCard } from './lead-service-card';
import { leadServiceCardData as copy } from './lead-service-card.data';

const meta = { title: 'Leads/LeadServiceCard', component: LeadServiceCard, parameters: { layout: 'fullscreen' },
  args: { service: copy.stories.service, details: copy.stories.details, address: copy.stories.address },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="w-full max-w-3xl"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 leading-6 text-muted">{copy.stories.description}</p><Story/></div></main>],
} satisfies Meta<typeof LeadServiceCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const MissingDetails: Story = { args: { details: null } };
export const MissingAddress: Story = { args: { address: null } };
export const MissingOptional: Story = { args: { details: null, address: null } };
export const Multiline: Story = { args: { details: copy.stories.multilineDetails, address: copy.stories.multilineAddress } };
export const LongContent: Story = { args: { service: copy.stories.longService, details: copy.stories.longDetails, address: copy.stories.longAddress } };
export const Narrow: Story = { ...LongContent, parameters: { viewport: { value: 'phone' } } };
export const PlainText: Story = { args: { details: copy.stories.plainText }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.queryByRole('link')).not.toBeInTheDocument();
  await expect(canvasElement.querySelector('script')).toBeNull();
  await expect(c.getByText(copy.stories.plainText, { normalizer: text => text })).toBeInTheDocument();
} };
export const WhitespaceOnly: Story = { args: { service: ' ', details: '\n ', address: ' ' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);await expect(c.getByText(copy.missingService)).toBeInTheDocument();await expect(c.getByText(copy.missingDetails)).toBeInTheDocument();await expect(c.getByText(copy.missingAddress)).toBeInTheDocument();
} };
