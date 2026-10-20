import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { HelpArticle } from './help-article';
import { helpArticleData as copy } from './help-article.data';
const meta = { title: 'Help/HelpArticle', component: HelpArticle, parameters: { layout: 'fullscreen' },
  args: { title: copy.stories.title, sections: copy.stories.sections, workspaceHref: '/home?workspace=fictional-workspace' },
} satisfies Meta<typeof HelpArticle>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('heading', { level: 1, name: copy.stories.title })).toBeVisible();
  for (const section of copy.stories.sections) {
    await expect(canvas.getByRole('link', { name: section.heading })).toHaveAttribute('href', `#${section.anchor}`);
    await expect(canvas.getByRole('heading', { name: section.heading })).toHaveAttribute('class', expect.stringContaining('text-xl'));
  }
} };
export const Narrow: Story = { ...Default, globals: { viewport: { value: 'mobile1', isRotated: false } } };
