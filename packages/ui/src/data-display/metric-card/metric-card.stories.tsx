import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { MetricCard } from './metric-card';
import { metricCardData as copy } from './metric-card.data';
const meta = { title: 'Data display/MetricCard', component: MetricCard,
  args: { label: copy.stories.customers, value: 1284, description: copy.stories.workspace },
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-2xl bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof MetricCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('group', { name: copy.stories.customers })).toHaveAccessibleDescription(copy.stories.workspace); await expect(c.getByText('1,284')).toBeVisible();
} };
export const Zero: Story = { args: { value: 0 }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText('0', { exact: true })).toBeVisible(); await expect(c.queryByRole('status')).not.toBeInTheDocument();
} };
export const OpenLeads: Story = { args: { label: copy.stories.openLeads, description: copy.stories.opportunities, value: 42 } };
export const LargeNumber: Story = { args: { value: 123456789 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('123,456,789')).toBeVisible(); } };
export const MaximumSafeCount: Story = { args: { value: Number.MAX_SAFE_INTEGER }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('9,007,199,254,740,991')).toBeVisible(); } };
export const LongCopy: Story = { args: { label: copy.stories.longLabel, description: copy.stories.longDescription } };
export const NoDescription: Story = { args: { description: undefined }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('group', { name: copy.stories.customers })).not.toHaveAttribute('aria-describedby'); } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('group')).toHaveAttribute('aria-busy', 'true'); await expect(c.getByRole('status')).toHaveTextContent(copy.loading); await expect(c.queryByText('1,284')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.unavailable); await expect(c.queryByText('1,284')).not.toBeInTheDocument();
} };
export const MissingValue: Story = { args: { value: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.unavailable); await expect(c.queryByText('0', { exact: true })).not.toBeInTheDocument();
} };
export const NegativeCount: Story = { args: { value: -1 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.unavailable); } };
export const FractionalCount: Story = { args: { value: 1.5 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.unavailable); } };
export const UnsafeCount: Story = { args: { value: Number.MAX_SAFE_INTEGER + 1 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.unavailable); } };
export const NonFiniteCount: Story = { args: { value: Infinity }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.unavailable); } };
export const EmptyLabel: Story = { args: { label: '' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('group', { name: copy.fallbackLabel })).toBeVisible(); } };
