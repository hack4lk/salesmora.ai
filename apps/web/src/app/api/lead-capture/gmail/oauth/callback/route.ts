import { NextResponse } from 'next/server';
import { completeCaptureGmailConnection, captureGmailCallbackSource } from '@salesmora/data/lead-capture/gmail-connections';
import { getSession } from '../../../../../../server/auth/session';
import { captureHeaders } from '../../../../../../server/lead-capture/http';
import { gmailConnectionProvider } from '../../../../../../server/lead-capture/gmail';
import { database } from '../../../../../../server/workspaces/store';
import { enabledPermissions } from '../../../../../../server/authorization/permissions';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const origin = new URL(process.env.BETTER_AUTH_URL ?? 'http://localhost:3000').origin;
  let destination = new URL('/lead-capture?gmail=failed', origin);
  try {
    const session = await getSession(); if (!session) return NextResponse.redirect(new URL('/login', origin), { status: 303, headers: { ...captureHeaders, 'Referrer-Policy': 'no-referrer' } });
    const params = new URL(request.url).searchParams;
    if (request.url.length > 16000 || [...params.keys()].some(key => params.getAll(key).length !== 1)) throw Error();
    const state = params.get('state') ?? '', { config, provider } = gmailConnectionProvider();
    const target = await captureGmailCallbackSource(database(), session.user.id, enabledPermissions, session.session.id, state, config);
    destination = new URL(`/lead-capture/${target.sourceId}/setup`, config.origin);
    destination.search = new URLSearchParams({ workspace: target.workspaceId, step: 'intake', panel: 'account', gmail: 'failed' }).toString();
    const result = await completeCaptureGmailConnection(database(), session.user.id, enabledPermissions, session.session.id, { state, code: params.get('code') ?? undefined, denied: params.has('error') }, config, provider);
    destination.searchParams.set('gmail', result.connected ? 'connected' : 'cancelled');
  } catch { /* No provider errors, codes, tokens or callback parameters are logged or reflected. */ }
  return NextResponse.redirect(destination, { status: 303, headers: { ...captureHeaders, 'Referrer-Policy': 'no-referrer' } });
}
