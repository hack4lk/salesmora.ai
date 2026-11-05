import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, type ReactNode } from 'react';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import type { CapturePublicView, CapturePublicSubmission } from '@salesmora/contracts';
import { PublicCapturePage } from './public-capture-page';
import { publicCapturePageData as copy } from './public-capture-page.data';
import { visitorCaptureFormData as visitor } from '../visitor-capture-form/visitor-capture-form.data';
const source: Extract<CapturePublicView, { state: 'ready' }> = { state: 'ready', submissionAvailable: false, context: 'fixture-context-not-a-token', definition: { publicKey: 'a'.repeat(64), version: 1, contactRequired: true,
  fields: [{ id: 'name', key: 'name', type: 'short_text', label: 'Name', required: true, options: [] }, { id: 'email', key: 'email', type: 'email', label: 'Email', required: false, options: [] }, { id: 'service', key: 'service', type: 'short_text', label: 'Service requested', required: true, options: [] }],
  content: { businessName: copy.stories.business, title: copy.stories.title, intro: 'Tell us what you need help with.', submitLabel: 'Send request', thankYou: 'Thanks for your request.', unavailableMessage: 'Please call our team for help.', businessPhone: copy.stories.phone, businessEmail: '', showBusinessPhone: true, showBusinessEmail: false, privacy: null, consent: null } } };
const meta = { title: 'Lead Capture/PublicCapturePage', component: PublicCapturePage, parameters: { layout: 'fullscreen' }, args: { source }, decorators: [Story => <><p className="m-0 bg-canvas px-4 py-3 text-sm leading-6 text-muted">{copy.stories.notice}</p><Story /></>] } satisfies Meta<typeof PublicCapturePage>;
export default meta; type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('heading', { name: copy.stories.title })).toBeVisible(); await expect(c.getByRole('button', { name: visitor.submit })).toBeDisabled(); for (const field of c.getAllByRole('textbox')) await expect(field).toBeDisabled(); await expect(c.getByText(visitor.deliveryUnavailable)).toBeVisible(); } };
export const Embedded: Story = { args: { embedded: true } };
export const Unavailable: Story = { args: { source: { state: 'unavailable', content: { businessName: copy.stories.business, title: copy.stories.title, unavailableMessage: source.definition.content.unavailableMessage, businessPhone: copy.stories.phone, businessEmail: '', showBusinessPhone: true, showBusinessEmail: false } } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.queryByRole('textbox')).not.toBeInTheDocument(); await expect(c.getByText(copy.stories.phone)).toBeVisible(); } };
export const NotFound: Story = { args: { source: { state: 'not-found' } } };
export const ServiceError: Story = { args: { source: { state: 'error' } } };
export const UntrustedCopy: Story = { args: { source: { ...source, definition: { ...source.definition, content: { ...source.definition.content, title: '<img src=x onerror=alert(1)>', intro: '<script>alert(1)</script>' } } } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('heading', { name: '<img src=x onerror=alert(1)>' })).toBeVisible(); await expect(c.queryByRole('img')).not.toBeInTheDocument(); } };
export const CannotSubmit: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); fireEvent.submit(c.getByRole('button', { name: visitor.submit }).closest('form')!); await expect(c.queryByText(visitor.received)).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: visitor.submit })).toBeDisabled(); } };

type Simulation = 'success' | 'lost' | 'challenge' | 'rate' | 'stale' | 'retry' | 'mismatch' | 'pending';
let requests: CapturePublicSubmission[] = [];
/** Isolated Storybook transport/widget simulation. Restores globals when the preview unmounts. */
function SimulatedRequests({ mode, children }: { mode: Simulation; children: ReactNode }) {
  useEffect(() => {
    const original = globalThis.fetch, previousWidget = window.turnstile; requests = [];
    window.turnstile = { render: (element, options) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Complete simulated check'; button.className = 'min-h-11 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring'; button.onclick = () => (options.callback as (token: string) => void)('fictional-widget-token'); element.append(button); return 'fixture'; }, remove: () => {} };
    globalThis.fetch = fn<typeof fetch>(async (input, options) => {
      if (!String(input).startsWith('/api/public/capture/')) throw Error('Unexpected preview request');
      if (options?.method !== 'POST') return Response.json({ ...source, submissionAvailable: true, context: 'refreshed-fixture-context', definition: { ...source.definition, version: 2, content: { ...source.definition.content, title: 'Refreshed service form' } } });
      const body: CapturePublicSubmission = JSON.parse(String(options.body)); requests.push(body);
      if (mode === 'pending') return new Promise<Response>(() => {});
      if (requests.length === 1) {
        if (mode === 'lost') throw Error('Lost acknowledgement');
        if (mode === 'stale') return Response.json({ state: 'stale' }, { status: 409 });
        if (mode === 'retry') return Response.json({ state: 'retry' }, { status: 503 });
        if (mode === 'mismatch') return Response.json({ state: 'accepted', requestId: '00000000-0000-4000-8000-000000000001' });
        if (mode === 'rate') return Response.json({ state: 'rate-limited', retryAt: new Date(Date.now() + 2500).toISOString() }, { status: 429 });
        if (mode === 'challenge') return Response.json({ state: 'challenge-required', siteKey: 'fixture-site-key', action: 'capture_submit', cData: 'a'.repeat(64) }, { status: 403 });
      }
      return Response.json({ state: 'accepted', requestId: body.requestId });
    });
    return () => { globalThis.fetch = original; window.turnstile = previousWidget; };
  }, [mode]);
  return <><p className="m-0 bg-canvas px-4 py-3 text-sm text-muted">Simulated responses and security widget. No provider or persistence calls.</p>{children}</>;
}
const connected = { source: { ...source, submissionAvailable: true } };
async function send(element: HTMLElement) {
  const c = within(element); await userEvent.type(c.getByRole('textbox', { name: /^Name/ }), 'Jamie'); await userEvent.type(c.getByRole('textbox', { name: /^Email/ }), 'jamie@example.test'); await userEvent.type(c.getByRole('textbox', { name: /^Service requested/ }), 'Repair'); await userEvent.click(c.getByRole('button', { name: visitor.submit }));
}
export const ConnectedSuccess: Story = { args: connected, decorators: [Story => <SimulatedRequests mode="success"><Story /></SimulatedRequests>], play: async ({ canvasElement }) => { await send(canvasElement); await expect(within(canvasElement).getByText(visitor.received)).toBeVisible(); await expect(requests).toHaveLength(1); } };
export const ConnectedLostResponse: Story = { args: connected, decorators: [Story => <SimulatedRequests mode="lost"><Story /></SimulatedRequests>], play: async ({ canvasElement }) => {
  await send(canvasElement); const c = within(canvasElement); await expect(c.getByRole('textbox', { name: /^Name/ })).toBeDisabled(); await userEvent.click(c.getByRole('button', { name: visitor.retryRequest })); await expect(c.getByText(visitor.received)).toBeVisible(); await expect(requests[0]).toEqual(requests[1]);
} };
export const ConnectedChallenge: Story = { args: connected, decorators: [Story => <SimulatedRequests mode="challenge"><Story /></SimulatedRequests>], play: async ({ canvasElement }) => {
  await send(canvasElement); const c = within(canvasElement); await expect(c.getByRole('button', { name: visitor.retryRequest })).toBeDisabled(); await userEvent.click(await c.findByRole('button', { name: 'Complete simulated check' })); await userEvent.click(c.getByRole('button', { name: visitor.retryRequest })); await expect(c.getByText(visitor.received)).toBeVisible(); await expect(requests[0].requestId).toBe(requests[1].requestId); await expect(requests[1].challengeToken).toBe('fictional-widget-token');
} };
export const ConnectedRateLimit: Story = { args: connected, decorators: [Story => <SimulatedRequests mode="rate"><Story /></SimulatedRequests>], play: async ({ canvasElement }) => {
  await send(canvasElement); const c = within(canvasElement); await expect(c.getByRole('button', { name: visitor.retryRequest })).toBeDisabled(); await waitFor(() => expect(c.getByRole('button', { name: visitor.retryRequest })).toBeEnabled(), { timeout: 6000 }); await userEvent.click(c.getByRole('button', { name: visitor.retryRequest })); await expect(c.getByText(visitor.received)).toBeVisible(); await expect(requests[0].requestId).toBe(requests[1].requestId);
} };
export const ConnectedStaleForm: Story = { args: connected, decorators: [Story => <SimulatedRequests mode="stale"><Story /></SimulatedRequests>], play: async ({ canvasElement }) => {
  await send(canvasElement); const c = within(canvasElement); await expect(c.getByRole('textbox', { name: /^Name/ })).toHaveValue('Jamie'); await expect(c.queryByText(visitor.deliveryUnavailable)).not.toBeInTheDocument(); await userEvent.click(c.getByRole('button', { name: copy.refresh })); await expect(c.getByRole('heading', { name: 'Refreshed service form' })).toBeVisible(); await expect(c.getByRole('textbox', { name: /^Name/ })).toHaveValue('Jamie'); await userEvent.click(c.getByRole('button', { name: visitor.submit })); await expect(c.getByText(visitor.received)).toBeVisible(); await expect(requests[0].requestId).not.toBe(requests[1].requestId); await expect(requests[1].context).toBe('refreshed-fixture-context');
} };
export const ConnectedServiceRetry: Story = { ...ConnectedLostResponse, decorators: [Story => <SimulatedRequests mode="retry"><Story /></SimulatedRequests>] };
export const ConnectedMismatchedAcknowledgement: Story = { args: connected, decorators: [Story => <SimulatedRequests mode="mismatch"><Story /></SimulatedRequests>], play: async ({ canvasElement }) => { await send(canvasElement); const c = within(canvasElement); await expect(c.queryByText(visitor.received)).not.toBeInTheDocument(); await expect(c.getByRole('button', { name: visitor.retryRequest })).toBeEnabled(); await expect(c.getByRole('textbox', { name: /^Name/ })).toBeDisabled(); } };
export const ConnectedPending: Story = { args: connected, decorators: [Story => <SimulatedRequests mode="pending"><Story /></SimulatedRequests>], play: async ({ canvasElement }) => { await send(canvasElement); const c = within(canvasElement); await expect(c.getByRole('button', { name: visitor.pending })).toBeDisabled(); fireEvent.submit(c.getByRole('button', { name: visitor.pending }).closest('form')!); await expect(requests).toHaveLength(1); } };
