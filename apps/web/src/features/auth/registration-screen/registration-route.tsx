'use client';

import type { WorkspacePlanId } from '@salesmora/contracts';
import { RegistrationPlanScreen } from '../registration-plan-screen/registration-plan-screen';
import { RegistrationScreen } from './registration-screen';
import { registrationScreenData as copy } from './registration-screen.data';
import type { RegistrationSubmission } from '../registration-form/registration-form.validation';
import type { RegistrationResult } from '../registration-form/registration-form';

async function register(values: RegistrationSubmission, plan?: WorkspacePlanId): Promise<RegistrationResult> {
  const response = await fetch('/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ ...values, ...(plan ? { plan } : {}) }),
  });
  if (!response.ok) return { ok: false, message: response.status === 429 ? copy.errors.rateLimited : copy.errors.unavailable };
  window.location.assign('/setup');
  return { ok: true };
}

export function RegistrationRoute({ billingEnabled = false }: { billingEnabled?: boolean }) {
  if (billingEnabled) return <RegistrationPlanScreen onSubmit={register} notice={copy.sandboxNotice} />;
  return <RegistrationScreen onSubmit={register} notice={copy.localNotice} />;
}
