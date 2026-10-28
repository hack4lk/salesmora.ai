import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { renderJobAssignmentChangedEmail, type JobAssignmentChangedEmailInput } from './job-assignment-changed';
import { jobAssignmentChangedEmailData as copy } from './job-assignment-changed.data';
const defaults: JobAssignmentChangedEmailInput = {
  baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace, actorName: copy.stories.actor,
  access: 'current', change: 'primary', job: { id: copy.stories.jobId, number: copy.stories.jobNumber, title: copy.stories.jobTitle },
};
function EmailPreview(input: JobAssignmentChangedEmailInput) {
  const email = renderJobAssignmentChangedEmail(input, copy.stories.logoSrc);
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><dl className="mb-0 mt-4 text-sm"><dt className="text-muted">{copy.stories.subject}</dt><dd className="m-0 font-semibold text-ink wrap-anywhere">{email.subject}</dd></dl></header><iframe title={copy.stories.frame} srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas"/></main>;
}
const meta = { title: 'Email/JobAssignmentChanged', component: EmailPreview, args: defaults, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const TeamAdded: Story = { args: { change: 'team' } };
export const AssignmentUpdated: Story = { args: { change: 'updated' } };
function removed(input: JobAssignmentChangedEmailInput): JobAssignmentChangedEmailInput {
  return { ...input, access: 'ended', change: 'removed', job: { number: input.job.number } };
}
export const Removed: Story = {
  args: { access: 'ended', change: 'removed', job: { number: copy.stories.jobNumber } },
  render: args => <EmailPreview {...removed(args)}/>,
  play: async ({ args }) => {
    const email = renderJobAssignmentChangedEmail(removed(args));
    await expect(email.html).not.toContain(copy.stories.jobTitle);
    await expect(email.html).not.toContain(copy.stories.actor);
    await expect(email.html).not.toContain('/jobs/');
    await expect(email.html).toContain('/home?workspace=');
  },
};
export const RemovedWithWorkspaceAccess: Story = { args: { access: 'current', change: 'removed' } };
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace, actorName: copy.stories.longActor, job: { ...defaults.job, title: copy.stories.longTitle } } };
export const MissingActor: Story = { args: { actorName: '' } };
export const EscapedContent: Story = { args: { workspaceName: copy.stories.escapedWorkspace, actorName: copy.stories.escapedActor, job: { ...defaults.job, title: copy.stories.escapedTitle } }, play: async ({ args }) => {
  const email = renderJobAssignmentChangedEmail(args); await expect(email.html).not.toContain('<script>'); await expect(email.html).not.toContain('<img src=x');
} };
export const PlainText: Story = { render: () => <main className="mx-auto grid w-full max-w-2xl gap-4 p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.textHeading}</h1><pre data-testid="plain-text-email" className="m-0 whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-ink wrap-anywhere">{renderJobAssignmentChangedEmail(defaults).text}</pre></main>, play: async ({ canvasElement }) => {
  const text = within(canvasElement).getByTestId('plain-text-email');
  await expect(text).toHaveTextContent(copy.stories.jobNumber); await expect(text).toHaveTextContent(copy.updates.primary);
} };
