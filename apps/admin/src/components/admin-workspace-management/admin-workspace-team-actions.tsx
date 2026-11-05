'use client';

import type { AdminWorkspaceDetailResponse } from '@salesmora/contracts';
import { adminWorkspaceTeamActionResultSchema } from '@salesmora/contracts';
import { ConfirmDialog, TextField } from '@salesmora/ui';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { AdminWorkspaceDetailView } from './admin-workspace-detail';
import { adminWorkspaceTeamActionsCopy as copy } from './admin-workspace-team-actions-copy.data';

type Member = AdminWorkspaceDetailResponse['members'][number];
type Action = 'remove' | 'resend_invitation';

async function requestTeamAction(workspaceId: string, input: unknown): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/team-actions`, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('Workspace member actions are unavailable. Try again.');
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new Error('The workspace member-action response was invalid.'); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : 'The workspace member action could not be completed. Refresh the workspace before retrying.';
    throw new Error(message);
  }
  return result;
}

export function AdminWorkspaceTeamActions({
  detail,
  onBack,
  onComplete,
  workspaceActions,
  workspaceBillingSection,
}: {
  detail: AdminWorkspaceDetailResponse;
  onBack: () => void;
  onComplete: () => void;
  workspaceActions?: ReactNode;
  workspaceBillingSection?: ReactNode;
}) {
  const [target, setTarget] = useState<Member | null>(null);
  const [action, setAction] = useState<Action>('remove');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState('');
  const deleting = detail.workspace.status === 'deleting';
  const canRemove = detail.permissions?.canRemoveMembers === true;
  const canResend = detail.permissions?.canResendInvitations === true;

  function close() {
    setTarget(null);
    setReason('');
    setError('');
  }

  function begin(nextAction: Action, member: Member) {
    setAction(nextAction);
    setTarget(member);
    setReason('');
    setError('');
    setSuccess('');
  }

  async function confirm() {
    if (!target) return;
    setError('');
    setPending(true);
    try {
      const input = action === 'remove'
        ? { action, workspaceId: detail.workspace.id, userId: target.userId, reason: reason.trim() }
        : { action, workspaceId: detail.workspace.id, invitationId: target.invitationId, reason: reason.trim() };
      const result = adminWorkspaceTeamActionResultSchema.safeParse(
        await requestTeamAction(detail.workspace.id, input),
      );
      if (!result.success || result.data.action !== action) {
        throw new Error('The workspace member-action response was invalid.');
      }
      if (result.data.action === 'remove') {
        setSuccess(copy.removed(target.name, result.data.unassignedLeads));
      } else {
        setSuccess(result.data.delivery === 'sent' ? copy.sent(target.maskedEmail) : copy.failed);
      }
      close();
      onComplete();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The workspace member action could not be completed.');
    } finally {
      setPending(false);
    }
  }

  function memberActions(member: Member) {
    if (deleting) return null;
    if (member.status === 'Invited') {
      if (!canResend || !member.invitationId) return null;
      return (
        <button type="button" onClick={() => begin('resend_invitation', member)}
          className="min-h-9 cursor-pointer rounded-lg border border-line bg-paper px-3 text-xs font-semibold text-ink focus-visible:focus-ring">
          {copy.resend}
        </button>
      );
    }
    if (!canRemove || member.role === 'Owner' || !member.userId) return null;
    return (
      <button type="button" onClick={() => begin('remove', member)}
        className="min-h-9 cursor-pointer rounded-lg border border-error bg-paper px-3 text-xs font-semibold text-error focus-visible:focus-ring">
        {copy.remove}
      </button>
    );
  }

  return (
    <>
      <AdminWorkspaceDetailView
        detail={detail}
        preview={false}
        onBack={onBack}
        memberActions={memberActions}
        workspaceBillingSection={workspaceBillingSection}
        workspaceManagementAction={
          <div className="grid gap-4">
            <section className="grid gap-3 rounded-xl border border-line bg-paper p-4 text-ink" aria-labelledby="workspace-team-actions-title">
              <div className="grid gap-1">
                <h2 className="m-0 text-base font-semibold" id="workspace-team-actions-title">{copy.actionTitle}</h2>
                <p className="m-0 text-sm text-muted">{copy.actionDescription}</p>
              </div>
              <p className="m-0 text-sm text-muted" role="note">{copy.auditNote}</p>
              {success && <p className="m-0 text-sm text-muted" role="status">{success}</p>}
              {!canRemove && !canResend && <p className="m-0 text-sm text-muted" role="note">{copy.denied}</p>}
              {deleting && <p className="m-0 text-sm text-muted" role="note">{copy.deletionPending}</p>}
            </section>
            {workspaceActions}
          </div>
        }
      />
      {target && <ConfirmDialog
        open
        title={action === 'remove' ? copy.removeTitle : copy.resendTitle}
        description={action === 'remove'
          ? copy.removeDescription(target.name, detail.workspace.name)
          : copy.resendDescription(target.maskedEmail, detail.workspace.name)}
        confirmLabel={action === 'remove' ? copy.removeConfirm : copy.resendConfirm}
        confirmDisabled={pending || reason.trim().length < 10 || reason.trim().length > 500}
        pending={pending}
        pendingLabel={copy.pending}
        error={error}
        destructive={action === 'remove'}
        onConfirm={confirm}
        onClose={close}
        initialFocus="content"
        printHidden
      >
        <div className="grid gap-4">
          <TextField
            label={copy.reason}
            required
            value={reason}
            onChange={event => {
              setReason(event.target.value);
              setError('');
            }}
            helperText={copy.reasonHint}
            autoComplete="off"
            slotProps={{ htmlInput: { minLength: 10, maxLength: 500 } }}
          />
        </div>
      </ConfirmDialog>}
    </>
  );
}
