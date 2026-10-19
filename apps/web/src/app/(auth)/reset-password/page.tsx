import { ResetPasswordRoute } from '../../../features/auth/reset-password-screen/reset-password-route';
import { resetPasswordScreenData as copy } from '../../../features/auth/reset-password-screen/reset-password-screen.data';

export const metadata = { title: copy.documentTitle, robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const token = !query.error && typeof query.token === 'string' && /^[a-zA-Z0-9]{24}$/.test(query.token) ? query.token : undefined;
  return <ResetPasswordRoute token={token} />;
}
