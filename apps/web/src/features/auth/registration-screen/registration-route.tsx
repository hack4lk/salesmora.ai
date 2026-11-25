'use client';

import { workspacePlanIdSchema, type WorkspacePlanId } from '@salesmora/contracts';
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

export function RegistrationRoute({ billingEnabled = false, initialPlanQuery }: { billingEnabled?: boolean; initialPlanQuery?: string | string[] }) {
  if (billingEnabled) {
    const parsed = workspacePlanIdSchema.safeParse(initialPlanQuery);
    return <RegistrationPlanScreen layoutVariant="public" onSubmit={register} notice={copy.sandboxNotice} initialPlan={parsed.success ? parsed.data : undefined} initialStage={parsed.success ? 'account' : 'plan'} invalidInitialPlan={initialPlanQuery !== undefined && !parsed.success} />;
  }
  return <RegistrationScreen layoutVariant="public" onSubmit={register} notice={copy.localNotice} />;
}
