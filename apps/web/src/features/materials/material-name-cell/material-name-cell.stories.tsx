import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { MaterialNameCell } from './material-name-cell';

const meta = { title: 'Materials/MaterialNameCell', component: MaterialNameCell, args: { name: '1/2" copper pipe, 10 ft', sku: 'CU-050-10' } } satisfies Meta<typeof MaterialNameCell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('CU-050-10')).toBeInTheDocument(); } };
export const NoSku: Story = { args: { name: 'Technician labor', sku: '' } };
export const Archived: Story = { args: { archived: true }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('Archived')).toBeInTheDocument(); } };
export const NoImage: Story = { play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('No image')).toBeInTheDocument(); } };
export const WithImage: Story = { args: { imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%23999"/></svg>' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('img')).toBeInTheDocument(); } };
export const BrokenImage: Story = { args: { imageUrl: 'http://127.0.0.1:1/missing.png' }, play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText('No image')).toBeInTheDocument(); } };
