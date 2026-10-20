import Link from 'next/link';
import { AccountLayout, FormFeedback } from '@salesmora/ui';
import { getSession } from '../../../server/auth/session';
import { EmailVerificationRoute } from '../../../features/auth/email-verification-notice/email-verification-route';
import { emailVerificationNoticeData as copy } from '../../../features/auth/email-verification-notice/email-verification-notice.data';
export const metadata = { title: copy.page.documentTitle, referrer: 'no-referrer' as const, robots: { index: false, follow: false } };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getSession();
  const { error } = await searchParams;
  return <AccountLayout title={copy.page.title} description={copy.page.description}>
    <div className="grid min-w-0 gap-6">
      {error && !session?.user.emailVerified && <FormFeedback kind="error" title={copy.page.errorTitle} message={copy.page.error} />}
      {session ? <EmailVerificationRoute email={session.user.email} verified={session.user.emailVerified} /> : <p className="m-0 text-sm leading-6 text-muted">{copy.page.signedOut}</p>}
      <Link href={session ? '/setup' : '/login'} className="rounded text-sm font-semibold text-primary underline focus-visible:focus-ring">{session ? copy.page.continue : copy.page.signIn}</Link>
    </div>
  </AccountLayout>;
}
