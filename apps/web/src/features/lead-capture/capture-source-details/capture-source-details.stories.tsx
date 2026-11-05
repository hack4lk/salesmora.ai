import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CaptureSourceDetails } from './capture-source-details';
import { captureSourceDetailsData as copy } from './capture-source-details.data';
const source = { id: 'website-source', name: copy.stories.name, type: 'website' as const, status: 'active' as const };
const configuration = { kind: 'approved' as const, version: 2, rows: copy.stories.rows };
const gmail = { source: { ...source, type: 'gmail' as const, name: copy.stories.gmailName }, configuration: { ...configuration, rows: copy.stories.gmailRows }, availability: { type: 'gmail' as const, status: 'connected' as const, email: copy.stories.email } };
const meta = {
  title: 'Lead Capture/CaptureSourceDetails', component: CaptureSourceDetails, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{copy.stories.description}</p><Story /></main>],
  args: { source, configuration, availability: { type: 'website', status: 'published' }, canRead: true, canEdit: true, canManageConnection: true, canReadPublication: true, onEdit: fn(), onManageConnection: fn(), onViewPublication: fn(), onRetry: fn() },
} satisfies Meta<typeof CaptureSourceDetails>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('heading', { name: copy.configuration })).toBeVisible(); await userEvent.click(c.getByRole('button', { name: copy.edit })); await expect(args.onEdit).toHaveBeenCalledTimes(1); await userEvent.click(c.getByRole('button', { name: copy.publicationAction })); await expect(args.onViewPublication).toHaveBeenCalledTimes(1);
} };
export const Gmail: Story = { args: gmail, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.stories.email)).toBeVisible(); await userEvent.click(c.getByRole('button', { name: copy.connectionAction })); await expect(args.onManageConnection).toHaveBeenCalledTimes(1);
} };
export const ReconnectRequired: Story = { args: { ...gmail, availability: { ...gmail.availability, status: 'reconnect-required' } } };
export const NotConnected: Story = { args: { ...gmail, source: { ...gmail.source, status: 'draft' }, configuration: { ...gmail.configuration, kind: 'draft', version: 1 }, availability: { type: 'gmail', status: 'not-connected' } } };
export const Draft: Story = { args: { source: { ...source, status: 'draft' }, configuration: { ...configuration, kind: 'draft', version: 1 }, availability: { type: 'website', status: 'unpublished' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('heading', { name: copy.draftConfiguration })).toBeVisible(); await expect(c.queryByRole('heading', { name: copy.configuration })).not.toBeInTheDocument();
} };
export const UnpublishedRevision: Story = { args: { draftVersion: 3 }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.draftNotice)).toBeVisible(); await expect(c.getByText(`${copy.version} 2`, { exact: true })).toBeVisible(); await userEvent.click(c.getByRole('button', { name: copy.continueDraft })); await expect(args.onEdit).toHaveBeenCalledTimes(1);
} };
export const Paused: Story = { args: { source: { ...source, status: 'paused' } } };
export const Scheduled: Story = { args: { source: { ...source, status: 'scheduled' } } };
export const Archived: Story = { args: { ...gmail, source: { ...gmail.source, status: 'archived' } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(c.getByText(copy.archived)).toBeVisible();
} };
export const ReadOnly: Story = { args: { ...gmail, canEdit: false, canManageConnection: false, canReadPublication: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.queryByRole('button')).not.toBeInTheDocument(); await expect(c.getByText(copy.readonly)).toBeVisible();
} };
export const NoPublicationAccess: Story = { args: { canReadPublication: false }, play: async ({ canvasElement }) => { await expect(within(canvasElement).queryByRole('button', { name: copy.publicationAction })).not.toBeInTheDocument(); } };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); for (const button of c.getAllByRole('button')) await expect(button).toBeDisabled(); await expect(args.onEdit).not.toHaveBeenCalled();
} };
export const Loading: Story = { args: { state: 'loading', configuration: undefined }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('status')).toHaveAttribute('aria-busy', 'true'); await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error); await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onRetry).toHaveBeenCalledTimes(1); await expect(c.queryByText(copy.stories.rows[0].value)).not.toBeInTheDocument();
} };
export const InvalidRevision: Story = { args: { draftVersion: 1 }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid); await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const MissingAccount: Story = { args: { ...gmail, availability: { type: 'gmail', status: 'connected' } }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(copy.invalid); } };
export const PermissionDenied: Story = { args: { ...gmail, canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByText(copy.stories.email)).not.toBeInTheDocument(); await expect(c.queryByRole('button')).not.toBeInTheDocument();
} };
export const PublicationUnavailable: Story = { args: { availability: { type: 'website', status: 'unavailable' } } };
export const LongContent: Story = { args: { ...gmail, configuration: { ...configuration, rows: configuration.rows.map(row => ({ label: row.label, value: copy.stories.long.repeat(5) })) }, availability: { ...gmail.availability, email: `long${'email'.repeat(15)}@example.com` } } };

export const GmailRecoveryRequired: Story = {
  args: { ...gmail, availability: {
    ...gmail.availability,
    health: { connection: 'connected', sync: 'recovery-required', queued: 3, failed: 1 },
  } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(copy.syncStates['recovery-required']);
    await expect(canvas.getByText(copy.syncCounts(3, 1))).toBeVisible();
  },
};
