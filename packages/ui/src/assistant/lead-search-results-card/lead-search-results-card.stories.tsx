import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LeadSearchResultsCard, type LeadSearchResultsCardProps, type LeadSearchResultSet } from './lead-search-results-card';
import { leadSearchResultsCardData as copy } from './lead-search-results-card.data';
const result: LeadSearchResultSet = {
  id: '00000000-0000-4000-8000-000000000001', scope: 'workspace', filterLabels: copy.stories.filters, includeArchived: false, total: 3,
  rows: [
    { id: '00000000-0000-4000-8000-000000000002', number: copy.stories.number, name: copy.stories.name, service: copy.stories.service, stage: 'new', ownerName: copy.stories.owner, archived: false },
    { id: '00000000-0000-4000-8000-000000000003', number: copy.stories.number2, name: copy.stories.name2, service: copy.stories.service2, stage: 'contacted', ownerName: copy.stories.owner2, archived: false },
    { id: '00000000-0000-4000-8000-000000000004', number: copy.stories.number3, name: copy.stories.name3, service: copy.stories.service3, stage: 'new', ownerName: null, archived: false },
  ],
};
function Preview(args: LeadSearchResultsCardProps) {
  const [notice, setNotice] = useState<string>();
  return <><LeadSearchResultsCard {...args} onOpenLead={args.onOpenLead ? id => { args.onOpenLead!(id); setNotice(copy.stories.openedLead(id)); } : undefined}
    onOpenList={args.onOpenList ? id => { args.onOpenList!(id); setNotice(copy.stories.openedList); } : undefined}/>
    {notice && <p role="status" className="text-sm leading-6 text-ink wrap-anywhere">{notice}</p>}</>;
}
const meta = {
  title: 'Assistant/LeadSearchResultsCard', component: LeadSearchResultsCard,
  args: { result, onOpenLead: fn(), onOpenList: fn() }, render: args => <Preview {...args}/>,
  decorators: [Story => <main className="mx-auto min-h-screen w-full max-w-3xl bg-canvas p-4 sm:p-8">
    <h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1>
    <p className="mt-3 text-base leading-6 text-muted">{copy.stories.description}</p><Story/>
  </main>],
} satisfies Meta<typeof LeadSearchResultsCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Review: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.count(3, 3));
  await expect(c.getByRole('button', { name: copy.openLead(copy.stories.number, copy.stories.name) })).toBeEnabled();
} };
export const OpenLead: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.openLead(copy.stories.number, copy.stories.name) }));
  await expect(args.onOpenLead).toHaveBeenCalledWith(result.rows[0].id); await expect(args.onOpenList).not.toHaveBeenCalled();
  await expect(c.getByText(copy.stories.openedLead(result.rows[0].id))).toBeVisible();
} };
export const OpenList: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.openList }));
  await expect(args.onOpenList).toHaveBeenCalledWith(result.id); await expect(args.onOpenLead).not.toHaveBeenCalled();
  await expect(c.getByText(copy.stories.openedList)).toBeVisible();
} };
export const KeyboardOpenLead: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); c.getByRole('button', { name: copy.openLead(copy.stories.number, copy.stories.name) }).focus();
  await userEvent.keyboard('{Enter}'); await expect(args.onOpenLead).toHaveBeenCalledWith(result.rows[0].id);
} };
export const KeyboardOpenList: Story = { play: async ({ canvasElement, args }) => {
  within(canvasElement).getByRole('button', { name: copy.openList }).focus();
  await userEvent.keyboard(' '); await expect(args.onOpenList).toHaveBeenCalledWith(result.id);
} };
export const AssignedScope: Story = { args: { result: { ...result, scope: 'assigned', rows: result.rows.map(row => ({ ...row, ownerName: copy.stories.owner })) } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByText(copy.assigned)).toBeVisible();
} };
export const Unassigned: Story = { args: { result: { ...result, filterLabels: [copy.stories.unassignedFilter], rows: result.rows.map(row => ({ ...row, ownerName: null })) } } };
export const IncludesArchived: Story = { args: { result: { ...result, includeArchived: true, rows: result.rows.map((row, i) => ({ ...row, archived: i === 0 })) } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.archivedIncluded)).toBeVisible(); await expect(c.getByText(copy.archived, { exact: true })).toBeVisible();
} };
export const NoFilters: Story = { args: { result: { ...result, filterLabels: [] } } };
export const SingleMatch: Story = { args: { result: { ...result, total: 1, rows: result.rows.slice(0, 1) } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('status')).toHaveTextContent(copy.count(1, 1));
} };
export const Empty: Story = { args: { result: { ...result, total: 0, rows: [] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.empty)).toBeVisible(); await expect(c.getByRole('status')).toHaveTextContent(copy.count(0, 0));
  await expect(c.getAllByRole('button')).toHaveLength(1);
} };
const manyRows = Array.from({ length: 25 }, (_, i) => ({ ...result.rows[i % 3], id: `fixture-lead-${i}`, number: `LD-${String(1048 + i).padStart(4, '0')}` }));
export const MoreResults: Story = { args: { result: { ...result, total: 248, rows: manyRows.slice(0, 10) } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.count(10, 248)); await expect(c.getByText(copy.more)).toBeVisible();
} };
export const BoundedPreview: Story = { args: { result: { ...result, total: 248, rows: manyRows } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveTextContent(copy.count(10, 248)); await expect(c.getAllByRole('button')).toHaveLength(11);
  await expect(c.queryByText(manyRows[10].number, { exact: false })).not.toBeInTheDocument();
} };
export const AllStages: Story = { args: { result: { ...result, total: 5, filterLabels: [], rows: (Object.keys(copy.stages) as Array<keyof typeof copy.stages>).map((stage, i) => ({ ...manyRows[i], stage, name: copy.stories.stagedName(copy.stages[stage]) })) } } };
export const LongContent: Story = { args: { result: { ...result, total: 1, filterLabels: [copy.stories.longFilter], rows: [{ ...result.rows[0], name: copy.stories.longName, service: copy.stories.longService, ownerName: copy.stories.longOwner }] } } };
export const MissingService: Story = { args: { result: { ...result, total: 1, rows: [{ ...result.rows[0], service: '' }] } } };
export const PlainText: Story = { args: { result: { ...result, total: 1, rows: [{ ...result.rows[0], name: copy.stories.plainText }] } }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).getByRole('button', { name: copy.openLead(copy.stories.number, copy.stories.plainText) })).toBeVisible();
  await expect(canvasElement.querySelector('script')).toBeNull(); await expect(canvasElement.querySelector('a')).toBeNull();
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => {
  for (const button of within(canvasElement).getAllByRole('button')) await expect(button).toBeDisabled();
  await expect(args.onOpenLead).not.toHaveBeenCalled(); await expect(args.onOpenList).not.toHaveBeenCalled();
} };
export const ReadOnly: Story = { args: { onOpenLead: undefined, onOpenList: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button')).not.toBeInTheDocument();
  await expect(c.getByText(`${copy.stories.number} · ${copy.stories.name}`)).toBeVisible();
} };
const hidden: NonNullable<Story['play']> = async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.queryByText(copy.stories.name, { exact: false })).not.toBeInTheDocument();
  await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(c.queryByText(copy.stories.filters[0])).not.toBeInTheDocument();
  await expect(args.onOpenLead).not.toHaveBeenCalled(); await expect(args.onOpenList).not.toHaveBeenCalled();
};
export const Loading: Story = { args: { state: 'loading' }, play: hidden };
export const Failed: Story = { args: { state: 'error' }, play: hidden };
export const Forbidden: Story = { args: { state: 'forbidden' }, play: hidden };
export const Stale: Story = { args: { state: 'stale' }, play: hidden };
export const MissingResults: Story = { args: { result: undefined }, play: hidden };
export const InvalidCount: Story = { args: { result: { ...result, total: 2 } }, play: hidden };
export const InvalidEmptyPage: Story = { args: { result: { ...result, total: 3, rows: [] } }, play: hidden };
export const DuplicateRows: Story = { args: { result: { ...result, rows: [result.rows[0], result.rows[0], result.rows[1]] } }, play: hidden };
export const InconsistentArchive: Story = { args: { result: { ...result, rows: result.rows.map(row => ({ ...row, archived: true })) } }, play: hidden };
