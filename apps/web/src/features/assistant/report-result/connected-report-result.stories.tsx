import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { reportAssistantResultResponseSchema, reportAssistantTicketSchema,
  type ReportTemplateArea } from '@salesmora/contracts';
import { ConnectedReportResult } from './connected-report-result';
import { reportAssistantExamples } from './report-result.fixtures';
import { reportSelectionExamples } from '../../../../../../packages/contracts/src/reports/assistant-query.fixtures';
import { reportHref } from '../../reports/report-navigation';
import { reportResultData as copy } from './report-result.data';

const id = '00000000-0000-4000-8000-000000000022';
const turnId = '00000000-0000-4000-8000-000000000023';
const retrievedAt = '2026-11-09T15:00:00.000Z';
const areas = ['overview', 'leads', 'sources', 'calendar', 'jobs', 'team', 'estimates', 'activity', 'financial'] as const;
const areaId = (index: number) => `00000000-0000-4000-8000-${String(index + 100).padStart(12, '0')}`;
type Mode = 'ready' | 'revoked' | 'stale' | 'error' | 'mismatch' | 'unsafe' | 'wrong-query';
function response(area: ReportTemplateArea = 'leads') {
  const selection = reportSelectionExamples.find(item => item.area === area &&
    (area !== 'jobs' || item.query.view === 'workload') && (area !== 'team' || item.query.view === 'team-jobs'));
  if (!selection) throw new Error('Missing story selection.');
  return reportAssistantResultResponseSchema.parse({ retrievedAt,
    snapshot: { selection, result: { ...reportAssistantExamples[area].result, id,
      period: 'period' in selection.query ? selection.query.period : null } } });
}
const result = response();
const ticket = reportAssistantTicketSchema.parse({ id, area: 'leads', retrievedAt });
function mock(mode: Mode = 'ready', payload = result) {
  const original = globalThis.fetch;
  let reads = 0;
  globalThis.fetch = fn(async (input, init) => {
    const url = String(input);
    if (!url.startsWith('/api/chat/reports')) throw new Error('Unexpected mocked report request.');
    if (init?.method === 'POST') {
      expect(JSON.parse(String(init.body))).toEqual({ workspaceId: payload.snapshot.selection.query.workspaceId, turnId, resultId: id });
      return Response.json({ href: mode === 'unsafe' ? 'https://example.test/forged' : mode === 'wrong-query'
        ? `/reports/${payload.snapshot.selection.area}?workspace=${payload.snapshot.selection.query.workspaceId}` : reportHref(payload.snapshot.selection) });
    }
    reads++;
    if (mode === 'revoked' && reads > 1) return Response.json({ error: 'access_denied' }, { status: 403 });
    if (mode === 'stale') return Response.json({ error: 'stale' }, { status: 409 });
    if (mode === 'error') return Response.json({ error: 'unavailable' }, { status: 500 });
    return Response.json(mode === 'mismatch' ? { ...payload, retrievedAt: '2026-11-09T15:00:01.000Z' } : payload);
  });
  return () => { globalThis.fetch = original; };
}
const meta = {
  title: 'Assistant/ConnectedReportResult', component: ConnectedReportResult,
  args: { ticket, workspaceId: result.snapshot.selection.query.workspaceId, turnId, disabled: false,
    onNavigate: fn(), onInvalidated: fn() },
  parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
    <h1 className="text-xl font-semibold">Connected report result</h1>
    <p>Canonical report card with fictional protected API responses. No model or live workspace reads.</p>
    <Story />
  </main>],
  beforeEach: () => mock(),
} satisfies Meta<typeof ConnectedReportResult>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const open = await within(canvasElement).findByRole('button', { name: copy.open });
  open.focus(); await userEvent.keyboard('{Enter}');
  expect(args.onNavigate).toHaveBeenCalledWith(reportHref(result.snapshot.selection));
} };
export const RevokedAfterRestore: Story = { beforeEach: () => mock('revoked'), play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await c.findByRole('button', { name: copy.open });
  window.dispatchEvent(new Event('focus'));
  expect(await c.findByText(copy.states.unavailable)).toBeVisible();
  expect(c.queryByText('12')).not.toBeInTheDocument();
  expect(c.queryByRole('button', { name: copy.open })).not.toBeInTheDocument();
  expect(args.onInvalidated).toHaveBeenCalled();
} };
export const Stale: Story = { beforeEach: () => mock('stale'), play: async ({ canvasElement }) => {
  expect(await within(canvasElement).findByText(copy.states.stale)).toBeVisible();
} };
export const FailedRead: Story = { beforeEach: () => mock('error'), play: async ({ canvasElement }) => {
  expect(await within(canvasElement).findByText(copy.states.error)).toBeVisible();
} };
export const MismatchedTicket: Story = { beforeEach: () => mock('mismatch'), play: FailedRead.play };
const rejectNavigation: Story['play'] = async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(await c.findByRole('button', { name: copy.open }));
  expect(await c.findByText(copy.states.error)).toBeVisible();
  expect(args.onNavigate).not.toHaveBeenCalled();
};
export const UnsafeNavigation: Story = { beforeEach: () => mock('unsafe'), play: rejectNavigation };
export const ChangedQueryNavigation: Story = { beforeEach: () => mock('wrong-query'), play: rejectNavigation };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  expect(await within(canvasElement).findByRole('button', { name: copy.open })).toBeDisabled();
} };
export const MissingCosts: Story = {
  args: { ticket: { ...ticket, area: 'financial' } },
  beforeEach: () => {
    const financial = response('financial');
    financial.snapshot.result.sections = [{ id: 'materials', label: 'Current recorded material costs',
      scopeLabel: 'Authorized Work Orders', basisLabel: 'Current issued/in-progress Work Orders',
      asOf: retrievedAt, metrics: [{ id: 'cost', label: 'Known recorded material costs',
        value: { kind: 'incomplete', displayValue: '$140.00', coverageLabel: '2 of 3 lines have known costs; missing is not zero.' } }] }];
    return mock('ready', financial);
  },
  play: async ({ canvasElement }) => {
    expect(await within(canvasElement).findByText('2 of 3 lines have known costs; missing is not zero.')).toBeVisible();
  },
};
export const Empty: Story = { beforeEach: () => {
  const empty = response();
  empty.snapshot.result.sections[0]!.metrics[0]!.value = { kind: 'count', value: 0 };
  return mock('ready', empty);
}, play: async ({ canvasElement }) => { expect(await within(canvasElement).findByText('0')).toBeVisible(); } };
export const Loading: Story = { beforeEach: () => {
  const original = globalThis.fetch;
  globalThis.fetch = (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  });
  return () => { globalThis.fetch = original; };
}, play: async ({ canvasElement }) => {
  expect(await within(canvasElement).findByText(copy.states.loading)).toBeVisible();
} };
export const Phone: Story = { ...Default, globals: { viewport: { value: 'mobile1' } } };
export const AllNineAreas: Story = {
  render: args => <>{areas.map((area, index) => <ConnectedReportResult key={area} {...args}
    ticket={{ ...ticket, id: areaId(index), area }} />)}</>,
  beforeEach: () => {
    const original = globalThis.fetch;
    globalThis.fetch = async input => {
      const requestId = new URL(String(input), 'http://localhost').searchParams.get('resultId');
      const index = areas.findIndex((_area, index) => areaId(index) === requestId);
      const area = areas[index];
      if (!area) throw new Error('Unexpected report ID.');
      const payload = response(area);
      payload.snapshot.result.id = areaId(index);
      return Response.json(payload);
    };
    return () => { globalThis.fetch = original; };
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getAllByRole('button', { name: copy.open })).toHaveLength(9));
  },
};
