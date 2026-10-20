import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { LeadContactCard } from './lead-contact-card';
import { leadContactCardData as copy } from './lead-contact-card.data';

const meta = { title: 'Leads/LeadContactCard', component: LeadContactCard, parameters: { layout: 'fullscreen' }, args: { contact: copy.stories.contact },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><div className="w-full max-w-3xl"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 leading-6 text-muted">{copy.stories.description}</p><Story/></div></main>],
} satisfies Meta<typeof LeadContactCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('link', { name: copy.stories.contact.email })).toHaveAttribute('href', 'mailto:jordan%40example.com');
  await expect(c.getByRole('link', { name: copy.stories.contact.phone })).toHaveAttribute('href', 'tel:+12125550134');
} };
export const MissingDetails: Story = { args: { contact: { ...copy.stories.contact, email: null, phone: null } } };
export const Unassigned: Story = { args: { contact: { ...copy.stories.contact, owner: null } } };
export const FormerMember: Story = { args: { contact: { ...copy.stories.contact, owner: { ...copy.stories.contact.owner, former: true } } } };
export const AssignedToMe: Story = { args: { viewerId: 'sam' } };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('link')).not.toBeInTheDocument();
} };
export const InvalidContactFormats: Story = { args: { contact: { ...copy.stories.contact, email: copy.stories.invalidEmail, phone: copy.stories.invalidPhone } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);await expect(c.queryByRole('link')).not.toBeInTheDocument();await expect(c.getByText(copy.stories.invalidPhone)).toBeInTheDocument();
} };
export const LongContent: Story = { args: { contact: { name: copy.stories.longName, email: copy.stories.longEmail, phone: copy.stories.contact.phone, owner: { id: 'taylor', name: copy.stories.longOwner } } } };
export const Narrow: Story = { ...LongContent, parameters: { viewport: { value: 'phone' } } };
