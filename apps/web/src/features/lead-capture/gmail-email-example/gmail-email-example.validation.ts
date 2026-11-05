import { gmailEmailExampleData as copy } from './gmail-email-example.data';
export type GmailEmailExampleValue = { subject: string; body: string };
export function validateGmailEmailExample(value: GmailEmailExampleValue): Partial<Record<keyof GmailEmailExampleValue, string>> {
  return {
    ...(value.subject.length > 500 ? { subject: copy.errors.subject } : {}),
    ...(!value.body.trim() ? { body: copy.errors.body } : value.body.length > 20000 ? { body: copy.errors.length } : {}),
  };
}
