import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { renderOwnershipTransferredEmail, type OwnershipTransferredEmailInput } from './ownership-transferred';
import { ownershipTransferredEmailData as copy } from './ownership-transferred.data';
const defaults: OwnershipTransferredEmailInput = { recipient: 'new_owner', workspaceName: copy.stories.workspace, newOwnerName: copy.stories.newOwnerName, previousOwnerName: copy.stories.previousOwnerName };
function EmailPreview(input: OwnershipTransferredEmailInput) {
  const email = renderOwnershipTransferredEmail(input, copy.stories.logoSrc);
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><dl className="mb-0 mt-4 text-sm"><dt className="text-muted">{copy.stories.subject}</dt><dd className="m-0 font-semibold text-ink wrap-anywhere">{email.subject}</dd></dl></header><iframe title={copy.stories.frame} srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas"/></main>;
}
function PlainTextPreview(input: OwnershipTransferredEmailInput) {
  return <main className="mx-auto grid w-full max-w-2xl gap-4 p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.textHeading}</h1><pre data-testid="plain-text-email" className="m-0 whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-ink wrap-anywhere">{renderOwnershipTransferredEmail(input).text}</pre></main>;
}
const meta = { title: 'Email/OwnershipTransferred', component: EmailPreview, args: defaults, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NewOwner: Story = {};
export const PreviousOwner: Story = { args: { recipient: 'previous_owner' } };
export const LongNames: Story = { args: { workspaceName: copy.stories.longWorkspace, newOwnerName: copy.stories.longName, previousOwnerName: copy.stories.longName } };
export const EscapedContent: Story = { args: { workspaceName: copy.stories.escapedWorkspace }, play: async () => {
  for (const recipient of ['new_owner', 'previous_owner'] as const) {
    const email = renderOwnershipTransferredEmail({ ...defaults, recipient, workspaceName: copy.stories.escapedWorkspace });
    await expect(email.html).not.toContain('<script>'); await expect(email.html).toContain('&lt;script&gt;');
  }
} };
export const NewOwnerPlainText: Story = { render: args => <PlainTextPreview {...args}/>, play: async ({ canvasElement }) => {
  const text = within(canvasElement).getByTestId('plain-text-email');
  await expect(text).toHaveTextContent(copy.stories.previousOwnerName); await expect(text).toHaveTextContent(copy.newOwner.detail);
} };
export const PreviousOwnerPlainText: Story = { args: { recipient: 'previous_owner' }, render: args => <PlainTextPreview {...args}/>, play: async ({ canvasElement }) => {
  const text = within(canvasElement).getByTestId('plain-text-email');
  await expect(text).toHaveTextContent(copy.stories.newOwnerName); await expect(text).toHaveTextContent(copy.previousOwner.detail);
} };
export const Mobile: Story = { ...LongNames, globals: { viewport: { value: 'phone', isRotated: false } } };
export const PreviousOwnerMobile: Story = { args: { ...LongNames.args, recipient: 'previous_owner' }, globals: { viewport: { value: 'phone', isRotated: false } } };
