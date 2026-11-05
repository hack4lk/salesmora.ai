import { NextResponse } from 'next/server';
import { captureHeaders, captureRequest } from './http';
/** Preserve the shared session/origin/suspension boundary with Intake-specific safe copy. */
export async function intakeRequest(...args: Parameters<typeof captureRequest>) {
  const response = await captureRequest(...args);
  if (response.ok) return response;
  const body = await response.json();
  const error = response.status === 401 ? 'Sign in to access Intake Review.' : response.status === 404 || response.status === 423 ? 'This intake item or workspace is unavailable.' : response.status === 409 ? body.code === 'capacity' ? 'New-lead capacity is exhausted. This intake item remains available.' : 'This item, lead or review changed. Reload and review the current details.' : response.status === 422 ? 'Check the proposed details and reviewed decision.' : 'Intake Review could not be updated. Try again.';
  return NextResponse.json({ error, code: body.code ?? 'error' }, { status: response.status, headers: captureHeaders });
}
