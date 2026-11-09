import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { financialReportQuerySchema, financialReportReadResultSchema, financialReportExportInputSchema,
  financialReportExportColumns, reportTemplateCreateSchema, reportTemplateUpdateSchema,
  type FinancialReportQuery, type ReportTemplate } from '@salesmora/contracts';
import { FinancialReportPage } from './financial-report-page';
import { financialReadResponse, initialFinancialQuery, largeFinancialReadResponse } from './financial-read.fixtures';
import { financialReportAccess } from './financial-report.adapter';
import { fullFinancialAccess } from './financial-report.fixtures';
import { financialReportData as copy } from './financial-report.data';
import { selectMetricEvidence } from '../report-summary/report-summary.story-helpers';
import { resolveReportPeriod } from '../report-date-controls/report-date-controls.validation';
import { WorkspaceAssistantProvider, useWorkspaceAssistant } from '../../assistant/workspace-assistant/workspace-assistant';

let requests: FinancialReportQuery[] = [], release: (() => void) | undefined, aborted = false, settled = false;
let templates: ReportTemplate[] = [];
function parseQuery(input: RequestInfo | URL) {
  return financialReportQuerySchema.parse(JSON.parse(new URL(String(input), 'https://story.example.test').searchParams.get('query')!));
}
const meta = {
  title: 'Reports/FinancialReportPage', component: FinancialReportPage, tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'API-mocked canonical Financial host, including personal configuration templates and independently authorized CSV. No revenue/profit, production activation or assistant integration.' } } },
  args: { initial: financialReadResponse(), onRecord: fn(), onReload: fn() },
  beforeEach: ({ args }) => {
    const original = globalThis.fetch; requests = []; templates = []; release = undefined; aborted = false; settled = false;
    globalThis.fetch = async (input, init) => {
      if (String(input).startsWith('/api/reports/templates')) {
        const url = new URL(String(input), 'https://story.example.test');
        const method = init?.method ?? 'GET';
        const id = url.pathname.split('/')[4];
        if (method === 'GET') return Response.json(templates);
        if (method === 'POST' && !id) {
          const value = reportTemplateCreateSchema.parse(JSON.parse(String(init?.body)));
          const template: ReportTemplate = { id: '00000000-0000-4000-8000-000000000099',
            workspaceId: value.workspaceId, area: value.configuration.area, name: value.name,
            configuration: value.configuration, version: 1,
            createdAt: '2026-11-06T12:00:00.000Z', updatedAt: '2026-11-06T12:00:00.000Z' };
          templates = [...templates, template];
          return Response.json(template, { status: 201 });
        }
        const template = templates.find(item => item.id === id);
        if (!template) return Response.json({ error: 'Template unavailable.' }, { status: 404 });
        if (method === 'POST' && url.pathname.endsWith('/run')) {
          const period = template.configuration.period;
          if (!period) throw new Error('Expected a Financial story period.');
          const range = resolveReportPeriod(period, args.initial.today, 'history').range;
          if (!range) throw new Error('Invalid Financial story period.');
          const query = financialReportQuerySchema.parse({ ...template.configuration.query,
            workspaceId: template.workspaceId, period: { from: range.from, to: range.to }, page: 1, pageSize: 25 });
          return Response.json({ template, result: financialReadResponse(query, financialReportAccess(args.initial)) });
        }
        if (method === 'PATCH') {
          const value = reportTemplateUpdateSchema.parse(JSON.parse(String(init?.body)));
          if (value.version !== template.version) return Response.json({ error: 'Template changed.' }, { status: 409 });
          const updated = { ...template, ...('name' in value ? { name: value.name! } : {}),
            ...('configuration' in value ? { configuration: value.configuration! } : {}), version: template.version + 1 };
          templates = templates.map(item => item.id === id ? updated : item);
          return Response.json(updated);
        }
        if (method === 'DELETE') {
          templates = templates.filter(item => item.id !== id);
          return new Response(null, { status: 204 });
        }
        throw new Error('Unexpected template story request.');
      }
      if (String(input).startsWith('/api/reports/financial/export')) {
        const request = financialReportExportInputSchema.parse(JSON.parse(String(init?.body)));
        const access = request.query.selected === 'materials' ? args.initial.exportAccess.materials : args.initial.exportAccess.estimates;
        if (!access) return new Response(null, { status: 404 });
        const columns = financialReportExportColumns(request), count = request.dataset === 'summary' ? 1 : 2;
        const metadata = { workspaceId: args.initial.workspaceId, policyRevision: args.initial.policyRevision,
          asOf: args.initial.reports.materials.asOf, today: args.initial.today, timezone: args.initial.timezone,
          section: request.query.selected, scope: typeof access === 'string' ? access : access.scope,
          jobScope: typeof access === 'string' ? null : access.jobScope,
          archiveVisibility: request.query.selected === 'accepted' ? args.initial.authority.estimates?.archives : 'excluded',
          count, limits: { rows: 50000, bytes: 33554432, durationMs: 30000 } };
        if (String(input).endsWith('/preview')) return Response.json({ ...metadata, input: request,
          viewerId: args.initial.viewerId, columns, coverage: 'Authorized fictional Financial section.' });
        const generation = { ...metadata, id: '00000000-0000-4000-8000-000000000099' };
        const body = '\uFEFF' + columns.map(column => `"${column}"`).join(',') + '\r\n' +
          Array.from({ length: count }, () => columns.map(() => '"fixture"').join(',') + '\r\n').join('');
        return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8',
          'x-report-export': btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(generation))))
            .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''),
        } });
      }
      if (!String(input).startsWith('/api/reports/financial?')) return original(input, init);
      const query = parseQuery(input); requests.push(query);
      return Response.json({ ...financialReadResponse(query, financialReportAccess(args.initial)), exportAccess: args.initial.exportAccess });
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
} satisfies Meta<typeof FinancialReportPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PersonalTemplateLifecycle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'My Templates' }));
    await userEvent.click(await body.findByRole('button', { name: 'Create Report Template' }));
    fireEvent.change(body.getByRole('textbox', { name: 'Template name' }), { target: { value: 'Monthly review' } });
    await userEvent.click(body.getByRole('button', { name: 'Save personal template' }));
    await userEvent.click(await body.findByRole('button', { name: 'Run report: Monthly review' }));
    await canvas.findByRole('button', { name: 'Update this template' });
    await userEvent.click(canvas.getByRole('button', { name: 'About saving report templates' }));
    await waitFor(() => expect(body.getByText('Currently based on: Monthly review.')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: 'Update this template' }));
    await userEvent.click(body.getByRole('button', { name: 'Update configuration' }));
    await waitFor(() => expect(templates[0]?.version).toBe(2));
    await userEvent.click(canvas.getByRole('button', { name: 'My Templates' }));
    await userEvent.click(await body.findByRole('button', { name: 'Template options: Monthly review' }));
    await userEvent.click(body.getByRole('menuitem', { name: 'Rename' }));
    const name = body.getByRole('textbox', { name: 'Template name' });
    fireEvent.change(name, { target: { value: 'Renamed review' } });
    await userEvent.click(body.getByRole('button', { name: 'Save name' }));
    await userEvent.click(await body.findByRole('button', { name: 'Template options: Renamed review' }));
    await userEvent.click(body.getByRole('menuitem', { name: 'Delete' }));
    await userEvent.click(body.getByRole('button', { name: 'Delete template' }));
    await waitFor(() => expect(body.getByText('No templates yet')).toBeVisible());
  },
};
export const RollingPersonalTemplate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Date range' }), 'last30days');
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
    await ready(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'My Templates' }));
    await userEvent.click(await body.findByRole('button', { name: 'Create Report Template' }));
    fireEvent.change(body.getByRole('textbox', { name: 'Template name' }), { target: { value: 'Rolling review' } });
    await userEvent.click(body.getByRole('button', { name: 'Save personal template' }));
    await userEvent.click(await body.findByRole('button', { name: 'Run report: Rolling review' }));
    await canvas.findByRole('button', { name: 'Update this template' });
    await userEvent.click(canvas.getByRole('button', { name: 'About saving report templates' }));
    await waitFor(() => expect(body.getByText('Currently based on: Rolling review.')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('combobox', { name: 'Date range' })).toHaveValue('last30days');
    expect(templates[0]?.configuration.period).toEqual({ preset: 'last30days' });
  },
};
export const CsvSections: Story = {
  args: { initial: { ...financialReadResponse(), exportAccess: {
    estimates: 'workspace', materials: { scope: 'workspace', jobScope: null },
  } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
    for (const section of ['accepted', 'awaiting', 'materials'] as const) {
      if (section === 'awaiting') await select(canvasElement, copy.awaiting);
      if (section === 'materials') await select(canvasElement, copy.knownCosts);
      await userEvent.click(canvas.getByRole('button', { name: 'Export Report Data' }));
      for (const dataset of ['summary', 'evidence']) {
        await userEvent.selectOptions(body.getByRole('combobox', { name: 'CSV dataset' }), dataset);
        await waitFor(() => expect(body.getByText(`salesmora-financial-${dataset}-2026-11-06.csv`)).toBeInTheDocument());
        await waitFor(() => expect(body.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
      }
      await userEvent.click(body.getByRole('button', { name: 'Download CSV' }));
      await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
    }
  },
};
async function ready(element: HTMLElement) {
  await waitFor(() => expect(within(element).getByRole('button', { name: 'Apply period' })).toBeEnabled());
}
const metric = (element: HTMLElement, name: string) => within(element).getByRole('group', { name });
async function select(element: HTMLElement, label: string) {
  await selectMetricEvidence(element, label); await ready(element);
}
export const NativeSectionsAndDates: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('heading', { name: copy.title }).closest('header')!;
    expect(header).not.toHaveTextContent('Separate section snapshots');
    expect(requests).toHaveLength(0);
    await expect(metric(canvasElement, copy.acceptedCount)).toHaveTextContent('3');
    await expect(metric(canvasElement, copy.awaitingCount)).toHaveTextContent('2');
    await userEvent.click(canvas.getAllByRole('button', { name: /^View record:/ })[0]!);
    const accepted = args.initial.reports.accepted.estimates;
    if (accepted.kind !== 'accepted') throw new Error('Expected accepted fixture.');
    expect(args.onRecord).toHaveBeenLastCalledWith({ kind: 'estimate', recordId: accepted.report.rows[0].recordId });
    await select(canvasElement, copy.awaiting);
    expect(requests.at(-1)).toMatchObject({ selected: 'awaiting', page: 1 });
    await expect(canvas.getByRole('heading', { name: 'Awaiting-decision estimate evidence' })).toBeVisible();
    await select(canvasElement, copy.knownCosts);
    expect(requests.at(-1)).toMatchObject({ selected: 'materials', page: 1 });
    await userEvent.click(canvas.getAllByRole('button', { name: /^View record:/ })[0]!);
    const material = financialReadResponse({ ...initialFinancialQuery, selected: 'materials' });
    expect(args.onRecord).toHaveBeenLastCalledWith({ kind: 'work-order', recordId: material.reports.materials.rows[0].workOrderId });
    const currentCosts = metric(canvasElement, copy.knownCosts).textContent;
    expect(currentCosts).toContain('$');
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
    fireEvent.change(canvas.getByLabelText('End date', { exact: false }), { target: { value: '2026-08-31' } });
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' })); await ready(canvasElement);
    expect(requests.at(-1)).toMatchObject({ period: { from: '2026-08-01', to: '2026-08-31' }, selected: 'accepted', page: 1 });
    await expect(metric(canvasElement, copy.acceptedCount)).toHaveTextContent('0');
    await expect(metric(canvasElement, copy.awaitingCount)).toHaveTextContent('2');
    expect(metric(canvasElement, copy.knownCosts).textContent).toBe(currentCosts);
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('combobox', { name: 'Current owner' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Export Report Data' })).toBeDisabled();
  },
};
function PublishedReportContext() {
  const assistant = useWorkspaceAssistant();
  return <pre aria-label="Published report context" className="m-4 whitespace-pre-wrap text-xs wrap-anywhere">
    {assistant?.pageContext?.reportContext ? JSON.stringify(assistant.pageContext.reportContext) : 'No report context'}
  </pre>;
}
function ReportContextReview(args: ComponentProps<typeof FinancialReportPage>) {
  const [visible, setVisible] = useState(true);
  const [workspaceId, setWorkspaceId] = useState(args.initial.workspaceId);
  const initial = workspaceId === args.initial.workspaceId ? args.initial
    : financialReadResponse({ ...args.initial.query, workspaceId });
  return <WorkspaceAssistantProvider key={workspaceId} enabled={false}>
    <button type="button" className="m-4 min-h-11" onClick={() => setVisible(value => !value)}>Toggle report page</button>
    <button type="button" className="m-4 min-h-11" onClick={() => setWorkspaceId('00000000-0000-4000-8000-000000000002')}>Switch review workspace</button>
    <PublishedReportContext />
    {visible && <FinancialReportPage {...args} initial={initial} />}
  </WorkspaceAssistantProvider>;
}
export const AppliedAssistantContext: Story = {
  render: args => <ReportContextReview {...args} />,
  beforeEach: () => {
    const original = globalThis.fetch;
    let attempt = 0;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/financial?')) return original(input, init);
      attempt++;
      if (attempt > 1) return Response.json({ error: 'This report is unavailable.' }, { status: 404 });
      await new Promise<void>(resolve => { release = resolve; });
      return Response.json(financialReadResponse(parseQuery(input)));
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const context = () => canvas.getByLabelText('Published report context');
    await waitFor(() => expect(context()).toHaveTextContent('"area":"financial"'));
    expect(JSON.parse(context().textContent!).selection.query).toEqual(args.initial.query);
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle report page' }));
    await waitFor(() => expect(context()).toHaveTextContent('No report context'));
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle report page' }));
    await waitFor(() => expect(context()).toHaveTextContent('"area":"financial"'));
    fireEvent.change(canvas.getByLabelText('Start date', { exact: false }), { target: { value: '2026-08-01' } });
    expect(JSON.parse(context().textContent!).selection.query).toEqual(args.initial.query);
    await userEvent.click(canvas.getByRole('button', { name: 'Apply period' }));
    await waitFor(() => expect(context()).toHaveTextContent('No report context'));
    await waitFor(() => expect(release).toBeDefined());
    release!();
    await waitFor(() => expect(context()).toHaveTextContent('"from":"2026-08-01"'));
    await selectMetricEvidence(canvasElement, copy.awaiting);
    await canvas.findByText('This report is unavailable.');
    await waitFor(() => expect(context()).toHaveTextContent('No report context'));
    await userEvent.click(canvas.getByRole('button', { name: 'Switch review workspace' }));
    await waitFor(() => expect(context()).toHaveTextContent('"workspaceId":"00000000-0000-4000-8000-000000000002"'));
    expect(context()).not.toHaveTextContent(args.initial.workspaceId);
  },
};
export const EstimatesUnavailable: Story = {
  args: { initial: financialReadResponse(initialFinancialQuery, { ...fullFinancialAccess,
    canReadEstimates: false, canReadEstimateValues: false }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(metric(canvasElement, copy.periodEstimates)).toHaveTextContent('Unavailable');
    expect(canvas.queryByRole('group', { name: copy.acceptedCount })).not.toBeInTheDocument();
    await select(canvasElement, copy.knownCosts);
    await expect(canvas.getByRole('heading', { name: 'Current material-cost evidence' })).toBeVisible();
    expect(canvas.getAllByRole('button', { name: /^View record:/ }).length).toBeGreaterThan(0);
  },
};
export const CostsUnavailable: Story = {
  args: { initial: financialReadResponse(initialFinancialQuery, { ...fullFinancialAccess, canReadWorkOrderCosts: false }) },
  play: async ({ canvasElement }) => {
    await expect(metric(canvasElement, copy.materialCosts)).toHaveTextContent('Unavailable');
    await expect(metric(canvasElement, copy.acceptedCount)).toHaveTextContent('3');
    await select(canvasElement, copy.awaiting);
    expect(within(canvasElement).getAllByRole('button', { name: /^View record:/ })).toHaveLength(2);
  },
};
export const FrozenValueUnavailable: Story = {
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/financial?')) return original(input, init);
      const result = financialReadResponse(parseQuery(input)), accepted = result.reports.accepted.estimates;
      if (accepted.kind !== 'accepted') throw new Error('Expected Estimate authority.');
      const unavailable = { kind: 'unavailable' as const, explanation: 'The issued frozen amount could not be verified.' };
      accepted.report.money = unavailable;
      accepted.report.rows = accepted.report.rows.map(row => ({ ...row, money: unavailable }));
      return Response.json(result);
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    await select(canvasElement, copy.awaiting);
    await expect(metric(canvasElement, copy.accepted)).toHaveTextContent('Unavailable');
    await expect(metric(canvasElement, copy.acceptedCount)).toHaveTextContent('3');
    await expect(metric(canvasElement, copy.awaitingCount)).toHaveTextContent('2');
    await select(canvasElement, copy.accepted);
    expect(within(canvasElement).getAllByRole('button', { name: /^View record:/ })).toHaveLength(3);
  },
};
export const AuthorityRetryAndRevocation: Story = {
  beforeEach: () => {
    const original = globalThis.fetch; let attempt = 0;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/financial?')) return original(input, init);
      const result = financialReadResponse(parseQuery(input)); attempt++;
      if (attempt === 1) return Response.json({ ...result, policyRevision: 2 });
      if (attempt === 2) return Response.json({ error: 'Financial report could not be loaded. Try again.' }, { status: 500 });
      if (attempt === 3) return Response.json(result);
      return Response.json({ error: 'This report is unavailable.' }, { status: 404 });
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await selectMetricEvidence(canvasElement, copy.awaiting);
    await expect((await canvas.findAllByText('Financial report request or authority has changed. Reload the report.'))[0]!).toBeVisible();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('group', { name: copy.accepted })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry report' }));
    await expect((await canvas.findAllByText('Financial report could not be loaded. Try again.'))[0]!).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry report' })); await ready(canvasElement);
    await expect(metric(canvasElement, copy.awaitingCount)).toHaveTextContent('2');
    await selectMetricEvidence(canvasElement, copy.accepted);
    await expect(await canvas.findByText('This report is unavailable.')).toBeVisible();
    expect(canvas.queryByRole('button', { name: 'Apply period' })).not.toBeInTheDocument();
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Reload report access' }));
    expect(args.onReload).toHaveBeenCalledOnce();
  },
};
export const Pagination: Story = {
  args: { initial: largeFinancialReadResponse() },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/financial?')) return original(input, init);
      const query = parseQuery(input); requests.push(query); return Response.json(largeFinancialReadResponse(query));
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(requests).toHaveLength(0);
    await expect(metric(canvasElement, copy.acceptedCount)).toHaveTextContent('78');
    const first = canvas.getAllByRole('button', { name: /^View record:/ })[0]!.getAttribute('aria-label');
    await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' })); await ready(canvasElement);
    expect(requests.at(-1)?.page).toBe(2);
    expect(canvas.getAllByRole('button', { name: /^View record:/ })[0]!.getAttribute('aria-label')).not.toBe(first);
    await userEvent.click(canvas.getByRole('button', { name: 'Go to previous page' })); await ready(canvasElement);
    expect(requests.at(-1)?.page).toBe(1);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: /Rows per page/ }), '100'); await ready(canvasElement);
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(78);
    await select(canvasElement, copy.knownCosts);
    expect(requests.at(-1)).toMatchObject({ selected: 'materials', page: 1, pageSize: 100 });
    const total = largeFinancialReadResponse({ ...initialFinancialQuery, selected: 'materials' }).reports.materials.evidenceTotal;
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(Math.min(total, 100));
    if (total > 100) {
      await userEvent.click(canvas.getByRole('button', { name: 'Go to next page' })); await ready(canvasElement);
      expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(total - 100);
    }
    await select(canvasElement, copy.awaiting);
    expect(requests.at(-1)).toMatchObject({ selected: 'awaiting', page: 1 });
    expect(canvas.getAllByRole('button', { name: /^View record:/ })).toHaveLength(52);
  },
};
export const WorkspaceRace: Story = {
  render: function Host(args) {
    const [initial, setInitial] = useState(args.initial);
    return <><button type="button" onClick={() => {
      const replacement = financialReadResponse(financialReportQuerySchema.parse({
        ...initialFinancialQuery, workspaceId: '00000000-0000-4000-8000-000000000002' }));
      const accepted = replacement.reports.accepted.estimates;
      if (accepted.kind !== 'accepted') throw new Error('Expected accepted replacement.');
      accepted.report.rows = accepted.report.rows.map(row => ({ ...row, label: `Replacement ${row.label}` }));
      setInitial(financialReportReadResultSchema.parse(replacement));
    }}>Switch authorized workspace</button><FinancialReportPage {...args} initial={initial} /></>;
  },
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith('/api/reports/financial?')) return original(input, init);
      const query = parseQuery(input); init?.signal?.addEventListener('abort', () => { aborted = true; }, { once: true });
      await new Promise<void>(resolve => { release = resolve; });
      const response = Response.json(financialReadResponse(query)), json = response.json.bind(response);
      response.json = async () => { const raw: unknown = await json(); settled = true; return raw; }; return response;
    };
    return () => { globalThis.fetch = original; release?.(); };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectMetricEvidence(canvasElement, copy.awaiting); await waitFor(() => expect(release).toBeDefined());
    expect(canvas.queryAllByRole('button', { name: /^View record:/ })).toHaveLength(0);
    expect(canvas.queryByRole('group', { name: copy.accepted })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Switch authorized workspace' }));
    await ready(canvasElement); expect(aborted).toBe(true); release?.();
    await waitFor(() => expect(settled).toBe(true));
    await expect(canvas.getByRole('heading', { name: 'Accepted estimate evidence' })).toBeVisible();
    expect(canvas.getAllByRole('button', { name: /^View record: Replacement/ })).toHaveLength(3);
    expect(canvas.queryAllByRole('button', { name: /^View record: Estimate/ })).toHaveLength(0);
  },
};
