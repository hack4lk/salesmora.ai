import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { AccountLayout } from './account-layout';
import { accountLayoutData as copy } from './account-layout.data';

const meta = {
  title: 'Account/AccountLayout',
  component: AccountLayout,
  parameters: { layout: 'fullscreen' },
  args: {
    title: copy.stories.registration.title,
    description: copy.stories.registration.description,
    children: (
      <div className="grid min-h-64 place-content-center rounded-3xl border border-dashed border-line bg-canvas p-6 text-center">
        <p className="font-semibold">{copy.stories.registration.placeholder}</p>
        <p className="mt-2 text-sm text-muted">{copy.stories.registration.placeholderDetail}</p>
      </div>
    ),
    footer: copy.stories.registration.footer,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: args.title })).toBeVisible();
    await expect(canvas.getByRole('img', { name: copy.brandName })).toBeVisible();
    await expect(canvas.getByRole('main')).toHaveAccessibleName(args.title);
  },
} satisfies Meta<typeof AccountLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Registration: Story = {};
export const Login: Story = {
  args: {
    title: copy.stories.login.title,
    description: copy.stories.login.description,
    children: <div className="min-h-50 rounded-3xl border border-dashed border-line bg-canvas p-6">{copy.stories.login.placeholder}</div>,
    footer: undefined,
  },
};
export const Mobile: Story = { globals: { viewport: { value: 'phone', isRotated: false } } };
export const LongContent: Story = {
  args: {
    title: copy.stories.longContent.title,
    children: <div className="min-h-screen rounded-3xl border border-dashed border-line bg-canvas p-6">{copy.stories.longContent.placeholder}</div>,
  },
};
