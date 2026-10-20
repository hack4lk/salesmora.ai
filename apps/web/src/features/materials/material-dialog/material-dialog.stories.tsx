import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MaterialDialog } from './material-dialog';

const meta = {
  title: 'Materials/MaterialDialog', component: MaterialDialog, parameters: { layout: 'fullscreen' },
  args: { open: true, mode: 'create', canViewCosts: true, canViewPrices: true, categories: ['Plumbing'], suppliers: ['Ferguson'], onClose: fn(), onSubmit: fn() },
} satisfies Meta<typeof MaterialDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};
export const Propose: Story = { args: { mode: 'propose', canViewCosts: false, canViewPrices: false } };
export const WithLineForWorkOrder: Story = { args: { withLine: true } };
export const WithLineProposeOnly: Story = { args: { withLine: true, mode: 'propose', canViewCosts: false, canViewPrices: false } };
