import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { AuditPage } from '@salesmora/contracts';
import { AdminFrame } from '../admin-frame/admin-frame';
import { AdminAuditViewerPage } from '../admin-audit-viewer/admin-audit-viewer-page';
import { adminAuditViewerData as viewerCopy, auditPreviewEvents } from '../admin-audit-viewer/admin-audit-viewer.data';
import { adminAuditExportReviewData as copy } from './admin-audit-export-review.data';
import { adminAuditExportData as liveCopy } from './admin-audit-export-copy.data';

const initial: AuditPage = {
  events: auditPreviewEvents.slice(0, 5), total: 10, page: 0, pageSize: 5, asOf: viewerCopy.stories.now,
  throughSequence: '12', actors: [{ id: 'staff-jordan', name: 'Jordan Lee' }],
};
type Mode = 'normal' | 'methods-denied' | 'methods-error' | 'no-factors' | 'password-error' | 'factor-error'
  | 'commit-error' | 'lost-download' | 'invalid-csv' | 'invalid-hash' | 'passkey-cancelled' | 'methods-race' | 'denied-download-race';
let calls: Record<string, unknown>[] = [];
let downloads: { filename: string; href: string }[] = [];
let denyVerification: () => void;
let finishDownload: () => void;
function mock(mode: Mode = 'normal') {
  const originalFetch = window.fetch;
  const originalClick = HTMLAnchorElement.prototype.click;
  const originalGet = navigator.credentials.get;
  const originalHash = window.location.hash;
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  calls = []; downloads = [];
  HTMLAnchorElement.prototype.click = function () {
    if (this.download) downloads.push({ filename: this.download, href: this.href });
    else originalClick.call(this);
  };
  navigator.credentials.get = async () => { throw new DOMException('Passkey cancelled in preview.', 'NotAllowedError'); };
  const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
  window.fetch = async (input, options) => {
    const url = new URL(String(input), window.location.origin);
    if (url.pathname === '/api/admin/audit') {
      if (mode === 'denied-download-race' && options?.method === 'POST') {
        await new Promise<void>(resolve => { denyVerification = resolve; });
        return response({ error: copy.denied }, 403);
      }
      return response(initial);
    }
    if (url.pathname !== '/api/admin/audit/export') throw new Error('Unexpected export Storybook request');
    const body = options?.body ? JSON.parse(String(options.body)) : { operation: 'methods' };
    calls.push(body);
    if (body.operation === 'methods') {
      if (mode === 'methods-race') await new Promise(resolve => setTimeout(resolve, 1000));
      if (mode === 'methods-denied') return response({ error: copy.denied }, 403);
      if (mode === 'methods-error') return response({ error: liveCopy.failed }, 503);
      return response({ methods: mode === 'no-factors' ? [] : mode === 'passkey-cancelled' ? ['passkey', 'totp'] : ['totp'] });
    }
    if (body.operation === 'start') {
      if (mode === 'password-error') return response({ error: copy.stories.passwordFailed }, 401);
      return response({ token: 't'.repeat(43), options: { challenge: 'dGVzdA', rpId: 'localhost',
        userVerification: 'required', allowCredentials: [{ id: 'dGVzdA', type: 'public-key' }] } });
    }
    if (body.operation === 'factor') {
      if (mode === 'factor-error') return response({ error: copy.stories.factorFailed }, 401);
      return response({ verified: true });
    }
    if (mode === 'commit-error') return response({ error: copy.stories.exportFailed }, 409);
    if (mode === 'lost-download') throw new TypeError('Simulated lost download response');
    if (mode === 'invalid-csv') return response({ success: true });
    if (mode === 'denied-download-race') await new Promise<void>(resolve => { finishDownload = resolve; });
    const csv = '"event_id","action"\r\n"fictional-event","staff.audit_export"\r\n';
    const sha = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(csv))),
      byte => byte.toString(16).padStart(2, '0')).join('');
    return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'x-export-count': '10',
      'x-audit-event-id': '00000000-0000-4000-8000-000000000001', 'x-export-sha256': mode === 'invalid-hash' ? '0'.repeat(64) : sha } });
  };
  return () => {
    window.fetch = originalFetch; HTMLAnchorElement.prototype.click = originalClick; navigator.credentials.get = originalGet;
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${originalHash}`);
  };
}
const meta = {
  title: 'Admin/Audit/AdminAuditExport',
  component: AdminAuditViewerPage,
  args: { initialPage: initial },
  decorators: [Story => <AdminFrame environment="local" contentWidth="wide"><Story /></AdminFrame>],
  beforeEach: () => mock(),
} satisfies Meta<typeof AdminAuditViewerPage>;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = ReturnType<typeof within>;
async function open(canvas: Canvas) {
  await userEvent.click(canvas.getByRole('button', { name: viewerCopy.export }));
  await waitFor(() => expect(canvas.getByRole('alertdialog')).toBeVisible());
}
async function password(canvas: Canvas) {
  await open(canvas);
  await userEvent.type(canvas.getByRole('textbox', { name: copy.labels.reason }), copy.stories.reason);
  await userEvent.click(canvas.getByRole('button', { name: copy.buttons.review }));
  await userEvent.type(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' }), copy.stories.password);
  await userEvent.click(canvas.getByRole('button', { name: copy.buttons.password }));
}
async function verified(canvas: Canvas) {
  await password(canvas);
  await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.factor })).toBeVisible());
  await userEvent.type(canvas.getByRole('textbox', { name: copy.labels.code }), copy.stories.code);
  await userEvent.click(canvas.getByRole('button', { name: copy.liveButtons.totp }));
  await waitFor(() => expect(canvas.getByRole('heading', { name: copy.stages.confirm })).toBeVisible());
}
export const ExportScope: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await open(canvas);
    await expect(canvas.getByText(copy.liveNotice)).toBeVisible();
    await expect(canvas.getByText('10', { exact: true })).toBeVisible();
    await expect(calls).toEqual([{ operation: 'methods' }]);
  },
};
export const PasswordAndTotp: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verified(canvas);
    await expect(calls[1]).toEqual({ operation: 'start', password: copy.stories.password, input: {
      snapshot: { filters: { query: '', actor: '', category: 'all', range: 'week' }, count: 10,
        asOf: initial.asOf, throughSequence: '12' }, reason: copy.stories.reason,
    } });
    await expect(calls[2]).toEqual({ operation: 'factor', token: 't'.repeat(43), method: 'totp', code: copy.stories.code });
    await expect(downloads).toHaveLength(0);
  },
};
export const CsvPrepared: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verified(canvas);
    await userEvent.click(within(canvas.getByRole('alertdialog')).getByRole('button', { name: copy.liveButtons.confirm }));
    await waitFor(() => expect(canvas.getByText(liveCopy.prepared)).toBeVisible());
    await expect(downloads).toHaveLength(1);
    await expect(downloads[0].filename).toBe('salesmora-admin-audit-2026-10-30.csv');
    await expect(downloads[0].href.startsWith('blob:')).toBe(true);
    await expect(calls.at(-1)).toEqual({ operation: 'commit', token: 't'.repeat(43) });
  },
};
export const MethodsDenied: Story = {
  beforeEach: () => mock('methods-denied'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: viewerCopy.export }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: viewerCopy.deniedTitle })).toBeVisible());
    await expect(canvas.queryByRole('table')).not.toBeInTheDocument();
    await expect(downloads).toHaveLength(0);
  },
};
export const MethodsUnavailable: Story = {
  beforeEach: () => mock('methods-error'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: viewerCopy.export }));
    await waitFor(() => expect(canvas.getByText(liveCopy.failed)).toBeVisible());
    await expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
    await expect(calls).toHaveLength(1);
  },
};
export const NoRegisteredFactors: Story = {
  beforeEach: () => mock('no-factors'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await open(canvas);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.noFactors);
    await expect(calls).toHaveLength(1);
  },
};
export const WrongPassword: Story = {
  beforeEach: () => mock('password-error'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await password(canvas);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.passwordFailed);
    await expect(canvas.getByLabelText(copy.labels.password, { exact: false, selector: 'input' })).toHaveValue('');
    await expect(calls).toHaveLength(2);
  },
};
export const FactorRejected: Story = {
  beforeEach: () => mock('factor-error'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await password(canvas);
    await userEvent.type(canvas.getByRole('textbox', { name: copy.labels.code }), copy.stories.code);
    await userEvent.click(canvas.getByRole('button', { name: copy.liveButtons.totp }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.stories.factorFailed);
    await expect(canvas.getByRole('textbox', { name: copy.labels.code })).toHaveValue('');
    await expect(downloads).toHaveLength(0);
  },
};
export const PasskeyCancelled: Story = {
  beforeEach: () => mock('passkey-cancelled'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await password(canvas);
    await userEvent.click(canvas.getByRole('button', { name: copy.liveButtons.passkey }));
    await expect(canvas.getByRole('alert')).toBeVisible();
    await expect(calls).toHaveLength(2);
    await userEvent.click(canvas.getByRole('radio', { name: copy.labels.totp }));
    await expect(canvas.getByRole('textbox', { name: copy.labels.code })).toBeVisible();
    await expect(downloads).toHaveLength(0);
  },
};
async function uncertain(canvas: Canvas) {
  await verified(canvas);
  await userEvent.click(within(canvas.getByRole('alertdialog')).getByRole('button', { name: copy.liveButtons.confirm }));
  await waitFor(() => expect(canvas.getByText(new RegExp(liveCopy.uncertain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeVisible());
  await expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
  await expect(downloads).toHaveLength(0);
  await expect(calls.filter(call => call.operation === 'commit')).toHaveLength(1);
}
export const ExportRejected: Story = { beforeEach: () => mock('commit-error'), play: async ({ canvasElement }) => uncertain(within(canvasElement.ownerDocument.body)) };
export const LostDownloadNotRetried: Story = { beforeEach: () => mock('lost-download'), play: async ({ canvasElement }) => uncertain(within(canvasElement.ownerDocument.body)) };
export const InvalidCsvRejected: Story = { beforeEach: () => mock('invalid-csv'), play: async ({ canvasElement }) => uncertain(within(canvasElement.ownerDocument.body)) };
export const InvalidChecksumRejected: Story = { beforeEach: () => mock('invalid-hash'), play: async ({ canvasElement }) => uncertain(within(canvasElement.ownerDocument.body)) };
export const OverLimitBlocked: Story = {
  args: { initialPage: { ...initial, total: 50_001 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await open(canvas);
    await expect(canvas.getByRole('alert')).toHaveTextContent(copy.limit);
    await expect(calls).toHaveLength(1);
  },
};
export const CancelAndClearVerification: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await verified(canvas);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await open(canvas);
    await expect(canvas.getByRole('textbox', { name: copy.labels.reason })).toHaveValue('');
    await expect(downloads).toHaveLength(0);
    await expect(calls.filter(call => call.operation === 'commit')).toHaveLength(0);
  },
};
export const StaleMethodsCannotOpenReview: Story = {
  beforeEach: () => mock('methods-race'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: viewerCopy.export }));
    await userEvent.type(canvas.getByRole('textbox', { name: /Search events/ }), 'staff-taylor');
    await waitFor(() => expect(canvas.queryByText(liveCopy.loading)).not.toBeInTheDocument(), { timeout: 3000 });
    await expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
  },
};
export const DeniedVerificationCancelsLateDownload: Story = {
  beforeEach: () => mock('denied-download-race'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: viewerCopy.liveVerify }));
    await verified(canvas);
    await userEvent.click(within(canvas.getByRole('alertdialog')).getByRole('button', { name: copy.liveButtons.confirm }));
    await waitFor(() => expect(calls.at(-1)?.operation).toBe('commit'));
    denyVerification();
    await waitFor(() => expect(canvas.getByRole('heading', { name: viewerCopy.deniedTitle })).toBeVisible());
    finishDownload();
    await new Promise(resolve => setTimeout(resolve, 100));
    await expect(downloads).toHaveLength(0);
    await expect(canvas.queryByText(liveCopy.prepared)).not.toBeInTheDocument();
    await expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
  },
};
