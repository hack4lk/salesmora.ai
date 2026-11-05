import 'server-only';
import { NextResponse } from 'next/server';
import { WorkspaceSuspendedError } from '@salesmora/data';

export const workspaceSuspendedMessage = 'This workspace is unavailable. Contact SalesMora support.';

export function isWorkspaceSuspended(error: unknown): error is WorkspaceSuspendedError {
  return error instanceof WorkspaceSuspendedError;
}

/**
 * 423 for any API call into a staff-suspended workspace. Checked before the generic access mapping
 * because `WorkspaceSuspendedError` extends `AuthorizationAccessError`. Never includes the reason.
 */
export function workspaceSuspendedResponse() {
  return NextResponse.json(
    { error: workspaceSuspendedMessage, code: 'workspace_suspended' },
    { status: 423, headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } },
  );
}
