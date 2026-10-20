import { registrationFormData as copy } from './registration-form.data';
import { registrationSchema } from '@salesmora/contracts';

export interface RegistrationValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}
export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>;
export type RegistrationSubmission = Omit<RegistrationValues, 'confirmPassword'>;

/** Client checks share the server contract; confirmation stays local. */
export function validateRegistration(values: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const result = registrationSchema.safeParse(values);
  if (!result.success) for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RegistrationErrors;
    if (field === 'name' || field === 'email' || field === 'password') errors[field] = copy.errors[field];
  }
  if (!values.confirmPassword || values.confirmPassword !== values.password) errors.confirmPassword = copy.errors.confirmPassword;
  if (!values.termsAccepted) errors.termsAccepted = copy.errors.termsAccepted;
  return errors;
}
