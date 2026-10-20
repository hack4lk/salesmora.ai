import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { MaterialCard } from './material-card';
import { materialFixtures } from '../materials-preview.data';

const meta = { title: 'Materials/MaterialCard', component: MaterialCard, args: { material: materialFixtures[0], canViewCosts: true, canViewPrices: true },
  decorators: [Story => <div className="max-w-sm rounded-2xl border border-line bg-paper p-4"><Story /></div>] } satisfies Meta<typeof MaterialCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('Cost $24.50 · Price $39.00')).toBeInTheDocument(); } };
export const NoPrices: Story = { args: { canViewCosts: false, canViewPrices: false } };
export const PriceOnly: Story = { args: { canViewCosts: false } };
export const DuplicateProposal: Story = { args: { material: materialFixtures[13] } };
export const Archived: Story = { args: { material: materialFixtures[11] } };
