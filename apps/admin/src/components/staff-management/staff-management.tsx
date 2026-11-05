'use client';

import { useRef, useState } from 'react';
import { staffActionInputSchema, staffManagementSnapshotSchema, type StaffManagementSnapshot } from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { BrandProvider, FormFeedback } from '@salesmora/ui';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { StaffActionReview, type StaffAccessAction, type StaffVerificationResult } from '../staff-action-review/staff-action-review';
import { StaffManagementView } from './staff-management-view';
import { StaffAccountControls } from '../staff-account-controls/staff-account-controls';
import { staffManagementActionsData as copy } from './staff-management-actions.data';

export async function staffRequest(body?: unknown): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch('/api/admin/staff', {
      method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch { throw new Error(copy.requestFailed); }
  let value: unknown;
  try { value = await response.json(); } catch { throw new Error(copy.invalidResponse); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(copy.invalidResponse);
  const result = value as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : copy.requestFailed);
  return result;
}

function isOptions(value: unknown): value is PublicKeyCredentialRequestOptionsJSON {
  if (!value || typeof value !== 'object') return false;
  const options = value as Record<string, unknown>;
  return typeof options.challenge === 'string' && Array.isArray(options.allowCredentials) &&
    options.allowCredentials.every(key => key && typeof key === 'object' && typeof key.id === 'string' && key.type === 'public-key');
}

export function StaffManagement({ initialSnapshot }: { initialSnapshot: StaffManagementSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [action, setAction] = useState<StaffAccessAction | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [pendingDeliveryId, setPendingDeliveryId] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const verification = useRef<{ token: string; options: PublicKeyCredentialRequestOptionsJSON } | null>(null);
  const deliveryInFlight = useRef(false);
  const beginAction = (next: StaffAccessAction) => { verification.current = null; setFeedback(null); setAction(next); };

  async function refresh() {
    const result = staffManagementSnapshotSchema.safeParse(await staffRequest());
    if (!result.success) throw new Error(copy.invalidResponse);
    setSnapshot(result.data);
  }

  async function attempt(callback: () => Promise<void>): Promise<StaffVerificationResult> {
    try { await callback(); return { ok: true }; }
    catch (error) { return { ok: false, message: error instanceof Error ? error.message : copy.requestFailed }; }
  }

  return <BrandProvider>
    {feedback && <div className="mb-5"><FormFeedback kind={feedback.kind} message={feedback.message} /></div>}
    <button type="button" disabled={refreshing} className="mb-5 min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 font-semibold focus-visible:focus-ring"
      onClick={async () => {
        setRefreshing(true);
        const result = await attempt(refresh);
        setFeedback(result.ok ? { kind: 'success', message: copy.loaded } : { kind: 'error', message: result.message });
        setRefreshing(false);
      }}>{copy.refresh}</button>
    <StaffManagementView key={JSON.stringify(snapshot)}
      staff={snapshot.staff.map(member => ({
        ...member, status: member.role === null ? 'no_access' : 'active',
        lastActive: member.lastActive ?? copy.neverActive,
      }))}
      invitations={snapshot.invitations.map(invite => ({ ...invite, expires: invite.expiresAt }))}
      approvals={snapshot.approvals} pendingDeliveryId={pendingDeliveryId}
      onAction={beginAction}
      accountControls={<StaffAccountControls key={JSON.stringify(snapshot.staff)} preview={false} embedded reviewer={snapshot.reviewer}
        accounts={snapshot.staff.flatMap(member => member.role ? [{
          ...member, role: member.role, active: !member.disabled, lastActive: member.lastActive ?? copy.neverActive,
        }] : [])} onAction={beginAction} />}
      onRetryDelivery={async id => {
        if (deliveryInFlight.current) return;
        deliveryInFlight.current = true;
        setPendingDeliveryId(id);
        const result = await attempt(async () => {
          const response = await staffRequest({ operation: 'retry-delivery', invitationId: id });
          if (response.delivery !== 'sent') throw new Error(copy.deliveryFailed);
        });
        setFeedback(result.ok ? { kind: 'success', message: copy.retrySent } : { kind: 'error', message: result.message });
        const reload = await attempt(refresh);
        if (!reload.ok) setFeedback({ kind: 'error', message: copy.loadFailed });
        setPendingDeliveryId(undefined);
        deliveryInFlight.current = false;
      }} />
    {action && <StaffActionReview action={action} reviewer={snapshot.reviewer} methods={snapshot.methods} preview={false}
      onClose={() => { verification.current = null; setAction(null); }}
      onVerifyPassword={(password, input) => attempt(async () => {
        verification.current = null;
        const parsed = staffActionInputSchema.safeParse(input);
        if (!parsed.success) throw new Error(copy.invalidResponse);
        const result = await staffRequest({ operation: 'start', password, input: parsed.data });
        if (typeof result.token !== 'string' || !isOptions(result.options)) throw new Error(copy.invalidResponse);
        verification.current = { token: result.token, options: result.options };
      })}
      onVerifyFactor={factor => attempt(async () => {
        const state = verification.current;
        if (!state) throw new Error(copy.missingVerification);
        const response = factor.method === 'passkey'
          ? await staffRequest({ operation: 'factor', token: state.token, method: 'passkey', response: await getAdminPasskeyResponse(state.options) })
          : await staffRequest({ operation: 'factor', token: state.token, ...factor });
        if (response.verified !== true) throw new Error(copy.invalidResponse);
      })}
      onConfirm={() => attempt(async () => {
        const state = verification.current;
        if (!state) throw new Error(copy.missingVerification);
        let response;
        try {
          response = await staffRequest({ operation: 'commit', token: state.token });
        } catch (error) {
          // A lost response may follow a committed mutation; refresh rather than resubmitting it.
          verification.current = null;
          setAction(null);
          setFeedback({ kind: 'error', message: `${error instanceof Error ? error.message : copy.requestFailed} ${copy.deliveryPending}` });
          const reload = await attempt(refresh);
          if (!reload.ok) setFeedback({ kind: 'error', message: copy.loadFailed });
          return;
        }
        verification.current = null;
        const delivery = response.delivery;
        setFeedback(delivery === 'failed' ? { kind: 'error', message: copy.deliveryFailed }
          : { kind: 'success', message: response.event === 'staff.super_admin.approval_requested' ? copy.approvalRequested
            : response.event === 'staff.super_admin.rejected' ? copy.rejected
              : response.event === 'staff.account.disabled' ? copy.disabled
                : response.event === 'staff.account.enabled' ? copy.enabled
                  : response.event === 'staff.account.role_changed' ? copy.roleChanged
                    : response.event === 'staff.super_admin.approved' && action.kind === 'approval' && action.accountChange ? copy.accountApproved
              : response.event === 'staff.invitation.revoked' ? copy.revoked : copy.invitationSent });
        const reload = await attempt(refresh);
        if (!reload.ok) setFeedback({ kind: 'error', message: copy.loadFailed });
      })} />}
  </BrandProvider>;
}
