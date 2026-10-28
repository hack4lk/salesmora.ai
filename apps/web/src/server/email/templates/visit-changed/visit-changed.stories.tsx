import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { renderVisitChangedEmail, type VisitChangedEmailInput } from './visit-changed';
import { visitChangedEmailData as copy } from './visit-changed.data';
const job = { type: 'job' as const, id: copy.stories.jobId, number: copy.stories.jobNumber, title: copy.stories.jobTitle };
const order = { type: 'work_order' as const, id: copy.stories.orderId, number: copy.stories.orderNumber, title: copy.stories.orderTitle };
const defaults: VisitChangedEmailInput = { baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace,
  actorName: copy.stories.actor, event: 'rescheduled', before: { scheduledDate: copy.stories.beforeDate, arrivalWindow: '09:00-11:00' },
  after: { scheduledDate: copy.stories.afterDate, arrivalWindow: '13:00-15:00' }, timezone: copy.stories.timezone, records: [job, order] };
function EmailPreview(input: VisitChangedEmailInput) {
  const email = renderVisitChangedEmail(input, copy.stories.logoSrc);
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><dl className="mb-0 mt-4 text-sm"><dt className="text-muted">{copy.stories.subject}</dt><dd className="m-0 font-semibold text-ink wrap-anywhere">{email.subject}</dd></dl></header><iframe title={copy.stories.frame} srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas"/></main>;
}
const meta = { title: 'Email/VisitChanged', component: EmailPreview, args: defaults, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Scheduled: Story = { args: { event: 'scheduled', before: { scheduledDate: null, arrivalWindow: null } } };
export const Cleared: Story = { args: { event: 'cleared', after: { scheduledDate: null, arrivalWindow: null } } };
export const WorkOrderOnly: Story = { args: { records: [order] }, play: async ({ args }) => {
  const email = renderVisitChangedEmail(args); await expect(email.html).not.toContain(copy.stories.jobNumber); await expect(email.html).not.toContain(`/jobs/${copy.stories.jobId}`);
  await expect(email.text).toContain(`/work-orders/${copy.stories.orderId}`);
} };
export const Joined: Story = { args: { event: 'joined', records: [order] } };
export const Separated: Story = { args: { event: 'separated', records: [order] } };
export const SeparatedUnscheduled: Story = { args: { event: 'separated', records: [order], after: { scheduledDate: null, arrivalWindow: null } } };
export const NoArrivalWindow: Story = { args: { after: { scheduledDate: copy.stories.afterDate, arrivalWindow: null } } };
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace, actorName: copy.stories.longActor, records: [{ ...order, title: copy.stories.longTitle }] } };
export const EscapedContent: Story = { args: { workspaceName: copy.stories.escapedWorkspace, actorName: copy.stories.escapedActor, records: [{ ...order, title: copy.stories.escapedTitle }] }, play: async ({ args }) => {
  const email = renderVisitChangedEmail(args); await expect(email.html).not.toContain('<script>'); await expect(email.html).not.toContain('<img src=x'); await expect(email.html).toContain('&lt;script&gt;');
} };
export const PlainText: Story = { render: () => <main className="mx-auto grid w-full max-w-2xl gap-4 p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.textHeading}</h1><pre data-testid="plain-text-email" className="m-0 whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-ink wrap-anywhere">{renderVisitChangedEmail(defaults).text}</pre></main>, play: async ({ canvasElement }) => {
  const text = within(canvasElement).getByTestId('plain-text-email'); await expect(text).toHaveTextContent(copy.stories.jobNumber); await expect(text).toHaveTextContent(copy.stories.orderNumber); await expect(text).toHaveTextContent(copy.stories.timezone);
} };
