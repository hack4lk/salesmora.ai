import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within, waitFor } from 'storybook/test';
import { leadReportExportInputSchema, leadReportExportColumns, leadReportQuerySchema,
  type LeadReportExportInput } from '@salesmora/contracts';
import { LeadReportPage } from './lead-report-page';
import { leadReportBackendResponse, initialLeadReportQuery } from './lead-report.adapter.fixtures';

let mode: 'ready' | 'changed' | 'interrupted' | 'blocked' | 'limit' | 'denied' | 'zero' | 'race' | 'assigned' = 'ready';
let submissions: LeadReportExportInput[] = [], saved: string[] = [], blobs: Blob[] = [], release: (() => void) | undefined;
function authority(query = initialLeadReportQuery) { return { ...leadReportBackendResponse(query), exportScope: 'workspace' as const }; }
function preview(input: LeadReportExportInput) {
  const report = authority().report;
  return { input, workspaceId: input.query.workspaceId, viewerId: authority().viewerId, policyRevision: 1, scope: mode === 'assigned' ? 'assigned' : 'workspace',
    archiveVisibility: 'included', asOf: report.asOf, today: report.today, timezone: report.timezone,
    dateBasis: input.query.view === 'intake' ? 'creation-date' : ['won', 'lost'].includes(input.query.view)
      ? 'recorded-transition-date' : 'current-snapshot', coverage: 'Fictional native report population.',
    count: mode === 'limit' ? 50001 : mode === 'zero' ? 0 : input.dataset === 'evidence' ? 131 : 3,
    limits: { rows: 50000, bytes: 33554432, durationMs: 30000 }, columns: leadReportExportColumns(input) };
}
function csvResponse(input: LeadReportExportInput) {
  const value = preview(input);
  const metadata = { id: '00000000-0000-4000-8000-000000000099', workspaceId: value.workspaceId, policyRevision: value.policyRevision,
    scope: value.scope, archiveVisibility: value.archiveVisibility, asOf: value.asOf, today: value.today, timezone: value.timezone,
    dateBasis: value.dateBasis, count: mode === 'changed' ? value.count + 1 : value.count, limits: value.limits };
  const csv = '\uFEFF' + value.columns.map(column => `"${column}"`).join(',') + '\r\n' +
    Array.from({ length: value.count }, () => value.columns.map(() => '"Fictional report cell"').join(',') + '\r\n').join('');
  const stream = mode === 'blocked' ? new ReadableStream<Uint8Array>()
    : mode === 'interrupted' ? new ReadableStream<Uint8Array>({ start(controller) {
      controller.enqueue(new TextEncoder().encode(csv));
      controller.error(new Error('CSV connection interrupted.'));
    } }) : csv;
  return new Response(stream, { headers: { 'content-type': 'text/csv; charset=utf-8',
    'x-report-export': btoa(JSON.stringify(metadata)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '') } });
}
const meta = {
  title: 'Reports/LeadReportCSVPage', component: LeadReportPage, parameters: { layout: 'fullscreen' },
  args: { initial: authority(), onRecord: fn(), onReload: fn() },
  beforeEach: () => {
    mode = 'ready'; submissions = []; saved = []; blobs = []; release = undefined;
    const original = globalThis.fetch, create = URL.createObjectURL, click = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = blob => { if (blob instanceof Blob) blobs.push(blob); return create(blob); };
    HTMLAnchorElement.prototype.click = function () { if (this.href.startsWith('blob:')) saved.push(this.download); else click.call(this); };
    globalThis.fetch = async (url, init) => {
      const path = String(url);
      if (path.startsWith('/api/reports/templates?')) return Response.json([]);
      if (path.startsWith('/api/reports/leads?')) {
        const query = leadReportQuerySchema.parse(JSON.parse(new URL(path, 'https://story.example.test').searchParams.get('query')!));
        return Response.json(authority(query));
      }
      if (!path.startsWith('/api/reports/leads/export')) return original(url, init);
      const input = leadReportExportInputSchema.parse(JSON.parse(String(init?.body)));
      submissions.push(input);
      if (mode === 'denied') return Response.json({ error: 'Export unavailable.' }, { status: 404 });
      if (path.endsWith('/preview')) {
        if (mode === 'race') await new Promise<void>(resolve => { release = resolve; });
        return Response.json(preview(input));
      }
      return csvResponse(input);
    };
    return () => { globalThis.fetch = original; URL.createObjectURL = create; HTMLAnchorElement.prototype.click = click; release?.(); };
  },
} satisfies Meta<typeof LeadReportPage>;
export default meta;
type Story = StoryObj<typeof meta>;
async function open(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
  await within(document.body).findByRole('alertdialog', { name: 'Review CSV export' });
  return within(document.body);
}
export const FullEvidenceAndTables: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const view of ['intake', 'pipeline', 'age', 'won', 'lost', 'attention']) {
      if (view !== 'intake') {
        await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), view);
        await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
      }
      let dialog = await open(canvasElement);
      await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
      await waitFor(() => expect(dialog.getByText('131', { exact: true })).toBeVisible());
      await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
      await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).not.toBeInTheDocument());
      dialog = await open(canvasElement);
      const dataset = view === 'intake' ? 'intake-days' : view === 'pipeline' ? 'pipeline-stages'
        : view === 'age' ? 'age-bands' : view === 'attention' ? 'attention-categories' : 'outcomes';
      await userEvent.selectOptions(dialog.getByRole('combobox', { name: 'CSV dataset' }), dataset);
      await waitFor(() => expect(within(document.body).getByRole('button', { name: 'Download CSV' })).toBeEnabled());
      await userEvent.click(within(document.body).getByRole('button', { name: 'Download CSV' }));
      await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).not.toBeInTheDocument());
    }
    expect(saved).toHaveLength(12); expect(blobs).toHaveLength(12);
    expect(submissions.every(input => !('page' in input.query) && !('pageSize' in input.query))).toBe(true);
    expect(new TextDecoder('utf-8', { ignoreBOM: true }).decode(await blobs[0]!.arrayBuffer())).toMatch(/^\uFEFF"report_view"/);
  },
};
export const ChangedGeneration: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement);
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    mode = 'changed'; await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(within(document.body).getByText(/row count changed since preview/)).toBeVisible());
    expect(saved).toHaveLength(0);
    mode = 'ready'; await userEvent.click(within(document.body).getByRole('button', { name: 'Refresh preview' }));
    await waitFor(() => expect(within(document.body).getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    await userEvent.click(within(document.body).getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(saved).toHaveLength(1));
  },
};
export const InterruptedAndRetry: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement);
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    mode = 'interrupted'; await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(within(document.body).getByText('CSV connection interrupted.')).toBeVisible());
    expect(saved).toHaveLength(0);
    mode = 'ready'; await userEvent.click(within(document.body).getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(saved).toHaveLength(1));
  },
};
export const CancelBlockedDownload: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement);
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    mode = 'blocked'; await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await userEvent.click(await within(document.body).findByRole('button', { name: 'Cancel download' }));
    await waitFor(() => expect(within(document.body).getByText('CSV download cancelled. No file was saved.')).toBeVisible());
    expect(saved).toHaveLength(0);
    await userEvent.click(within(document.body).getByRole('button', { name: /^Cancel$/ }));
  },
};
export const LimitAndDeniedPreview: Story = {
  play: async ({ canvasElement, args }) => {
    mode = 'limit'; await open(canvasElement);
    await waitFor(() => expect(within(document.body).getByText(/exceeds its technical CSV limits/)).toBeVisible());
    await expect(within(document.body).getByRole('button', { name: 'Download CSV' })).toBeDisabled();
    mode = 'denied'; await userEvent.click(within(document.body).getByRole('button', { name: 'Refresh preview' }));
    await waitFor(() => expect(within(document.body).getByText(/No file can be generated/)).toBeVisible());
    expect(saved).toHaveLength(0);
    await userEvent.click(within(document.body).getByRole('button', { name: 'Reload report access' }));
    await expect(args.onReload).toHaveBeenCalled();
  },
};
export const ZeroEvidence: Story = {
  args: { initial: authority(leadReportQuerySchema.parse({ ...initialLeadReportQuery,
    period: { from: '2026-08-01', to: '2026-08-31' } })) },
  play: async ({ canvasElement }) => {
    mode = 'zero'; const dialog = await open(canvasElement);
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    await waitFor(() => expect(within(within(document.body).getByRole('alertdialog')).getByText('0', { exact: true })).toBeVisible());
    await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(saved).toHaveLength(1));
  },
};
export const SelectedBucketAndTableScope: Story = {
  args: { initial: authority(leadReportQuerySchema.parse({ ...initialLeadReportQuery, trendBucket: '2026-10-15', page: 3, pageSize: 100 })) },
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement);
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    expect(submissions[0]?.query).toMatchObject({ trendBucket: '2026-10-15' });
    expect(submissions[0]?.query).not.toHaveProperty('pageSize');
    await userEvent.selectOptions(dialog.getByRole('combobox', { name: 'CSV dataset' }), 'intake-sources');
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    expect(submissions.at(-1)?.query).not.toHaveProperty('trendBucket');
    await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(saved).toEqual(['salesmora-leads-intake-intake-sources-2026-11-05.csv']));
  },
};
export const LateWorkspacePreview: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => setInitial(authority(leadReportQuerySchema.parse({
      ...initialLeadReportQuery, workspaceId: '00000000-0000-4000-8000-000000000002',
    })))}>Switch workspace during export</button><LeadReportPage {...args} initial={initial} /></>;
  },
  play: async ({ canvasElement }) => {
    mode = 'race'; await open(canvasElement);
    await waitFor(() => expect(release).toBeDefined());
    const replacement = authority(leadReportQuerySchema.parse({ ...initialLeadReportQuery,
      workspaceId: '00000000-0000-4000-8000-000000000002' }));
    // The parent session changes can occur externally while the modal owns focus.
    within(canvasElement).getByRole('button', { name: 'Switch workspace during export', hidden: true }).click();
    release?.();
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(saved).toHaveLength(0); expect(replacement.workspaceId).not.toBe(submissions[0]?.query.workspaceId);
  },
};
export const DefaultOff: Story = {
  args: { initial: leadReportBackendResponse(initialLeadReportQuery) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Export Report Data' })).toBeDisabled();
    expect(submissions).toHaveLength(0);
  },
};
export const WorkspaceChangeDuringDownload: Story = {
  render: LateWorkspacePreview.render,
  play: async ({ canvasElement }) => {
    const dialog = await open(canvasElement);
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    mode = 'blocked'; await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await within(document.body).findByRole('button', { name: 'Cancel download' });
    within(canvasElement).getByRole('button', { name: 'Switch workspace during export', hidden: true }).click();
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(saved).toHaveLength(0);
  },
};
export const NarrowedExportScope: Story = {
  args: { initial: { ...authority(), exportScope: 'assigned' } },
  play: async ({ canvasElement }) => {
    mode = 'assigned'; const dialog = await open(canvasElement);
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    await waitFor(() => expect(dialog.getByText('assigned / archives included')).toBeVisible());
    await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(saved).toHaveLength(1));
  },
};
