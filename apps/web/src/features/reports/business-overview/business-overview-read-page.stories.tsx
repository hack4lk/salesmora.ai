import { useState } from 'react';
import { reportSnapshotDecorator } from '../report-snapshot.story-helpers';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { businessOverviewQuerySchema, businessOverviewReadResultSchema, businessOverviewExportInputSchema,
  businessOverviewExportColumns, reportTemplateUpdateSchema, type ReportTemplate, type BusinessOverviewQuery } from '@salesmora/contracts';
import { BusinessOverviewReadPage } from './business-overview-read-page';
import { initialOverviewQuery, overviewReadResponse } from './business-overview-read.fixtures';
import { overviewBackendAuthority } from './business-overview.adapter.fixtures';
import { overviewAttentionHref } from './business-overview-navigation';
import { overviewAttentionIds } from './business-overview.validation';

let requests: BusinessOverviewQuery[] = [], release: (() => void) | undefined, aborted = false, settled = false;
async function applyEmptyPeriod(element: HTMLElement) {
  const canvas = within(element);
  fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
  fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-08-30' } });
  await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
}
const meta = {
  decorators: [reportSnapshotDecorator],
  title: 'Reports/BusinessOverviewReadPage', component: BusinessOverviewReadPage, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Session-bound Overview host composing the canonical BusinessOverviewPage with native API-shaped mocks and personal templates. Native domains and CSV export scopes remain independently available; period/current bases are preserved. Production permissions/navigation and assistant integration remain deferred.' } } },
  args: { initial: overviewReadResponse(initialOverviewQuery), onReload: fn(), onNavigate: fn() },
  beforeEach: ({ args }) => {
    const original = globalThis.fetch; requests = []; release = undefined; aborted = false; settled = false;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith('/api/reports/templates?')) return Response.json([]);
      if (String(input).startsWith('/api/reports/overview/export')) {
        const request = businessOverviewExportInputSchema.parse(JSON.parse(String(init?.body)));
        const metadata = { workspaceId: args.initial.workspaceId, policyRevision: args.initial.policyRevision,
          asOf: '2026-11-06T10:00:00Z', today: args.initial.report.today, timezone: args.initial.report.timezone,
          scopes: { lead: null, job: 'workspace', estimate: null, calendar: null }, count: 4,
          limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
        if (String(input).endsWith('/preview')) return Response.json({ ...metadata, input: request,
          viewerId: args.initial.viewerId, columns: businessOverviewExportColumns, coverage: 'Partial fictional export authority.' });
        const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
        const body = '\uFEFF' + businessOverviewExportColumns.map(column => `"${column}"`).join(',') + '\r\n' +
          Array.from({ length: 4 }, () => businessOverviewExportColumns.map(() => '"fixture"').join(',') + '\r\n').join('');
        return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
          'x-report-export': btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(generation))))
            .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''),
        } });
      }
      if (!String(input).startsWith('/api/reports/overview?')) return original(input, init);
      const query = businessOverviewQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      requests.push(query);
      return Response.json(overviewReadResponse(query, args.initial.authority,
        args.initial.report.estimates.kind === 'available' && args.initial.report.estimates.acceptedMoney.kind === 'unavailable'));
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
} satisfies Meta<typeof BusinessOverviewReadPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const TemplatesModal: Story = {
  beforeEach: ({ args }) => {
    const original = globalThis.fetch;
    let templates: ReportTemplate[] = [{
      id: '00000000-0000-4000-8000-000000000099', workspaceId: args.initial.workspaceId,
      area: 'overview', name: 'Monthly overview', version: 1,
      configuration: { area: 'overview', query: { view: 'business-overview' },
        period: { preset: 'custom', ...args.initial.query.period } },
      createdAt: '2026-11-06T12:00:00.000Z', updatedAt: '2026-11-06T12:00:00.000Z',
    }];
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/templates')) return original(input, init);
      if (!init?.method || init.method === 'GET') return Response.json(templates);
      const template = templates[0];
      if (!template) throw new Error('Overview story template unavailable.');
      if (init.method === 'POST' && String(input).endsWith('/run')) return Response.json({ template, result: args.initial });
      if (init.method === 'PATCH') {
        const change = reportTemplateUpdateSchema.parse(JSON.parse(String(init.body)));
        templates = [{ ...template, name: change.name ?? template.name, version: template.version + 1 }];
        return Response.json(templates[0]);
      }
      if (init.method === 'DELETE') {
        templates = [];
        return new Response(null, { status: 204 });
      }
      throw new Error('Unexpected Overview template story request.');
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'My Templates' });
    expect(canvas.queryByRole('heading', { name: 'My templates' })).not.toBeInTheDocument();
    await userEvent.click(trigger);
    let modal = await body.findByRole('dialog', { name: 'My Templates' });
    await within(modal).findByRole('button', { name: 'Run report: Monthly overview' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog', { name: 'My Templates' })).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: 'View my templates' }));
    modal = await body.findByRole('dialog', { name: 'My Templates' });
    await userEvent.click(within(modal).getByRole('button', { name: 'Create Report Template' }));
    const saveDialog = await body.findByRole('alertdialog', { name: 'Save this report as a template' });
    await userEvent.click(within(saveDialog).getByRole('button', { name: 'Cancel' }));
    modal = await body.findByRole('dialog', { name: 'My Templates' });
    await userEvent.click(within(modal).getByRole('button', { name: 'Run report: Monthly overview' }));
    await waitFor(() => expect(body.queryByRole('dialog', { name: 'My Templates' })).not.toBeInTheDocument());
    await canvas.findByRole('button', { name: 'Update this template' });
    await userEvent.click(canvas.getByRole('button', { name: 'My Templates' }));
    modal = await body.findByRole('dialog', { name: 'My Templates' });
    await userEvent.click(await within(modal).findByRole('button', { name: 'Template options: Monthly overview' }));
    await userEvent.click(await body.findByRole('menuitem', { name: 'Rename' }));
    const rename = await body.findByRole('textbox', { name: 'Template name' });
    fireEvent.change(rename, { target: { value: 'Renamed overview' } });
    await userEvent.click(body.getByRole('button', { name: 'Save name' }));
    modal = await body.findByRole('dialog', { name: 'My Templates' });
    await userEvent.click(await within(modal).findByRole('button', { name: 'Template options: Renamed overview' }));
    await userEvent.click(await body.findByRole('menuitem', { name: 'Delete' }));
    await userEvent.click(body.getByRole('button', { name: 'Delete template' }));
    modal = await body.findByRole('dialog', { name: 'My Templates' });
    await waitFor(() => expect(within(modal).getByText('No templates yet')).toBeVisible());
    await userEvent.click(within(modal).getByRole('button', { name: 'Close' }));
  },
};
export const CsvPermissionDenied: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/reports/overview/export')
      ? new Response(null, { status: 403 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await body.findByText(/Overview CSV requires Export reports/);
    expect(body.getAllByRole('alert')).toHaveLength(1);
    await expect(body.getByRole('button', { name: 'Download CSV' })).toBeDisabled();
    await expect(body.getByRole('button', { name: 'Reload report access' })).toBeEnabled();
  },
};
export const CsvPartialAuthority: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
    await waitFor(() => expect(body.getByText('Leads: unavailable; Jobs: workspace; Estimates: unavailable; Calendar: unavailable')).toBeVisible());
    await expect(body.getByText(/Only export-authorized summary metrics/)).toBeVisible();
    await expect(body.getByRole('button', { name: 'Download CSV' })).toBeEnabled();
    await userEvent.click(body.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  },
};
export const BackendContracts: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const callout = canvas.getByRole('region', { name: 'Save this report as a template' });
    await expect(callout).toBeVisible();
    const report = canvas.getByRole('main');
    expect(report.compareDocumentPosition(callout) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const toolbar = canvas.getByRole('navigation', { name: 'Report actions' });
    expect(toolbar.compareDocumentPosition(report) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(toolbar).getAllByRole('button').map(button => button.textContent)).toEqual(['My Templates', 'Export Report Data']);
    expect(canvas.queryByRole('heading', { name: 'My templates' })).not.toBeInTheDocument();
    expect(callout.parentElement?.parentElement?.nextElementSibling).toBeNull();
    const heading = canvas.getByRole('heading', { name: 'Business overview' });
    expect(within(heading.parentElement!).queryByText(/^Separate native reads;/)).not.toBeInTheDocument();
    expect(canvas.queryByText(/^To edit a saved configuration,/)).not.toBeInTheDocument();
    expect(canvas.queryByText(/^Detail navigation is not integrated yet/)).not.toBeInTheDocument();
    expect(canvas.queryByText(/^Current counts are not restricted/)).not.toBeInTheDocument();
    expect(requests).toHaveLength(0);
    await expect(canvas.getAllByRole('group', { name: 'New Leads' })).toHaveLength(2);
    expect(canvas.queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument();
    const detailButtons = canvas.getAllByRole('button', { name: /^View details:/ });
    expect(detailButtons.length).toBeGreaterThan(0);
    for (const [index, button] of detailButtons.entries()) {
      await expect(button).toBeEnabled();
      await userEvent.click(button);
      expect(args.onNavigate).toHaveBeenLastCalledWith(overviewAttentionHref(overviewAttentionIds[index], args.initial.workspaceId, args.initial.report.today));
    }
    await applyEmptyPeriod(canvasElement);
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Apply period' })).toBeEnabled());
    expect(requests).toEqual([{ ...initialOverviewQuery, period: { from: '2026-08-01', to: '2026-08-30' } }]);
    for (const label of ['Jobs created', 'Jobs completed', 'Accepted estimates']) {
      await expect(canvas.getByRole('group', { name: label })).toHaveTextContent('0');
    }
    await expect(canvas.getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
  },
};
export const PartialAuthority: Story = {
  args: { initial: overviewReadResponse(initialOverviewQuery, { ...overviewBackendAuthority, lead: null, estimate: null }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
    expect(canvas.queryByRole('button', { name: 'View details: Inactive open Leads' })).not.toBeInTheDocument();
    await applyEmptyPeriod(canvasElement);
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Apply period' })).toBeEnabled());
    await expect(canvas.getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
    expect(canvas.queryByRole('button', { name: 'View details: Inactive open Leads' })).not.toBeInTheDocument();
  },
};
export const AssignedAuthority: Story = {
  args: { initial: overviewReadResponse(initialOverviewQuery, { reportScope: 'assigned',
    lead: { scope: 'assigned', archives: 'excluded' }, job: { scope: 'assigned' },
    estimate: { scope: 'assigned_job', archives: 'excluded' }, calendar: { kind: 'own', viewerId: 'field-viewer' } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Upcoming visits' })).toHaveTextContent('3');
    await applyEmptyPeriod(canvasElement);
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Apply period' })).toBeEnabled());
    await expect(canvas.getByRole('group', { name: 'Upcoming visits' })).toHaveTextContent('3');
    expect(canvas.queryByRole('button', { name: /^Actions:/ })).not.toBeInTheDocument();
  },
};
export const InvalidMoney: Story = {
  args: { initial: overviewReadResponse(initialOverviewQuery, overviewBackendAuthority, true) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Issued frozen values could not be verified.')).toBeVisible();
    await expect(canvas.getByRole('group', { name: 'Accepted estimates' })).toHaveTextContent('2');
  },
};
export const AccessRevoked: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => String(input).startsWith('/api/reports/overview?')
      ? Response.json({ error: 'This report is unavailable.' }, { status: 404 }) : original(input, init);
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await applyEmptyPeriod(canvasElement);
    await expect(await canvas.findByText('This report is unavailable.')).toBeVisible();
    expect(canvas.queryAllByRole('group')).toHaveLength(0);
    expect(canvas.queryByRole('region', { name: 'Reporting period' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reload report access' }));
    await expect(args.onReload).toHaveBeenCalled();
  },
};
export const ChangedPolicy: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/overview?')) return original(input, init);
      const query = businessOverviewQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      return Response.json({ ...overviewReadResponse(query), policyRevision: 2 });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await applyEmptyPeriod(canvasElement);
    await expect(await canvas.findByText('Overview results no longer match this request or current authority. Reload the report.')).toBeVisible();
    expect(canvas.queryAllByRole('group')).toHaveLength(0);
  },
};
export const ErrorRetry: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    let failed = false;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/overview?')) return original(input, init);
      if (!failed) { failed = true; return Response.json({ error: 'Business Overview could not be loaded. Try again.' }, { status: 500 }); }
      const query = businessOverviewQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      return Response.json(overviewReadResponse(query));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await applyEmptyPeriod(canvasElement);
    await expect(await canvas.findByText('Business Overview could not be loaded. Try again.')).toBeVisible();
    expect(canvas.queryAllByRole('group')).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Retry report' }));
    await waitFor(() => expect(canvas.getByRole('group', { name: 'Jobs created' })).toHaveTextContent('0'));
    await expect(canvas.getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('5');
  },
};
export const WorkspaceRace: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => {
      const replacement = overviewReadResponse({ ...initialOverviewQuery, workspaceId: '00000000-0000-4000-8000-000000000002' });
      if (replacement.report.jobs.kind !== 'available') throw new Error('Expected replacement Job authority.');
      setInitial(businessOverviewReadResultSchema.parse({ ...replacement,
        report: { ...replacement.report, jobs: { ...replacement.report.jobs, active: 11 } } }));
    }}>Switch authorized workspace</button><BusinessOverviewReadPage {...args} initial={initial} /></>;
  },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/overview?')) return original(input, init);
      const query = businessOverviewQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
      init?.signal?.addEventListener('abort', () => { aborted = true; }, { once: true });
      // Ignore abort to verify isolation even after the old transport finishes.
      await new Promise<void>(resolve => { release = resolve; });
      settled = true;
      return Response.json(overviewReadResponse(query));
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await applyEmptyPeriod(canvasElement);
    await waitFor(() => expect(release).toBeDefined());
    expect(canvas.queryAllByRole('group')).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Switch authorized workspace' }));
    await expect(canvas.getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('11');
    expect(aborted).toBe(true);
    release?.();
    await waitFor(() => expect(settled).toBe(true));
    await waitFor(() => expect(canvas.getByRole('group', { name: 'Active Jobs' })).toHaveTextContent('11'));
    await expect(canvas.getByLabelText('Start date', { exact: false })).toHaveValue('2026-10-01');
  },
};
