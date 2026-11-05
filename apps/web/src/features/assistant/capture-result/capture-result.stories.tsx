import { useState } from 'react';
import { AssistantPanel } from '@salesmora/ui';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CaptureAssistantResult } from './capture-result';
import type { CaptureAssistantClient, CaptureAssistantView } from './capture-result.types';
import { captureAssistantProposalFixture, captureAssistantResultFixture } from './capture-result.fixtures';
import { captureAssistantResultData as copy } from './capture-result.data';
import { captureSetupReviewData as publicationCopy } from '../../lead-capture/capture-setup-review/capture-setup-review.data';
import { capturePauseResumeDialogData as lifecycleCopy } from '../../lead-capture/capture-pause-resume-dialog/capture-pause-resume-dialog.data';
import { intakeDecisionReviewData as intakeCopy } from '../../lead-capture/intake-decision-review/intake-decision-review.data';
function mockClient(initial: CaptureAssistantView): CaptureAssistantClient {
  let current = structuredClone(initial);
  return { read: fn(async () => structuredClone(current)), decide: fn(async (_ref, decision) => {
    if (current.kind !== 'proposal') throw Error('Not a proposal');
    const outcomes = { source_action: copy.stories.saved, setup: copy.stories.saved, fields: copy.stories.saved, workflow: copy.stories.saved, lifecycle: copy.stories.paused, publication: copy.stories.launched, intake: copy.stories.intakeSaved };
    current = { ...current, ticket: { ...current.ticket, state: decision.decision === 'confirm' ? 'confirmed' : 'cancelled' }, outcome: outcomes[current.content.kind] };
    return structuredClone(current);
  }) };
}
const proposal = captureAssistantProposalFixture();
const argsFor = (view: CaptureAssistantView) => ({ reference: view.reference, client: mockClient(view) });
const meta = {
  title: 'Assistant/LeadCaptureResult', component: CaptureAssistantResult,
  parameters: { layout: 'fullscreen' },
  args: { ...argsFor(proposal), onRefresh: fn(async () => {}), onOpen: fn(), onCopy: fn(async () => {}) },
  decorators: [Story => <main className="min-h-screen bg-canvas p-3 sm:p-6"><h1 className="m-0 mb-4 text-xl font-semibold text-ink">Lead Capture assistant</h1><p className="mb-5 text-sm leading-6 text-muted">{copy.stories.notice}</p><div className="mx-auto w-full max-w-4xl"><Story /></div></main>],
} satisfies Meta<typeof CaptureAssistantResult>;
export default meta;
type Story = StoryObj<typeof meta>;
const openReview = async (element: HTMLElement) => { const c = within(element); await userEvent.click(await c.findByRole('button', { name: copy.review })); return c; };
export const FieldReview: Story = { play: async ({ canvasElement, args }) => {
  const c = await openReview(canvasElement);
  await expect(c.getByRole('button', { name: copy.confirm })).toBeEnabled();
  await expect(args.client.decide).not.toHaveBeenCalled();
  await expect(c.getByRole('checkbox', { name: /Require email or phone/ })).toBeDisabled();
} };
const focusRead = fn<CaptureAssistantClient['read']>(async () => structuredClone(proposal));
export const ReviewSurvivesWindowFocus: Story = { args: { client: { ...mockClient(proposal), read: focusRead } }, play: async ({ canvasElement }) => {
  const c = await openReview(canvasElement);
  const calls = focusRead.mock.calls.length;
  canvasElement.ownerDocument.defaultView?.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(focusRead).toHaveBeenCalledTimes(calls + 1));
  await expect(c.getByRole('button', { name: copy.confirm })).toBeVisible();
} };
export const ConfirmSuggestions: Story = { play: async ({ canvasElement, args }) => {
  const c = await openReview(canvasElement); await userEvent.dblClick(c.getByRole('button', { name: copy.confirm }));
  await expect(await c.findByText(copy.stories.saved)).toBeVisible();
  await expect(args.client.decide).toHaveBeenCalledTimes(1);
  await expect(args.client.decide).toHaveBeenCalledWith(proposal.reference, { workspaceId: proposal.ticket.workspaceId, proposalId: proposal.ticket.proposalId, inputHash: proposal.ticket.inputHash, decision: 'confirm' }, expect.any(AbortSignal));
  await expect(args.onRefresh).toHaveBeenCalledTimes(1);
} };
export const WorkflowReview: Story = { args: argsFor(captureAssistantProposalFixture('workflow')), play: async ({ canvasElement }) => { const c = await openReview(canvasElement); await expect(c.getByRole('checkbox', { name: /Notify/ })).toBeDisabled(); } };
export const PublicationReview: Story = { args: argsFor(captureAssistantProposalFixture('publication')), play: async ({ canvasElement, args }) => {
  const c = await openReview(canvasElement);
  await expect(c.getByRole('radio', { name: publicationCopy.scheduled })).toBeDisabled();
  await expect(c.getByRole('button', { name: publicationCopy.launch })).toBeDisabled();
  await userEvent.click(c.getByRole('checkbox', { name: publicationCopy.confirm }));
  await userEvent.click(c.getByRole('button', { name: publicationCopy.launch }));
  await expect(await c.findByText(copy.stories.launched)).toBeVisible(); await expect(args.client.decide).toHaveBeenCalledTimes(1);
} };
export const LifecycleReview: Story = { args: argsFor(captureAssistantProposalFixture('lifecycle')), play: async ({ canvasElement, args }) => {
  await openReview(canvasElement); const body = within(canvasElement.ownerDocument.body);
  await expect(await body.findByRole('alertdialog')).toBeVisible();
  await userEvent.click(body.getByRole('button', { name: lifecycleCopy.confirm.pause }));
  await expect(await within(canvasElement).findByText(copy.stories.paused)).toBeVisible();
  await expect(args.client.decide).toHaveBeenCalledTimes(1);
} };
export const IntakeReview: Story = { args: argsFor(captureAssistantProposalFixture('intake')), play: async ({ canvasElement, args }) => {
  const c = await openReview(canvasElement); await userEvent.click(c.getByRole('button', { name: intakeCopy.confirm.create }));
  await expect(await c.findByText(copy.stories.intakeSaved)).toBeVisible(); await expect(args.client.decide).toHaveBeenCalledTimes(1);
} };
export const CancelProposal: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: copy.cancel }));
  await expect(await c.findByText(copy.cancelled)).toBeVisible(); await expect(args.client.decide).toHaveBeenCalledTimes(1);
} };
export const Loading: Story = { args: { client: { ...mockClient(proposal), read: fn(() => new Promise<CaptureAssistantView>(() => {})) } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.loading)).toBeVisible(); } };
export const Pending: Story = { args: { client: { ...mockClient(proposal), decide: fn(() => new Promise<CaptureAssistantView>(() => {})) } }, play: async ({ canvasElement, args }) => {
  const c = await openReview(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(c.getByRole('button', { name: copy.pending })).toBeDisabled(); await expect(c.getByRole('button', { name: copy.cancel })).toBeDisabled(); await expect(args.client.decide).toHaveBeenCalledTimes(1);
} };
export const Denied: Story = { args: { client: { ...mockClient(proposal), read: fn(async () => { throw Error('403'); }) } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(await c.findByText(copy.unavailable)).toBeVisible(); await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument();
} };
export const StaleBinding: Story = { args: { client: mockClient({ ...proposal, ticket: { ...proposal.ticket, inputHash: 'b'.repeat(64) } }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(await c.findByText(copy.unavailable)).toBeVisible(); await expect(c.queryByRole('button', { name: copy.review })).not.toBeInTheDocument();
} };
const expired = { ...proposal, ticket: { ...proposal.ticket, createdAt: new Date(Date.now() - 900001).toISOString(), expiresAt: new Date(Date.now() - 1).toISOString() } };
export const Expired: Story = { args: argsFor(expired), play: async ({ canvasElement, args }) => { await expect(await within(canvasElement).findByText(copy.expired)).toBeVisible(); await expect(args.client.decide).not.toHaveBeenCalled(); } };
export const ConflictAndReload: Story = { args: { client: { ...mockClient(proposal), decide: fn(async () => { throw Error('409'); }) } }, play: async ({ canvasElement, args }) => {
  const c = await openReview(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.confirm }));
  await expect(await c.findByText(copy.failed)).toBeVisible(); await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(await c.findByRole('button', { name: copy.review })).toBeVisible(); await expect(args.client.decide).toHaveBeenCalledTimes(1);
} };
export const SourceSummary: Story = { args: argsFor(captureAssistantResultFixture()) };
export const SourceResults: Story = { args: argsFor(captureAssistantResultFixture('sources')), play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(await c.findByText(copy.window(1, 38))).toBeVisible(); await expect(c.queryByRole('button', { name: /Resume/ })).not.toBeInTheDocument();
  await userEvent.click(c.getByRole('button', { name: /Open/ })); await expect(args.onOpen).toHaveBeenCalledTimes(1);
} };
export const Installation: Story = { args: argsFor(captureAssistantResultFixture('installation')), play: async ({ canvasElement, args }) => { const c = within(canvasElement); await userEvent.click(await c.findByRole('button', { name: 'Copy link' })); await expect(args.onCopy).toHaveBeenCalledWith('https://forms.salesmora.example/f/fictional'); } };
export const IntakeEvidence: Story = { args: argsFor(captureAssistantResultFixture('intake_evidence')) };
function RevocationPreview(args: React.ComponentProps<typeof CaptureAssistantResult>) {
  const [disabled, setDisabled] = useState(false);
  return <><button type="button" onClick={() => setDisabled(true)}>Revoke access (fixture)</button><CaptureAssistantResult {...args} disabled={disabled} /></>;
}
export const AccessRevoked: Story = { render: args => <RevocationPreview {...args} />, play: async ({ canvasElement, args }) => {
  const c = await openReview(canvasElement); await userEvent.click(c.getByRole('button', { name: 'Revoke access (fixture)' }));
  await expect(c.getByText(copy.unavailable)).toBeVisible(); await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument(); await expect(args.client.decide).not.toHaveBeenCalled();
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, args }) => { await expect(within(canvasElement).getByText(copy.unavailable)).toBeVisible(); await expect(args.client.read).not.toHaveBeenCalled(); } };

function ChatPreview(args: React.ComponentProps<typeof CaptureAssistantResult>) {
  return <AssistantPanel messages={[{ id: 'capture-proposal', role: 'assistant', text: 'I prepared a proposal. Review it before confirming any change.' }]}
    sendDisabled onSend={async () => ({ ok: false, message: 'Preview only.' })}
    renderMessageSupplement={() => <CaptureAssistantResult {...args} />} />;
}
export const SharedChatReview: Story = { render: args => <ChatPreview {...args} />, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: 'SalesMora assistant How can I help?' }));
  await userEvent.click(await body.findByRole('button', { name: copy.review }));
  await expect(body.getByRole('button', { name: copy.confirm })).toBeVisible();
  await expect(args.client.decide).not.toHaveBeenCalled();
} };
export const SharedChatLifecycle: Story = { args: argsFor(captureAssistantProposalFixture('lifecycle')), render: args => <ChatPreview {...args} />, play: async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole('button', { name: 'SalesMora assistant How can I help?' }));
  await userEvent.click(await body.findByRole('button', { name: copy.review }));
  await expect(await body.findByRole('alertdialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect(body.queryByRole('alertdialog')).not.toBeInTheDocument();
  await expect(body.getByRole('button', { name: 'Close chat' })).toBeVisible();
  await expect(args.client.decide).not.toHaveBeenCalled();
} };
export const RefreshedAccessDenied: Story = {
  args: { client: { ...mockClient(proposal), read: fn<CaptureAssistantClient['read']>().mockResolvedValueOnce(proposal).mockRejectedValue(new Error('403')) } },
  play: async ({ canvasElement }) => {
    const c = await openReview(canvasElement);
    window.dispatchEvent(new Event('focus'));
    await expect(await c.findByText(copy.unavailable)).toBeVisible();
    await expect(c.queryByText(copy.stories.name)).not.toBeInTheDocument();
  },
};
export const ReadinessBlocked: Story = { args: (() => {
  const view = captureAssistantProposalFixture('publication');
  if (view.content.kind === 'publication') view.content.draft.checks = view.content.draft.checks.map(check => check.id === 'access' ? { ...check, status: 'blocked', detail: 'Delivery is unavailable. No launch has occurred.' } : check);
  return argsFor(view);
})(), play: async ({ canvasElement, args }) => {
  const c = await openReview(canvasElement);
  await expect(c.getByRole('button', { name: publicationCopy.launch })).toBeDisabled();
  await expect(args.client.decide).not.toHaveBeenCalled();
} };
