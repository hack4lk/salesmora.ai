import { registrationPolicy } from '@salesmora/contracts';
import { resetPasswordFormData as copy } from './reset-password-form.data';

export interface ResetPasswordValues { password: string; confirmation: string }
export type ResetPasswordErrors = Partial<Record<keyof ResetPasswordValues, string>>;
export function validateResetPassword(values: ResetPasswordValues): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {};
  if (values.password.length < registrationPolicy.passwordMinimum || values.password.length > registrationPolicy.passwordMaximum) errors.password = copy.errors.password;
  if (!values.confirmation || values.confirmation !== values.password) errors.confirmation = copy.errors.confirmation;
  return errors;
}
