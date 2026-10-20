import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Pagination, type PaginationProps } from './pagination';
import { paginationData as copy } from './pagination.data';

function Preview(args: PaginationProps) {
  const [page, setPage] = useState(args.page);
  const [size, setSize] = useState(args.pageSize);
  return <Pagination {...args} page={page} pageSize={size} onPageChange={value => { args.onPageChange(value); setPage(value); }}
    onPageSizeChange={value => { args.onPageSizeChange(value); setSize(value); setPage(1); }}/>;
}
const meta = { title: 'Data display/Pagination', component: Preview, parameters: { layout: 'fullscreen' },
  args: { total: 137, page: 1, pageSize: 25, onPageChange: fn(), onPageSizeChange: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><div className="min-w-0 rounded-2xl border border-line bg-paper p-4 sm:p-6"><Story/></div></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const First: Story = {};
export const Middle: Story = { args: { total: 1234, page: 25 } };
export const Last: Story = { args: { page: 6 } };
export const Empty: Story = { args: { total: 0 }, play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('status')).toHaveTextContent(copy.range(0, 0, 0));
  for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled();
} };
export const SinglePage: Story = { args: { total: 12 } };
export const Disabled: Story = { args: { disabled: true, page: 3 }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByRole('combobox', { name: copy.pageSize })).toBeDisabled();
  await userEvent.click(c.getByRole('button', { name: copy.item('next', null, false) }));
  await expect(args.onPageChange).not.toHaveBeenCalled();
} };
export const Narrow: Story = { ...Middle, parameters: { viewport: { value: 'mobile1' } } };
export const ChangePage: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.item('next', null, false) }));
  await expect(args.onPageChange).toHaveBeenCalledWith(2);
  await expect(c.getByRole('status')).toHaveTextContent(copy.range(26, 50, 137));
  await expect(c.getByRole('button', { name: copy.item('page', 2, true) })).toHaveAttribute('aria-current', 'page');
} };
export const ChangePageSize: Story = { ...Last, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.selectOptions(c.getByRole('combobox', { name: copy.pageSize }), '50');
  await expect(args.onPageSizeChange).toHaveBeenCalledWith(50);
  await expect(c.getByRole('status')).toHaveTextContent(copy.range(1, 50, 137));
  await expect(c.getByRole('button', { name: copy.item('page', 1, true) })).toHaveAttribute('aria-current', 'page');
} };
export const InvalidInput: Story = { args: { total: -1, page: 99, pageSize: 4, pageSizeOptions: [0, -5, 25, 25, 50] } };
export const OutOfRange: Story = { args: { page: 99 } };
