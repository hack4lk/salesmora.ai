import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { MaterialThumb } from './material-thumb';

const swatch = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="%23c97b3c"/></svg>';
const meta = { title: 'Materials/MaterialThumb', component: MaterialThumb, args: { name: '1/2" copper pipe, 10 ft' } } satisfies Meta<typeof MaterialThumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NoImage: Story = { play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText('No image')).toBeInTheDocument(); } };
export const WithImage: Story = { args: { imageUrl: `data:image/svg+xml;utf8,${swatch}` }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('img')).toBeInTheDocument(); } };
export const BrokenImage: Story = { args: { imageUrl: 'http://127.0.0.1:1/missing.png' }, play: async ({ canvasElement }) => { await expect(await within(canvasElement).findByText('No image')).toBeInTheDocument(); } };
