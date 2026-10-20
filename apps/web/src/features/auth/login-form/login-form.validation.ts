import { loginFormData as copy } from './login-form.data';

export interface LoginSubmission {
  email: string;
  password: string;
}
export type LoginErrors = Partial<Record<keyof LoginSubmission, string>>;

/** Sign-in checks presence, without imposing registration rules on existing passwords. */
export function validateLogin(values: LoginSubmission): LoginErrors {
  const errors: LoginErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = copy.errors.email;
  if (!values.password) errors.password = copy.errors.password;
  return errors;
}
