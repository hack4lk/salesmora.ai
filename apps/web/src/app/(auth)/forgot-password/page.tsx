import { PasswordRecoveryRoute } from '../../../features/auth/password-recovery-screen/password-recovery-route';
import { passwordRecoveryScreenData as copy } from '../../../features/auth/password-recovery-screen/password-recovery-screen.data';

export const metadata = { title: copy.documentTitle, robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <PasswordRecoveryRoute />;
}
