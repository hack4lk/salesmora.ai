import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { renderTeamInvitationEmail, type TeamInvitationEmailInput } from './team-invitation';
import { teamInvitationEmailData as copy } from './team-invitation.data';
const defaults: TeamInvitationEmailInput = { url: copy.stories.url, inviterName: copy.stories.inviter, workspaceName: copy.stories.workspace, role: 'office' };
function EmailPreview(input: TeamInvitationEmailInput) {
  const email = renderTeamInvitationEmail(input, copy.stories.logoSrc);
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><dl className="mb-0 mt-4 text-sm"><dt className="text-muted">{copy.stories.subject}</dt><dd className="m-0 font-semibold text-ink wrap-anywhere">{email.subject}</dd></dl></header><iframe title={copy.stories.frame} srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas" /></main>;
}
const meta = { title: 'Email/TeamInvitation', component: EmailPreview, args: defaults, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const AdminField: Story = { args: { role: 'admin' }, play: async () => {
  const email = renderTeamInvitationEmail({ ...defaults, role: 'admin' });
  await expect(email.text).toContain(copy.access(copy.roles.admin));
} };
export const LongNamesAndLink: Story = { args: { inviterName: copy.stories.longInviter, workspaceName: copy.stories.longWorkspace, url: copy.stories.longUrl } };
export const EscapedNames: Story = { args: { inviterName: copy.stories.escapedInviter, workspaceName: copy.stories.escapedWorkspace }, play: async () => {
  const email = renderTeamInvitationEmail({ ...defaults, inviterName: copy.stories.escapedInviter, workspaceName: copy.stories.escapedWorkspace });
  await expect(email.html).not.toContain('<script>');
  await expect(email.html).toContain('&lt;script&gt;');
  await expect(email.text).toContain(copy.stories.escapedWorkspace);
} };
export const PlainText: Story = { render: () => <main className="mx-auto grid w-full max-w-2xl gap-4 p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.textHeading}</h1><pre data-testid="plain-text-email" className="m-0 whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-ink wrap-anywhere">{renderTeamInvitationEmail(defaults).text}</pre></main>, play: async ({ canvasElement }) => {
  const text = within(canvasElement).getByTestId('plain-text-email');
  await expect(text).toHaveTextContent(copy.expiry);
  await expect(text).toHaveTextContent(copy.stories.url);
  await expect(text).toHaveTextContent(copy.introduction(defaults.inviterName, defaults.workspaceName));
} };
export const Mobile: Story = { args: { inviterName: copy.stories.longInviter, workspaceName: copy.stories.longWorkspace, url: copy.stories.longUrl }, globals: { viewport: { value: 'phone', isRotated: false } } };
