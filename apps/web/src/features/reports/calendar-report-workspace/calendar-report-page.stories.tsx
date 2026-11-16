import { useState } from 'react';
import { reportSnapshotDecorator } from '../report-snapshot.story-helpers';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { calendarReportQuerySchema, calendarExportInputSchema, calendarExportColumns, type CalendarReportQuery } from '@salesmora/contracts';
import { CalendarReportPage } from './calendar-report-page';
import { initialCalendarQuery, calendarReadResponse } from './calendar-read.fixtures';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { calendarExportDatasetsForView } from './calendar-export.client';

let requests: CalendarReportQuery[] = [], release: (() => void) | undefined, aborted = false, settled = false;
const meta = {
  decorators: [reportSnapshotDecorator],
  title: 'Reports/CalendarReportPage', component: CalendarReportPage, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'API-bound canonical Calendar workspace with separate dated/undated drafts, current authorized facets, per-record attribution and CSV review/download. Initial data is server supplied; request keys, cancellation and current authority prevent stale evidence. Visible typed record links are enabled; Calendar deep links, configuration and production activation remain deferred.' } } },
  args: { initial: calendarReadResponse(initialCalendarQuery), onRecord: fn(), onReload: fn() },
  beforeEach: ({ args }) => {
    const original = globalThis.fetch; requests = []; release = undefined; aborted = false; settled = false;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith('/api/reports/templates?')) return Response.json([]);
      if (String(input).startsWith('/api/reports/calendar/export')) {
        const request = calendarExportInputSchema.parse(JSON.parse(String(init?.body)));
        const count = request.dataset === 'summary' ? 1
          : request.dataset === 'days' && 'period' in request.query
            ? (Date.parse(request.query.period.to) - Date.parse(request.query.period.from)) / 86400000 + 1 : 2;
        const columns = calendarExportColumns(request);
        const metadata = {
          workspaceId: args.initial.workspaceId, policyRevision: args.initial.policyRevision, scope: args.initial.scope,
          outputScopes: args.initial.exportScopes, asOf: args.initial.report.asOf, today: args.initial.report.today,
          timezone: args.initial.report.timezone, count, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 },
          dateBasis: request.query.view === 'calendar-unscheduled' ? 'current-unscheduled' : 'current-scheduled-date',
        };
        if (String(input).endsWith('/preview')) return Response.json({ ...metadata, input: request,
          viewerId: args.initial.viewerId, columns, coverage: 'Current export-authorized active records only.' });
        const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
        const body = '\uFEFF' + columns.map(column => `"${column}"`).join(',') + '\r\n' +
          Array.from({ length: count }, () => columns.map(() => '"fixture"').join(',') + '\r\n').join('');
        return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
          'x-report-export': btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(generation))))
            .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''),
        } });
      }
      if (!String(input).startsWith('/api/reports/calendar?')) return original(input, init);
      const query = calendarReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      requests.push(query);
      return Response.json(calendarReadResponse(query, args.initial.scope));
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
} satisfies Meta<typeof CalendarReportPage>;
export default meta;
type Story = StoryObj<typeof meta>;
const summary = (element: HTMLElement) => within(within(element).getByRole('region', { name: 'Report summary' }));
async function selectFacet(element: HTMLElement, facet: string, label: string) {
  const canvas = within(element), body = within(element.ownerDocument.body);
  await userEvent.click(canvas.getByRole('combobox', { name: facet }));
  await userEvent.keyboard('{ArrowDown}');
  const option = await body.findByRole('option', { name: label });
  await waitFor(() => expect(option).toBeVisible());
  await userEvent.click(option); await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
}
async function switchView(element: HTMLElement, view: string) {
  const canvas = within(element);
  await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), view);
  await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
}
async function emptyPeriod(element: HTMLElement) {
  const canvas = within(element);
  fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
  fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-08-30' } });
  await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
}
export const BackendContracts: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('4');
    await userEvent.click(canvas.getByRole('button', { name: 'View record: WO-001 / shared Work Order' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith({ id: '00000000-0000-4000-8000-000000000401', type: 'work_order' });
    expect(canvas.queryByRole('button', { name: /^View Calendar:/ })).not.toBeInTheDocument();
    await selectMetricEvidence(canvasElement, 'Busy person-days');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
    expect(requests.at(-1)).toMatchObject({ view: 'calendar-scheduled', selected: 'busy-person-days' });
    await switchView(canvasElement, 'review');
    await selectMetricEvidence(canvasElement, 'Past scheduled visits');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
    expect(requests.at(-1)).toMatchObject({ view: 'calendar-review', selected: 'past' });
    await switchView(canvasElement, 'unscheduled');
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    for (const [label, selected] of [['Unscheduled Job records', 'jobs'], ['Unscheduled Work Order records', 'workOrders']] as const) {
      await selectMetricEvidence(canvasElement, label);
      await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toBeEnabled());
      expect(requests.at(-1)).toMatchObject({ view: 'calendar-unscheduled', selected });
      expect(requests.at(-1)).not.toHaveProperty('period');
    }
    expect(canvas.getAllByRole('region', { name: 'Supporting evidence' })).toHaveLength(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    const dialog = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    await userEvent.selectOptions(dialog.getByRole('combobox', { name: 'CSV dataset' }), 'workOrders');
    await waitFor(() => expect(dialog.getByText('salesmora-calendar-unscheduled-workOrders-2026-11-06.csv')).toBeVisible());
    await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(dialog.queryByRole('alertdialog')).not.toBeInTheDocument());
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Rows per page' }), '50');
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Rows per page' })).toBeEnabled());
    expect(requests.at(-1)?.pageSize).toBe(50);
    await switchView(canvasElement, 'scheduled');
    await emptyPeriod(canvasElement);
    await waitFor(() => expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('0'));
    expect(requests.at(-1)).toMatchObject({ period: { from: '2026-08-01', to: '2026-08-30' }, selected: 'visits', page: 1 });
  },
};
export const ExportChanged: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      const response = await original(input, init);
      if (String(input) !== '/api/reports/calendar/export') return response;
      const encoded = response.headers.get('x-report-export')!;
      const metadata = JSON.parse(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')));
      const headers = new Headers(response.headers);
      headers.set('x-report-export', btoa(JSON.stringify({ ...metadata, policyRevision: metadata.policyRevision + 1 }))
        .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''));
      return new Response(response.body, { headers });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), dialog = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(dialog.getByText('Calendar export data or access changed. Refresh the preview and review again.')).toBeVisible());
    await expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeDisabled();
  },
};
export const ExportDatasets: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), dialog = within(canvasElement.ownerDocument.body);
    for (const [view, queryView] of [['scheduled', 'calendar-scheduled'], ['review', 'calendar-review'],
      ['unscheduled', 'calendar-unscheduled']] as const) {
      await switchView(canvasElement, view);
      for (const dataset of calendarExportDatasetsForView(queryView)) {
        await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
        await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
        await userEvent.selectOptions(dialog.getByRole('combobox', { name: 'CSV dataset' }), dataset);
        await waitFor(() => expect(dialog.getByText(`salesmora-${queryView}-${dataset}-2026-11-06.csv`)).toBeVisible());
        await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
        await waitFor(() => expect(dialog.queryByRole('alertdialog')).not.toBeInTheDocument());
      }
    }
  },
};
export const ExportDenied: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input) === '/api/reports/calendar/export/preview'
      ? Response.json({ error: 'Unavailable' }, { status: 403 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), dialog = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(dialog.getByText('This Calendar export is unavailable under current access.')).toBeVisible());
    await expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeDisabled();
  },
};
export const ExportCancelled: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input) === '/api/reports/calendar/export'
      ? new Promise<Response>((_, reject) => {
        if (init?.signal?.aborted) { reject(init.signal.reason); return; }
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
      }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), dialog = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
    await userEvent.click(dialog.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Cancel download' })).toBeVisible());
    await userEvent.click(dialog.getByRole('button', { name: 'Cancel download' }));
    await waitFor(() => expect(dialog.getByText('CSV download cancelled. No file was saved.')).toBeVisible());
    await expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeEnabled();
  },
};
export const IndependentFilters: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectFacet(canvasElement, 'Current participant', 'Blair');
    await selectFacet(canvasElement, 'Record type', 'Work Order');
    await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('1');
    expect(canvas.queryByRole('button', { name: /^View record: J-/ })).not.toBeInTheDocument();
    await switchView(canvasElement, 'review');
    await expect(canvas.getByRole('button', { name: 'Remove filter: Current participant: Blair' })).toBeVisible();
    await switchView(canvasElement, 'unscheduled');
    expect(canvas.queryByRole('button', { name: 'Remove filter: Current participant: Blair' })).not.toBeInTheDocument();
    await selectFacet(canvasElement, 'Record type', 'Job');
    expect(requests.at(-1)?.filters).toEqual({ participants: [], recordTypes: ['job'] });
    await switchView(canvasElement, 'scheduled');
    expect(requests.at(-1)?.filters).toEqual({ participants: ['blair'], recordTypes: ['work_order'] });
  },
};
export const OwnAuthority: Story = {
  args: { initial: calendarReadResponse(initialCalendarQuery, { kind: 'own', viewerId: 'blair' }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(summary(canvasElement).getByRole('group', { name: 'Distinct scheduled visits' })).toHaveTextContent('1');
    expect(canvas.queryByRole('button', { name: /^View record: J-/ })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'View record: WO-001 / shared Work Order' }));
    await expect(args.onRecord).toHaveBeenLastCalledWith({ id: '00000000-0000-4000-8000-000000000401', type: 'work_order' });
    await switchView(canvasElement, 'unscheduled');
    expect(canvas.queryByRole('button', { name: /^View record: J-/ })).not.toBeInTheDocument();
  },
};
export const AccessRevoked: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/reports/calendar?')
      ? Response.json({ error: 'This report is unavailable.' }, { status: 404 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'review');
    await expect(await canvas.findByText('This report is unavailable.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current participant' })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reload report access' }));
    await expect(args.onReload).toHaveBeenCalled();
  },
};
export const ChangedPolicy: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/calendar?')) return original(input, init);
      const query = calendarReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      return Response.json({ ...calendarReadResponse(query), policyRevision: 2 });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'review');
    await expect(await canvas.findByText('Calendar report results no longer match this request or current authority. Reload the report.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current participant' })).not.toBeInTheDocument();
  },
};
export const ErrorRetry: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    let failed = false;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/calendar?')) return original(input, init);
      if (!failed) { failed = true; return Response.json({ error: 'Calendar report could not be loaded. Try again.' }, { status: 500 }); }
      const query = calendarReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      return Response.json(calendarReadResponse(query));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'review');
    await expect(await canvas.findByText('Calendar report could not be loaded. Try again.')).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Retry filters' }));
    await waitFor(() => expect(summary(canvasElement).getByRole('group', { name: 'Overlapping arrival-window pairs' })).toHaveTextContent('1'));
  },
};
export const WorkspaceRace: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => setInitial(calendarReadResponse({
      ...initialCalendarQuery, workspaceId: '00000000-0000-4000-8000-000000000002',
    }, { kind: 'workspace' }, true))}>Switch authorized workspace</button><CalendarReportPage {...args} initial={initial} /></>;
  },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/calendar?')) return original(input, init);
      const query = calendarReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      init?.signal?.addEventListener('abort', () => { aborted = true; }, { once: true });
      // Ignore abort to verify that a completed old transport cannot restore stale records.
      await new Promise<void>(resolve => { release = resolve; });
      settled = true;
      return Response.json(calendarReadResponse(query));
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Report view' }), 'review');
    await waitFor(() => expect(release).toBeDefined());
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Switch authorized workspace' }));
    await expect(canvas.getByRole('button', { name: 'View record: Replacement WO-001 / shared Work Order' })).toBeVisible();
    expect(aborted).toBe(true);
    release?.();
    await waitFor(() => expect(settled).toBe(true));
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Report view' })).toHaveValue('scheduled'));
    expect(canvas.queryByRole('button', { name: 'View record: WO-001 / shared Work Order' })).not.toBeInTheDocument();
  },
};
