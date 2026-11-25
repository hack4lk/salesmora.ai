import { PasswordRecoveryRoute } from '../../../features/auth/password-recovery-screen/password-recovery-route';
import { passwordRecoveryScreenData as copy } from '../../../features/auth/password-recovery-screen/password-recovery-screen.data';
import { PublicAuthPage } from '../../../features/public-site/public-auth-page/public-auth-page';

export const metadata = { title: copy.documentTitle, robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <PublicAuthPage><PasswordRecoveryRoute /></PublicAuthPage>;
}
