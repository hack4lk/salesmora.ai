import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { renderJobCreatedEmail, type JobCreatedEmailInput } from './job-created';
import { jobCreatedEmailData as copy } from './job-created.data';
const defaults: JobCreatedEmailInput = {
  baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace, actorName: copy.stories.actor,
  job: { id: copy.stories.jobId, number: copy.stories.jobNumber, title: copy.stories.jobTitle },
};
function EmailPreview(input: JobCreatedEmailInput) {
  const email = renderJobCreatedEmail(input, copy.stories.logoSrc);
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><dl className="mb-0 mt-4 text-sm"><dt className="text-muted">{copy.stories.subject}</dt><dd className="m-0 font-semibold text-ink wrap-anywhere">{email.subject}</dd></dl></header><iframe title={copy.stories.frame} srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas"/></main>;
}
const meta = { title: 'Email/JobCreated', component: EmailPreview, args: defaults, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace, actorName: copy.stories.longActor, job: { ...defaults.job, title: copy.stories.longTitle } } };
export const MissingActor: Story = { args: { actorName: '' }, play: async ({ args }) => {
  await expect(renderJobCreatedEmail(args).text).toContain(copy.teammate);
} };
export const EscapedContent: Story = { args: { workspaceName: copy.stories.escapedWorkspace, actorName: copy.stories.escapedActor, job: { ...defaults.job, title: copy.stories.escapedTitle } }, play: async ({ args }) => {
  const email = renderJobCreatedEmail(args);
  await expect(email.html).not.toContain('<script>');
  await expect(email.html).not.toContain('<img src=x');
  await expect(email.html).toContain('&lt;script&gt;');
} };
export const PlainText: Story = { render: () => <main className="mx-auto grid w-full max-w-2xl gap-4 p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.textHeading}</h1><pre data-testid="plain-text-email" className="m-0 whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-ink wrap-anywhere">{renderJobCreatedEmail(defaults).text}</pre></main>, play: async ({ canvasElement }) => {
  const text = within(canvasElement).getByTestId('plain-text-email');
  await expect(text).toHaveTextContent(copy.stories.jobNumber);
  await expect(text).toHaveTextContent(copy.stories.actor);
  await expect(text).toHaveTextContent(copy.reason);
} };
