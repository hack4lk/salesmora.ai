import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { setupStoryData as copy } from './setup.data';

const meta = { title: 'Setup/Workbench check', render: () => <main className="p-6"><h1 className="mb-4 text-3xl font-semibold">{copy.title}</h1><p>{copy.description}</p></main> } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Ready: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: copy.title })).toBeVisible();
  },
};
