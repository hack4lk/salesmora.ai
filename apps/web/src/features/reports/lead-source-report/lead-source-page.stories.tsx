import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  leadSourceExportColumns,
  leadSourceExportInputSchema,
  leadSourceExportPreviewSchema,
  leadSourceQuerySchema,
  type LeadSourceQuery,
} from '@salesmora/contracts';
import { LeadSourcePage } from './lead-source-page';
import { initialLeadSourceQuery, sourceReadResponse } from './lead-source-read.fixtures';
import { leadSourceReportData as copy } from './lead-source-report.data';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';

let requests: LeadSourceQuery[] = [], release: (() => void) | undefined, aborted = false, settled = false;
const meta = {
  title: 'Reports/LeadSourcePage', component: LeadSourcePage, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Session-bound Sources page host composing the canonical LeadSourceReport with API-shaped mocks, date controls, personal templates, evidence selection, pagination and CSV preview/download. Current authority is checked before rendering results; cancellation and request keys isolate replaced workspaces. Production Reports permissions/navigation remain disabled. Facets, editing and assistant integration are deferred.' } } },
  args: { initial: sourceReadResponse(initialLeadSourceQuery), onRecord: fn(), onReload: fn() },
  beforeEach: ({ args }) => {
    const original = globalThis.fetch; requests = []; release = undefined; aborted = false; settled = false;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith('/api/reports/templates?')) return Response.json([]);
      const url = String(input);
      if (url === '/api/reports/sources/export/preview') {
        const request = leadSourceExportInputSchema.parse(JSON.parse(String(init?.body)));
        const count = request.dataset === 'source-groups' ? 6 : request.dataset === 'cohort' ? 4
          : request.dataset === 'converted' ? 2 : 3;
        return Response.json({
          input: request, workspaceId: args.initial.workspaceId, viewerId: args.initial.viewerId,
          policyRevision: args.initial.policyRevision, leadScope: args.initial.scope,
          leadArchiveVisibility: args.initial.archiveVisibility,
          conversion: { kind: 'available', scope: 'workspace' },
          acceptedValue: { kind: 'available', scope: 'workspace' },
          asOf: args.initial.report.asOf, today: args.initial.report.today, timezone: args.initial.report.timezone,
          dateBasis: 'lead-creation-cohort', coverage: 'Current values as of the snapshot.', count,
          limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
          columns: leadSourceExportColumns(request),
        });
      }
      if (url === '/api/reports/sources/export') {
        const request = leadSourceExportInputSchema.parse(JSON.parse(String(init?.body)));
        const count = request.dataset === 'source-groups' ? 6 : request.dataset === 'cohort' ? 4
          : request.dataset === 'converted' ? 2 : 3;
        const columns = leadSourceExportColumns(request);
        const body = '\uFEFF' + columns.map(column => `"${column}"`).join(',') + '\r\n' +
          Array.from({ length: count }, () => columns.map(() => '"fixture"').join(',') + '\r\n').join('');
        const generation = {
          id: '00000000-0000-4000-8000-000000000099', workspaceId: args.initial.workspaceId,
          policyRevision: args.initial.policyRevision, leadScope: args.initial.scope,
          leadArchiveVisibility: args.initial.archiveVisibility,
          conversion: { kind: 'available', scope: 'workspace' },
          acceptedValue: { kind: 'available', scope: 'workspace' },
          asOf: args.initial.report.asOf, today: args.initial.report.today, timezone: args.initial.report.timezone,
          dateBasis: 'lead-creation-cohort', count,
          limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
        };
        return new Response(body, { headers: {
          'content-type': 'text/csv; charset=utf-8',
          'x-report-export': btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(generation))))
            .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''),
        } });
      }
      if (!url.startsWith('/api/reports/sources?')) return original(input, init);
      const query = leadSourceQuerySchema.parse(JSON.parse(new URL(url, 'https://story.example.test').searchParams.get('query')!));
      requests.push(query);
      return Response.json(sourceReadResponse(query, { scope: args.initial.scope,
        canReadConversion: args.initial.canReadConversion, canReadAcceptedValue: args.initial.canReadAcceptedValue,
        canExport: args.initial.canExport,
        invalidMoney: args.initial.report.acceptedValue.kind === 'unavailable' && args.initial.report.acceptedValue.reason === 'invalid-money' }));
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
} satisfies Meta<typeof LeadSourcePage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const BackendContracts: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(canvas.getByRole('group', { name: copy.cohort })).toHaveTextContent('4');
    await expect(canvas.getByRole('group', { name: copy.acceptedValue })).toHaveTextContent('$2,650.00');
    await selectMetricEvidence(canvasElement, copy.converted);
    await canvas.findByText(copy.evidence.converted, { selector: 'p' });
    await userEvent.click(canvas.getByRole('button', { name: 'View record: Website inquiry' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000000101');
    await selectMetricEvidence(canvasElement, copy.acceptedValue);
    await canvas.findByText(copy.evidence.estimates, { selector: 'p' });
    expect(requests.map(query => query.selected)).toEqual(['converted', 'accepted-estimates']);
    expect(canvas.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    expect(canvas.queryByRole('button', { name: 'View record: Multiple-lead estimate' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getAllByRole('button', { name: 'View record: Website inquiry' })[0]!);
    await expect(args.onRecord).toHaveBeenLastCalledWith('00000000-0000-4000-8000-000000000101');
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    const dialog = within(canvasElement.ownerDocument.body);
    await dialog.findByRole('alertdialog', { name: 'Review CSV export' });
    await waitFor(() => expect(dialog.getByText('salesmora-sources-source-groups-2026-11-06.csv')).toBeVisible());
    await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(dialog.queryByRole('alertdialog')).not.toBeInTheDocument());
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Rows per page' }), '50');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Rows per page' })).toBeEnabled());
    expect(requests.at(-1)?.pageSize).toBe(50);
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
    fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-08-30' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
    await waitFor(() => expect(canvas.getByRole('group', { name: copy.cohort })).toHaveTextContent('0'));
    expect(requests.at(-1)).toMatchObject({ period: { from: '2026-08-01', to: '2026-08-30' }, selected: 'cohort', page: 1, pageSize: 50 });
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
  },
};
export const ExportDenied: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input) === '/api/reports/sources/export/preview'
      ? Response.json({ error: 'Unavailable' }, { status: 403 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), dialog = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(dialog.getByText('This Sources export is unavailable under current access.')).toBeVisible());
    await expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Reload report access' })).toBeVisible();
  },
};
export const ExportChanged: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const response = await original(input, init);
      if (String(input) !== '/api/reports/sources/export/preview') return response;
      const preview = leadSourceExportPreviewSchema.parse(await response.json());
      return Response.json({ ...preview, policyRevision: preview.policyRevision + 1 });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), dialog = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(dialog.getByText('Sources export data or access changed. Refresh the preview and review again.')).toBeVisible());
    await expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Reload report access' })).toBeVisible();
  },
};
export const ExportCancelled: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (String(input) !== '/api/reports/sources/export') return original(input, init);
      return new Promise<Response>((_, reject) => {
        if (init?.signal?.aborted) { reject(init.signal.reason); return; }
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
      });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), dialog = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeVisible());
    await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Cancel download' })).toBeVisible());
    await userEvent.click(dialog.getByRole('button', { name: 'Cancel download' }));
    await waitFor(() => expect(dialog.getByText('CSV download cancelled. No file was saved.')).toBeVisible());
    await expect(dialog.getByRole('alertdialog', { name: 'Review CSV export' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled();
  },
};
export const AssignedAuthority: Story = {
  args: { initial: sourceReadResponse(initialLeadSourceQuery, { scope: 'assigned' }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: copy.cohort })).toHaveTextContent('1');
    expect(canvas.queryByRole('button', { name: `Actions: ${copy.converted}` })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: `Actions: ${copy.acceptedValue}` })).not.toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Rows per page' }), '50');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Rows per page' })).toBeEnabled());
    await expect(canvas.getByRole('group', { name: copy.cohort })).toHaveTextContent('1');
    expect(canvas.queryByRole('button', { name: 'View record: Archived phone inquiry' })).not.toBeInTheDocument();
  },
};
export const ValueUnavailable: Story = {
  args: { initial: sourceReadResponse(initialLeadSourceQuery, { canReadAcceptedValue: false }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: copy.converted })).toHaveTextContent('2');
    expect(canvas.queryByRole('button', { name: `Actions: ${copy.acceptedValue}` })).not.toBeInTheDocument();
    expect(canvas.queryByText('$2,650.00')).not.toBeInTheDocument();
    await selectMetricEvidence(canvasElement, copy.converted);
    await canvas.findByText(copy.evidence.converted, { selector: 'p' });
    expect(canvas.queryByText('$2,650.00')).not.toBeInTheDocument();
  },
};
export const InvalidMoney: Story = {
  args: { initial: sourceReadResponse(initialLeadSourceQuery, { invalidMoney: true }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: copy.converted })).toHaveTextContent('2');
    await expect(canvas.getByText('The frozen quote value could not be verified.')).toBeVisible();
    expect(canvas.queryByRole('button', { name: `Actions: ${copy.acceptedValue}` })).not.toBeInTheDocument();
    await selectMetricEvidence(canvasElement, copy.converted);
    await canvas.findByText(copy.evidence.converted, { selector: 'p' });
    await expect(canvas.getByText('The frozen quote value could not be verified.')).toBeVisible();
  },
};
export const AccessRevoked: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/reports/sources?')
      ? Response.json({ error: 'This report is unavailable.' }, { status: 404 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await selectMetricEvidence(canvasElement, copy.converted);
    await expect(await canvas.findByText('This report is unavailable.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('region', { name: 'Reporting period' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reload report access' }));
    await expect(args.onReload).toHaveBeenCalled();
  },
};
export const ChangedPolicy: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/sources?')) return original(input, init);
      const query = leadSourceQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      return Response.json({ ...sourceReadResponse(query), policyRevision: 2 });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectMetricEvidence(canvasElement, copy.converted);
    await expect(await canvas.findByText('Sources report results no longer match this request or current authority. Reload the report.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
  },
};
export const ErrorRetry: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    let failed = false;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/sources?')) return original(input, init);
      if (!failed) { failed = true; return Response.json({ error: 'Sources report could not be loaded. Try again.' }, { status: 500 }); }
      const query = leadSourceQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      return Response.json(sourceReadResponse(query));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectMetricEvidence(canvasElement, copy.converted);
    await expect(await canvas.findByText('Sources report could not be loaded. Try again.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Retry report' }));
    await expect(await canvas.findByText(copy.evidence.converted, { selector: 'p' })).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(2);
  },
};
export const WorkspaceRace: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => setInitial(sourceReadResponse({
      ...initialLeadSourceQuery, workspaceId: '00000000-0000-4000-8000-000000000002',
    }, { replacement: true }))}>Switch authorized workspace</button><LeadSourcePage {...args} initial={initial} /></>;
  },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/sources?')) return original(input, init);
      const query = leadSourceQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      init?.signal?.addEventListener('abort', () => { aborted = true; }, { once: true });
      // Ignore cancellation so the story verifies isolation from a completed late response.
      await new Promise<void>(resolve => { release = resolve; });
      settled = true;
      return Response.json(sourceReadResponse(query));
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectMetricEvidence(canvasElement, copy.converted);
    await waitFor(() => expect(release).toBeDefined());
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Switch authorized workspace' }));
    await expect(canvas.getByRole('button', { name: 'View record: Replacement Website inquiry' })).toBeVisible();
    expect(aborted).toBe(true);
    release?.();
    await waitFor(() => expect(settled).toBe(true));
    await waitFor(() => expect(canvas.getByText(copy.evidence.cohort, { selector: 'p' })).toBeVisible());
    expect(canvas.queryByRole('button', { name: 'View record: Website inquiry' })).not.toBeInTheDocument();
  },
};
