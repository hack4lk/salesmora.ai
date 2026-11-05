import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IntakeSourceEvidence } from './intake-source-evidence';
import { intakeSourceEvidenceData as copy } from './intake-source-evidence.data';
import type { IntakeEvidenceSnapshot } from './intake-source-evidence.validation';
const email: IntakeEvidenceSnapshot = {
  intakeId: 'intake-example', version: 1, sourceName: copy.stories.source, receivedAt: '2026-10-29T14:30:00Z', type: 'gmail',
  from: copy.stories.sender, subject: copy.stories.subject, body: copy.stories.body,
  fields: [{ id: 'name', label: copy.stories.name, origin: { kind: 'email', location: 'body', quote: copy.stories.nameQuote } }, { id: 'timing', label: copy.stories.timing, uncertain: true, origin: { kind: 'email', location: 'body', quote: copy.stories.timingQuote } }, { id: 'address', label: copy.stories.address, origin: null }],
};
const form: IntakeEvidenceSnapshot = {
  intakeId: 'intake-form', version: 2, sourceName: copy.stories.formSource, receivedAt: email.receivedAt, type: 'website',
  answers: [{ id: 'name', label: copy.stories.name, value: copy.stories.formName }, { id: 'project', label: copy.stories.project, value: copy.stories.formProject }],
  fields: [{ id: 'name', label: copy.stories.name, origin: { kind: 'form', answerId: 'name', quote: copy.stories.formName } }],
};
const meta = {
  title: 'Lead Capture/IntakeSourceEvidence', component: IntakeSourceEvidence, parameters: { layout: 'fullscreen' },
  decorators: [Story => <main className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{copy.stories.description}</p><div className="mx-auto max-w-3xl"><Story /></div></main>],
  args: { snapshot: email, canRead: true, timezone: 'America/New_York', onRetry: fn() },
} satisfies Meta<typeof IntakeSourceEvidence>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('heading', { name: copy.email })).toBeVisible(); await expect(c.getByText((_text, element) => element?.tagName === 'P' && element.textContent === copy.stories.body)).toBeVisible(); await expect(c.getByText(copy.found, { exact: true })).toBeVisible(); await expect(c.getByText(copy.uncertain, { exact: true })).toBeVisible(); await expect(c.getByText(copy.missing, { exact: true })).toBeVisible();
} };
export const FormSubmission: Story = { args: { snapshot: form }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('heading', { name: copy.form })).toBeVisible(); await expect(c.getByText(copy.stories.formProject)).toBeVisible(); await expect(c.queryByRole('textbox')).not.toBeInTheDocument();
} };
export const SenderAndSubjectEvidence: Story = { args: { snapshot: { ...email, fields: [{ id: 'sender', label: copy.from, origin: { kind: 'email', location: 'from', quote: copy.stories.sender } }, { id: 'subject', label: copy.subject, origin: { kind: 'email', location: 'subject', quote: copy.stories.subject } }] } } };
export const UnsupportedQuote: Story = { args: { snapshot: { ...email, fields: [{ id: 'address', label: copy.stories.address, origin: { kind: 'email', location: 'body', quote: 'Fabricated address not present in the original' } }] } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.unsupported)).toBeVisible(); await expect(c.queryByText('Fabricated address not present in the original')).not.toBeInTheDocument(); await expect(c.queryByText(copy.found, { exact: true })).not.toBeInTheDocument();
} };
export const WrongSourceKind: Story = { args: { snapshot: { ...form, fields: email.fields } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.queryByText(copy.found, { exact: true })).not.toBeInTheDocument(); await expect(c.getAllByText(copy.unsupported)).toHaveLength(2); } };
export const NoFieldEvidence: Story = { args: { snapshot: { ...email, fields: [] } } };
export const EmptyEmail: Story = { args: { snapshot: { ...email, from: '', subject: '', body: '', fields: [] } }, play: async ({ canvasElement }) => { const c = within(canvasElement); for (const text of [copy.noSender, copy.noSubject, copy.noBody]) await expect(c.getByText(text)).toBeVisible(); } };
export const EmptyForm: Story = { args: { snapshot: { ...form, answers: [], fields: [] } } };
export const UnansweredField: Story = { args: { snapshot: { ...form, answers: [{ id: 'project', label: copy.stories.project, value: '' }], fields: [] } } };
export const Loading: Story = { args: { state: 'loading' }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('status')).toHaveAttribute('aria-busy', 'true'); await expect(c.queryByText(copy.stories.sender)).not.toBeInTheDocument(); } };
export const Error: Story = { args: { state: 'error' }, play: async ({ canvasElement, args }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.error); await userEvent.click(c.getByRole('button', { name: copy.retry })); await expect(args.onRetry).toHaveBeenCalledTimes(1); await expect(c.queryByText(copy.stories.sender)).not.toBeInTheDocument(); } };
export const InvalidSnapshot: Story = { args: { snapshot: { ...email, version: 0 } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.invalid); await expect(c.queryByText(copy.stories.body)).not.toBeInTheDocument(); } };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(copy.denied); await expect(c.queryByText(copy.stories.sender)).not.toBeInTheDocument(); await expect(c.queryByRole('button')).not.toBeInTheDocument(); } };
export const InvalidTime: Story = { args: { snapshot: { ...email, receivedAt: 'invalid' }, timezone: 'invalid/zone' }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText(copy.unavailableDate)).toBeVisible(); } };
export const UntrustedContent: Story = { args: { snapshot: { ...email, from: copy.stories.untrusted, subject: copy.stories.untrusted, body: copy.stories.untrusted, fields: [{ id: 'project', label: copy.stories.project, origin: { kind: 'email', location: 'body', quote: copy.stories.untrusted } }] } }, play: async ({ canvasElement }) => { const c = within(canvasElement); await expect(c.getAllByText(copy.stories.untrusted)).toHaveLength(4); for (const role of ['img', 'link', 'textbox'] as const) await expect(c.queryByRole(role)).not.toBeInTheDocument(); } };
export const LongContent: Story = { args: { snapshot: { ...email, sourceName: copy.stories.long.repeat(3), subject: copy.stories.long.repeat(3), body: `${copy.stories.body}\n${copy.stories.long.repeat(12)}\n${'unbroken'.repeat(30)}` } } };
