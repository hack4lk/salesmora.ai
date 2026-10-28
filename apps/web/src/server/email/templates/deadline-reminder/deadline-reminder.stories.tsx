import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { renderDeadlineReminderEmail, type DeadlineReminderEmailInput } from './deadline-reminder';
import { deadlineReminderEmailData as copy } from './deadline-reminder.data';

const defaults: DeadlineReminderEmailInput = {
  baseURL: copy.stories.baseURL, workspaceId: copy.stories.workspaceId, workspaceName: copy.stories.workspace,
  job: { id: copy.stories.jobId, number: copy.stories.jobNumber, title: copy.stories.jobTitle },
  completionDeadline: copy.stories.deadline, reminderDate: copy.stories.reminderDate, timezone: copy.stories.timezone,
};
function EmailPreview(input: DeadlineReminderEmailInput) {
  const email = renderDeadlineReminderEmail(input, copy.stories.logoSrc);
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><dl className="mb-0 mt-4 text-sm"><dt className="text-muted">{copy.stories.subject}</dt><dd className="m-0 font-semibold text-ink wrap-anywhere">{email.subject}</dd></dl></header><iframe title={copy.stories.frame} srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas"/></main>;
}
const meta = { title: 'Email/DeadlineReminder', component: EmailPreview, args: defaults, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const DueToday: Story = { args: { reminderDate: copy.stories.dueDate }, play: async ({ args }) => {
  await expect(renderDeadlineReminderEmail(args).text).toContain(copy.headings.due);
} };
export const Overdue: Story = { args: { reminderDate: copy.stories.overdueDate }, play: async ({ args }) => {
  await expect(renderDeadlineReminderEmail(args).text).toContain(copy.timing(-3));
} };
export const OneDayBefore: Story = { args: { reminderDate: copy.stories.oneDayBefore } };
export const OneDayOverdue: Story = { args: { reminderDate: copy.stories.oneDayAfter } };
export const LongContent: Story = { args: { workspaceName: copy.stories.longWorkspace, job: { ...defaults.job, title: copy.stories.longTitle } } };
export const EscapedContent: Story = { args: { workspaceName: copy.stories.escapedWorkspace, job: { ...defaults.job, title: copy.stories.escapedTitle } }, play: async ({ args }) => {
  const email = renderDeadlineReminderEmail(args);
  await expect(email.html).not.toContain('<script>');
  await expect(email.html).not.toContain('<img src=x');
  await expect(email.html).toContain('&lt;script&gt;');
} };
export const PlainText: Story = { render: () => <main className="mx-auto grid w-full max-w-2xl gap-4 p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.textHeading}</h1><pre data-testid="plain-text-email" className="m-0 whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-ink wrap-anywhere">{renderDeadlineReminderEmail(defaults).text}</pre></main>, play: async ({ canvasElement }) => {
  const text = within(canvasElement).getByTestId('plain-text-email');
  await expect(text).toHaveTextContent(copy.stories.jobNumber);
  await expect(text).toHaveTextContent(copy.stories.timezone);
  await expect(text).toHaveTextContent(copy.explanation);
} };
