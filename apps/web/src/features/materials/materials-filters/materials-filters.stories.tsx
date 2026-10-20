import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { MaterialsFilters, type MaterialsFiltersProps } from './materials-filters';
import { defaultMaterialsFilters, type MaterialsPageFilters } from '../materials-page.types';

const options = { categories: ['Electrical', 'Plumbing'], suppliers: ['Ferguson', 'Graybar'] };
function Stateful({ initial, ...rest }: Partial<MaterialsFiltersProps> & { initial?: Partial<MaterialsPageFilters> }) {
  const [filters, setFilters] = useState({ ...defaultMaterialsFilters, ...initial });
  return <MaterialsFilters filters={filters} options={options} canManage onFilters={setFilters} {...rest} />;
}
const meta = { title: 'Materials/MaterialsFilters', component: MaterialsFilters, args: { filters: defaultMaterialsFilters, options, canManage: true, onFilters: () => undefined }, decorators: [Story => <div className="max-w-5xl"><Story /></div>] } satisfies Meta<typeof MaterialsFilters>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Stateful />,
  play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.type(c.getByLabelText('Search materials'), 'pipe'); await expect(c.getByText('Search: pipe')).toBeInTheDocument(); },
};
export const WithFilters: Story = { render: () => <Stateful initial={{ q: 'pipe', category: 'Plumbing' }} /> };
export const ReadOnly: Story = { render: () => <Stateful canManage={false} /> };
export const Disabled: Story = { render: () => <Stateful disabled /> };
