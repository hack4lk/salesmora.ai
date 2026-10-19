import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Toast } from '@salesmora/ui';
import { LeadsToolbar, emptyLeadsToolbarValues, type LeadsToolbarProps } from './leads-toolbar';
import { leadsToolbarData as copy } from './leads-toolbar.data';

function Preview(args: LeadsToolbarProps) {
  const [values, setValues] = useState(args.values);
  const [notice, setNotice] = useState('');
  return <>
    <LeadsToolbar {...args} values={values} onChange={next => { args.onChange(next); setValues(next); }}
      onAdd={() => { args.onAdd(); setNotice(copy.stories.added); }} onExport={() => { args.onExport(); setNotice(copy.stories.exported); }}/>
    <Toast open={!!notice} kind="success" message={notice} autoHideMs={null} onClose={() => setNotice('')}/>
  </>;
}
const meta = { title: 'Leads/LeadsToolbar', component: Preview, parameters: { layout: 'fullscreen' },
  args: { values: emptyLeadsToolbarValues, owners: copy.stories.owners, viewerId: 'taylor', access: { scope: 'workspace', canCreate: true, canExport: true, canArchive: true }, onChange: fn(), onAdd: fn(), onExport: fn() },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ListView: Story = { args: { values: { ...emptyLeadsToolbarValues, view: 'list' } } };
export const FiltersActive: Story = { args: { values: { ...emptyLeadsToolbarValues, query: 'Kitchen', stages: ['new', 'contacted'], sources: ['referral'], ownerIds: ['sam'], created: '30days', attention: true, archived: true } } };
export const FieldRole: Story = { args: { access: { scope: 'assigned', canCreate: false, canExport: false, canArchive: false }, values: { ...emptyLeadsToolbarValues, ownerIds: ['me', 'sam'], archived: true } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await expect(c.queryByRole('button', { name: copy.add })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: copy.export })).not.toBeInTheDocument();
  await expect(c.queryByRole('button', { name: copy.archived })).not.toBeInTheDocument();
  await expect(c.queryByText(copy.stories.owners[1].name)).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.open(copy.owner) }));
  await expect(within(body.getByRole('listbox')).getAllByRole('option')).toHaveLength(1);
  await expect(body.getByRole('option', { name: copy.me })).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await userEvent.click(c.getByRole('heading', { name: copy.stories.title }));
} };
export const Narrow: Story = { ...FiltersActive, parameters: { viewport: { value: 'mobile1' } } };
export const Disabled: Story = { ...FiltersActive, args: { ...FiltersActive.args, disabled: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.add }));
  await expect(args.onAdd).not.toHaveBeenCalled();
  await expect(args.onChange).not.toHaveBeenCalled();
  for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled();
} };
export const CustomRange: Story = { args: { values: { ...emptyLeadsToolbarValues, created: 'custom', from: '2026-10-01', to: '2026-10-14' } } };
export const InvalidRange: Story = { args: { values: { ...emptyLeadsToolbarValues, created: 'custom', from: '2026-10-14', to: '2026-10-01' } } };
export const SearchMinimum: Story = { args: { values: { ...emptyLeadsToolbarValues, query: 'K' } } };
export const SelectFilters: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.open(copy.stage) }));
  await userEvent.click(body.getByRole('option', { name: copy.stages[0].label }));
  await userEvent.click(body.getByRole('option', { name: copy.stages[1].label }));
  await userEvent.keyboard('{Escape}');
  await expect(c.getByRole('button', { name: 'Remove filter: Stage: New' })).toBeVisible();
  await expect(c.getByRole('button', { name: 'Remove filter: Stage: Contacted' })).toBeVisible();
} };
export const ClearFilters: Story = { ...FiltersActive, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.list }));
  await userEvent.click(c.getByRole('button', { name: 'Clear all' }));
  await expect(args.onChange).toHaveBeenLastCalledWith({ ...emptyLeadsToolbarValues, view: 'list' });
  await expect(c.getByRole('textbox', { name: new RegExp(copy.search) })).toHaveFocus();
  await expect(c.getByRole('button', { name: copy.list })).toHaveAttribute('aria-pressed', 'true');
} };
export const Actions: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.add }));
  await expect(args.onAdd).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(c.getByText(copy.stories.added)).toBeVisible());
  await userEvent.click(c.getByRole('button', { name: copy.export }));
  await expect(args.onExport).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(c.getByText(copy.stories.exported)).toBeVisible());
} };
