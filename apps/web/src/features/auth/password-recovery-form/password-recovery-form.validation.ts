import { passwordRecoveryFormData as copy } from './password-recovery-form.data';

export interface PasswordRecoverySubmission { email: string }

/** UI checks only; the recovery endpoint will validate independently. */
export function validateRecoveryEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (trimmed.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return copy.errors.email;
}
