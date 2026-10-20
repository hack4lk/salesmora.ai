import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { Toast } from '@salesmora/ui';
import { LeadRowDrawer } from '../lead-row-drawer/lead-row-drawer';
import { leadRowDrawerData } from '../lead-row-drawer/lead-row-drawer.data';
import type { LeadCardRecord } from '../lead-card/lead-card';
import { leadCardData } from '../lead-card/lead-card.data';
import { LeadPipelineBoard, type PipelineColumn, type PipelineMove } from './lead-pipeline-board';
import { leadPipelineBoardData as copy, pipelinePreviewColumns } from './lead-pipeline-board.data';

type PreviewProps = { columns: readonly PipelineColumn[]; readOnly?: boolean; outcome?: 'success' | 'error' | 'conflict' };
function Preview({ columns: initial, readOnly = false, outcome = 'success' }: PreviewProps) {
  const [columns, setColumns] = useState(initial);
  const [pending, setPending] = useState<string>();
  const [opened, setOpened] = useState<LeadCardRecord | null>(null);
  const [notice, setNotice] = useState<'success' | 'error' | 'conflict'>();
  const [conflicted, setConflicted] = useState(false);
  async function move({ lead, to }: PipelineMove) {
    if (pending) return;
    const before = columns;
    setPending(lead.id);
    setColumns(current => current.map(column => ({ ...column,
      total: column.total + (column.stage === to ? 1 : column.stage === lead.stage ? -1 : 0),
      leads: column.stage === to ? [...column.leads, { ...lead, stage: to, version: lead.version + 1 }].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, Math.max(25, column.leads.length)) : column.leads.filter(row => row.id !== lead.id),
    })));
    await new Promise(resolve => setTimeout(resolve, 900));
    if (outcome !== 'success') setColumns(before);
    setConflicted(outcome === 'conflict'); setPending(undefined); setNotice(outcome);
  }
  async function load(stage: LeadCardRecord['stage']) {
    setColumns(current => current.map(column => column.stage === stage ? { ...column, loading: true, error: undefined } : column));
    await new Promise(resolve => setTimeout(resolve, 500));
    setColumns(current => current.map(column => {
      if (column.stage !== stage) return column;
      const remaining = Math.max(0, column.total - column.leads.length);
      return { ...column, loading: false, hasMore: remaining > 25,
        leads: [...column.leads, ...Array.from({ length: Math.min(25, remaining) }, (_, index): LeadCardRecord => ({ ...leadCardData.stories.lead,
          id: `${stage}-extra-${column.leads.length + index}`, name: `${copy.stories.names[0]} ${column.leads.length + index + 1}`, stage,
          createdAt: new Date(Date.parse(copy.stories.now) - (column.leads.length + index + 5) * 86400000).toISOString(), canMove: !readOnly,
        }))],
      };
    }));
  }
  return <>
    <LeadPipelineBoard columns={columns.map(column => ({ ...column, leads: column.leads.map(lead => ({ ...lead, canMove: !readOnly && lead.canMove })) }))}
      now={copy.stories.now} timezone={copy.stories.timezone} recordHref={lead => `#preview-${lead.id}`} pendingId={pending}
      onOpen={setOpened} onLoadMore={stage => { void load(stage); }} onConfirmMove={!readOnly && !conflicted ? request => { void move(request); } : undefined}/>
    {opened && <LeadRowDrawer open lead={{ ...leadRowDrawerData.stories.lead, ...opened, permissions: { canMove: false, canAssign: false } }} viewerId="sam" timezone={copy.stories.timezone} recordHref={`#preview-${opened.id}`} onClose={() => setOpened(null)}/>}
    <Toast open={!!notice} kind={notice ?? 'success'} message={notice ? copy.stories[notice === 'error' ? 'failed' : notice] : ''} autoHideMs={notice === 'success' ? copy.successToastMs : null}
      action={notice === 'conflict' ? { label: leadRowDrawerData.reload, onClick: () => { setColumns(initial); setConflicted(false); setNotice(undefined); } } : undefined}
      onClose={() => setNotice(undefined)}/>
  </>;
}
const meta = { title: 'Leads/LeadPipelineBoard', component: Preview, parameters: { layout: 'fullscreen' }, args: { columns: pipelinePreviewColumns },
  decorators: [Story => <main className="min-h-screen min-w-0 max-w-full bg-paper p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-6 mt-3 text-muted">{copy.stories.description}</p><Story/></main>],
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ReadOnly: Story = { args: { readOnly: true }, play: async ({ canvasElement }) => {
  await expect(within(canvasElement).queryByRole('button', { name: copy.move(copy.stories.names[0]) })).not.toBeInTheDocument();
} };
export const ColumnOverflow: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getAllByRole('button', { name: copy.more })[0]);
  await waitFor(() => expect(c.getByText(copy.loaded(29, 29))).toBeInTheDocument());
} };
export const Empty: Story = { args: { columns: pipelinePreviewColumns.map(column => ({ ...column, total: 0, leads: [] })) } };
export const Loading: Story = { args: { columns: pipelinePreviewColumns.map(column => ({ ...column, leads: [], loading: true })) } };
export const LoadError: Story = { args: { columns: pipelinePreviewColumns.map((column, index) => index === 0 ? { ...column, leads: [], error: copy.stories.loadError } : column) } };
export const Narrow: Story = { parameters: { viewport: { value: 'phone' } } };
export const KeyboardMove: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  c.getByRole('button', { name: copy.move(copy.stories.names[0]) }).focus();
  await userEvent.keyboard('{Enter}{ArrowRight}{Enter}');
  await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
  await expect(body.getByRole('combobox', { name: copy.stage })).toHaveValue('contacted');
} };
export const ConfirmMove: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.move(copy.stories.names[0]) }));
  await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(body.getByText(copy.stories.success)).toBeVisible(), { timeout: 5000 });
} };
export const MoveFailed: Story = { ...ConfirmMove, args: { outcome: 'error' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.move(copy.stories.names[0]) }));
  await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(body.getByText(copy.stories.failed)).toBeVisible(), { timeout: 5000 });
  await expect(c.getByText(copy.loaded(25, 29))).toBeInTheDocument();
} };
export const Conflict: Story = { args: { outcome: 'conflict' }, play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.move(copy.stories.names[0]) }));
  await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
  await userEvent.click(body.getByRole('button', { name: copy.confirm }));
  await waitFor(() => expect(body.getByText(copy.stories.conflict)).toBeVisible(), { timeout: 5000 });
} };
export const ExpandedLost: Story = { play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: copy.showLost })); } };

export const LostReason: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.move(copy.stories.names[0]) }));
  await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
  await userEvent.selectOptions(body.getByRole('combobox', { name: copy.stage }), 'lost');
  await expect(body.getByRole('textbox', { name: copy.reason })).toHaveAttribute('maxlength', '500');
} };
export const CancelMove: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: copy.move(copy.stories.names[0]) }));
  await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  await expect(c.getByText(copy.loaded(25, 29))).toBeInTheDocument();
} };

export const Dragging: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement);
  fireEvent.dragStart(c.getByRole('article', { name: copy.stories.names[0] }), { dataTransfer: new DataTransfer() });
  await expect(c.getByRole('status')).toHaveTextContent(copy.stories.names[0]);
} };
