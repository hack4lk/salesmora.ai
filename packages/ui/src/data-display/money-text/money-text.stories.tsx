import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { MoneyText } from './money-text';
import { moneyTextData as copy } from './money-text.data';

const meta = { title: 'Data display/MoneyText', component: MoneyText, args: { cents: 865556 },
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-2xl bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><p className="m-0 text-base text-ink"><Story/></p></main>],
} satisfies Meta<typeof MoneyText>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('$8,655.56')).toBeVisible(); } };
export const Zero: Story = { args: { cents: 0 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('$0.00')).toBeVisible(); } };
export const WholeDollars: Story = { args: { cents: 215000 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('$2,150.00')).toBeVisible(); } };
export const SingleCent: Story = { args: { cents: 1 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('$0.01')).toBeVisible(); } };
export const Negative: Story = { args: { cents: -4500 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('-$45.00')).toBeVisible(); } };
export const Large: Story = { args: { cents: 123456789012 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('$1,234,567,890.12')).toBeVisible(); } };
export const Missing: Story = { args: { cents: undefined }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.placeholder)).toBeVisible(); } };
export const Fractional: Story = { args: { cents: 10.5 }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.placeholder)).toBeVisible(); } };
export const NotFinite: Story = { args: { cents: Infinity }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.placeholder)).toBeVisible(); } };
