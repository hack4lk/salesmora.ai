import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { renderEmailVerificationEmail } from './email-verification';
import { emailVerificationEmailData as copy } from './email-verification.data';
function EmailPreview({ url = copy.stories.url }: { url?: string }) {
  const email = renderEmailVerificationEmail(url, copy.stories.logoSrc);
  return <main className="mx-auto grid w-full max-w-2xl gap-6 p-4 sm:p-8"><header><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.title}</h1><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.stories.notice}</p><dl className="mb-0 mt-4 text-sm"><dt className="text-muted">{copy.stories.subject}</dt><dd className="m-0 font-semibold text-ink">{email.subject}</dd></dl></header><iframe title={copy.stories.frame} srcDoc={email.html} sandbox="allow-same-origin" className="min-h-screen w-full rounded-xl border border-line bg-canvas" /></main>;
}
const meta = { title: 'Email/EmailVerification', component: EmailPreview, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof EmailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongLink: Story = { args: { url: copy.stories.longUrl } };
export const EscapedLink: Story = { args: { url: copy.stories.escapedUrl }, play: async () => {
  const email = renderEmailVerificationEmail(copy.stories.escapedUrl);
  await expect(email.html).not.toContain('<script>');
  await expect(email.html).toContain('&amp;callbackURL=');
} };
export const PlainText: Story = { render: () => <main className="mx-auto grid w-full max-w-2xl gap-4 p-4 sm:p-8"><h1 className="m-0 text-heading font-semibold text-ink">{copy.stories.textHeading}</h1><pre data-testid="plain-text-email" className="m-0 whitespace-pre-wrap rounded-xl border border-line bg-paper p-4 text-sm leading-6 text-ink wrap-anywhere">{renderEmailVerificationEmail(copy.stories.url).text}</pre></main>, play: async ({ canvasElement }) => {
  const text = within(canvasElement).getByTestId('plain-text-email');
  await expect(text).toHaveTextContent(copy.expiry);
  await expect(text).toHaveTextContent(copy.stories.url);
  await expect(text).toHaveTextContent(copy.ignore);
} };
export const Mobile: Story = { args: { url: copy.stories.longUrl }, globals: { viewport: { value: 'phone', isRotated: false } } };
