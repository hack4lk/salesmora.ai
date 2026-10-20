import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { renderLeadAssignedEmail, type LeadAssignedEmailInput } from './lead-assigned';
import { leadAssignedEmailData as copy } from './lead-assigned.data';
const defaults: LeadAssignedEmailInput = { baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, leadId: copy.stories.leadId, workspaceName: copy.stories.workspace, assignerName: copy.stories.assigner, leadNumber: copy.stories.leadNumber, leadName: copy.stories.customer, service: copy.stories.service, stage: 'new' };
function EmailPreview(input: LeadAssignedEmailInput) {
  const email = renderLeadAssignedEmail(input, copy.stories.logoSrc);
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><dl className="mb-0 mt-4 text-sm"><dt className="text-muted">{copy.stories.subject}</dt><dd className="m-0 font-semibold text-ink wrap-anywhere">{email.subject}</dd></dl></header><iframe title={copy.stories.frame} srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas"/></main>;
}
const meta = { title: 'Email/LeadAssigned', component: EmailPreview, args: defaults, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Contacted: Story = { args: { stage: 'contacted' } };
export const EstimateSent: Story = { args: { stage: 'estimate-sent' } };
export const Won: Story = { args: { stage: 'won' } };
export const Lost: Story = { args: { stage: 'lost' } };
export const LongNames: Story = { args: { workspaceName: copy.stories.longWorkspace, assignerName: copy.stories.longAssigner, leadName: copy.stories.longCustomer, service: copy.stories.longService } };
export const EscapedContent: Story = { args: { workspaceName: copy.stories.escapedWorkspace, assignerName: copy.stories.escapedAssigner, leadName: copy.stories.escapedCustomer, service: copy.stories.escapedService }, play: async () => {
  const email = renderLeadAssignedEmail({ ...defaults, workspaceName: copy.stories.escapedWorkspace, leadName: copy.stories.escapedCustomer });
  await expect(email.html).not.toContain('<script>'); await expect(email.html).not.toContain('<img src=x'); await expect(email.html).toContain('&lt;script&gt;');
} };
export const PlainText: Story = { render: () => <main className="mx-auto grid w-full max-w-2xl gap-4 p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.textHeading}</h1><pre data-testid="plain-text-email" className="m-0 whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-ink wrap-anywhere">{renderLeadAssignedEmail(defaults).text}</pre></main>, play: async ({ canvasElement }) => {
  const text = within(canvasElement).getByTestId('plain-text-email'); await expect(text).toHaveTextContent(copy.stories.leadNumber); await expect(text).toHaveTextContent(copy.purpose); await expect(text).toHaveTextContent(`workspace=${copy.stories.workspaceId}`);
} };
export const Mobile: Story = { ...LongNames, globals: { viewport: { value: 'phone', isRotated: false } } };
