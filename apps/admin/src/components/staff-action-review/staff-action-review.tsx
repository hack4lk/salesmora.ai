'use client';

import { useEffect, useRef, useState } from 'react';
import { staffRoleCatalog, staffRolePermissions, type StaffRoleId, type StaffActionInput } from '@salesmora/contracts';
import { ConfirmDialog, PasswordField, TextField } from '@salesmora/ui';
import { staffActionReviewData as copy } from './staff-action-review.data';

export type StaffAccessAction =
  | { kind: 'invite'; email: string; role: StaffRoleId }
  | { kind: 'revoke'; email: string; role: StaffRoleId; invitationId: string }
  | { kind: 'approval'; email: string; role: 'super_admin'; requestId: string; requestedBy: { id: string; name: string }; expiresAt: string;
      accountChange?: { kind: 'enable' | 'role_change'; userId: string; currentRole: StaffRoleId } }
  | { kind: 'disable' | 'enable' | 'role_change'; email: string; userId: string; role: StaffRoleId;
      currentRole: StaffRoleId; active: boolean; activeSuperAdmins: number; expectedVersion?: number };

export type StaffReviewInput = {
  action: StaffActionInput['action'];
  reason: string;
  decision: StaffAccessDecision;
};

export type StaffVerificationResult = { ok: true } | { ok: false; message: string };
export type StaffSecondFactor = { method: 'passkey' } | { method: 'totp'; code: string };
export type StaffAccessDecision = 'approve' | 'reject';

export interface StaffActionReviewProps {
  action: StaffAccessAction;
  reviewer: { id: string; role: StaffRoleId };
  methods: readonly StaffSecondFactor['method'][];
  preview?: boolean;
  onVerifyPassword: (password: string, input: StaffReviewInput) => Promise<StaffVerificationResult>;
  onVerifyFactor: (factor: StaffSecondFactor) => Promise<StaffVerificationResult>;
  onConfirm: (input: { action: StaffAccessAction; reason: string; decision: StaffAccessDecision }) => Promise<StaffVerificationResult>;
  onClose: () => void;
}

const VERIFICATION_LIFETIME_MS = 5 * 60 * 1000;

/** Mount for one action; unmount on close so credentials and verification state are discarded. */
export function StaffActionReview({ action, reviewer, methods, preview = true, onVerifyPassword, onVerifyFactor, onConfirm, onClose }: StaffActionReviewProps) {
  const [stage, setStage] = useState<keyof typeof copy.stages>('review');
  const [reason, setReason] = useState('');
  const [decision, setDecision] = useState<StaffAccessDecision>('approve');
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState<StaffSecondFactor['method']>(methods.includes('passkey') ? 'passkey' : 'totp');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now);
  const [verifiedAt, setVerifiedAt] = useState<number | null>(null);
  const [passwordVerifiedAt, setPasswordVerifiedAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStage = useRef(stage);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previousStage.current !== stage) heading.current?.focus();
    previousStage.current = stage;
  }, [stage]);

  function eligibilityError(timestamp: number) {
    const permissions = staffRolePermissions[reviewer.role];
    const account = action.kind === 'disable' || action.kind === 'enable' || action.kind === 'role_change';
    const permission = action.kind === 'disable' || action.kind === 'enable' ? 'admin.staff.disable'
      : action.kind === 'role_change' || (action.kind === 'approval' && action.accountChange) ? 'admin.staff.role.change' : 'admin.staff.invite';
    if (!permissions.includes(permission) ||
      ((action.kind === 'approval' || (action.role === 'super_admin' && action.kind !== 'disable')) && !permissions.includes('admin.staff.super-admin.grant'))) {
      return copy.permissionDenied;
    }
    if (account) {
      if (action.userId === reviewer.id) return copy.selfChangeBlocked;
      if (action.kind !== 'enable' && action.active && action.currentRole === 'super_admin' && action.activeSuperAdmins <= 1 &&
        (action.kind === 'disable' || action.role !== 'super_admin')) return copy.lastAdminBlocked;
      if (action.kind === 'enable' ? action.active : !action.active) return copy.accountChanged;
      if (action.kind === 'role_change' && action.role === action.currentRole) return copy.sameRole;
    }
    if (action.kind === 'approval' && action.accountChange?.userId === reviewer.id) return copy.selfChangeBlocked;
    if (action.kind !== 'approval') return '';
    if (action.requestedBy.id === reviewer.id) return copy.ownRequest;
    const expiry = Date.parse(action.expiresAt);
    if (!Number.isFinite(expiry) || expiry <= timestamp) return copy.expired;
    return '';
  }

  const blocked = eligibilityError(now);
  const previousRole = 'currentRole' in action ? action.currentRole : action.kind === 'approval' ? action.accountChange?.currentRole : undefined;
  const verificationExpired = verifiedAt !== null && now - verifiedAt >= VERIFICATION_LIFETIME_MS;
  const challengeExpired = stage === 'factor' && passwordVerifiedAt !== null && now - passwordVerifiedAt >= VERIFICATION_LIFETIME_MS;
  const hasMethod = methods.includes(method);
  const disabled = Boolean(blocked) || !methods.length || challengeExpired ||
    (stage === 'review' && !reason.trim()) ||
    (stage === 'password' && !password) ||
    (stage === 'factor' && (!hasMethod || (method === 'totp' && !/^\d{6}$/.test(code)))) ||
    (stage === 'confirm' && (verifiedAt === null || verificationExpired));

  const confirmLabel = stage === 'confirm'
    ? action.kind === 'approval' ? action.accountChange && decision === 'approve' ? copy.buttons.approveAccount : copy.buttons[decision]
      : (action.kind === 'invite' || action.kind === 'enable' || action.kind === 'role_change') && action.role === 'super_admin'
        ? copy.buttons.requestApproval : copy.buttons[action.kind]
    : stage === 'factor' ? copy.buttons[method] : copy.buttons[stage];

  async function advance() {
    setError('');
    const ineligible = eligibilityError(Date.now());
    if (ineligible) { setError(ineligible); return; }
    if (stage === 'review') {
      if (reason.trim()) setStage('password');
      return;
    }
    if (stage === 'password') {
      if (!password) return;
      try {
        const boundAction = action.kind === 'invite' ? { kind: action.kind, email: action.email, role: action.role }
          : action.kind === 'revoke' ? { kind: action.kind, invitationId: action.invitationId }
            : action.kind === 'approval' ? { kind: action.kind, requestId: action.requestId }
              : action.kind === 'role_change'
                ? { kind: action.kind, userId: action.userId, role: action.role, expectedVersion: action.expectedVersion ?? 0 }
                : { kind: action.kind, userId: action.userId, expectedVersion: action.expectedVersion ?? 0 };
        const result = await onVerifyPassword(password, { action: boundAction, reason: reason.trim(), decision });
        if (!result.ok) { setError(result.message); return; }
        setPasswordVerifiedAt(Date.now());
        setStage('factor');
      } finally { setPassword(''); }
      return;
    }
    if (stage === 'factor') {
      if (!hasMethod || (method === 'totp' && !/^\d{6}$/.test(code))) return;
      if (passwordVerifiedAt === null || Date.now() - passwordVerifiedAt >= VERIFICATION_LIFETIME_MS) {
        setError(copy.challengeExpired);
        return;
      }
      try {
        const result = await onVerifyFactor(method === 'passkey' ? { method } : { method, code });
        if (!result.ok) { setError(result.message); return; }
        setVerifiedAt(passwordVerifiedAt);
        setStage('confirm');
      } finally { setCode(''); }
      return;
    }
    if (verifiedAt === null || Date.now() - verifiedAt >= VERIFICATION_LIFETIME_MS) {
      setError(copy.verificationExpired);
      return;
    }
    const result = await onConfirm({ action, reason: reason.trim(), decision });
    if (!result.ok) { setError(result.message); return; }
    onClose();
  }

  return <ConfirmDialog open title={copy.titles[action.kind]} description={copy.description}
    confirmLabel={confirmLabel} confirmDisabled={disabled} onConfirm={async () => {
      setBusy(true);
      try { await advance(); } finally { setBusy(false); }
    }} onClose={onClose}
    destructive={action.kind === 'revoke' || action.kind === 'disable' || (action.kind === 'approval' && decision === 'reject')}
    pendingLabel={copy.buttons.pending} error={error} initialFocus="content" printHidden>
    <fieldset disabled={busy} className="m-0 grid min-w-0 gap-5 border-0 p-0">
      <p role="note" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{preview ? copy.preview : copy.liveNotice}</p>
      <dl className="m-0 grid gap-3 text-sm">
        <div><dt className="text-muted">{copy.labels.email}</dt><dd className="m-0 font-semibold wrap-anywhere">{action.email}</dd></div>
        <div><dt className="text-muted">{copy.labels.role}</dt><dd className="m-0 font-semibold">{staffRoleCatalog[action.role].label}</dd></div>
        {previousRole && <div><dt className="text-muted">{copy.labels.currentRole}</dt><dd className="m-0 font-semibold">{staffRoleCatalog[previousRole].label}</dd></div>}
        {action.kind === 'approval' && <>
          <div><dt className="text-muted">{copy.labels.requester}</dt><dd className="m-0 font-semibold">{action.requestedBy.name}</dd></div>
          <div><dt className="text-muted">{copy.labels.expires}</dt><dd className="m-0"><time dateTime={action.expiresAt}>{action.expiresAt}</time></dd></div>
        </>}
      </dl>
      {action.kind === 'approval' && <p className="m-0 text-sm leading-6 text-muted">{action.accountChange ? copy.accountApprovalHint : copy.approvalHint}</p>}
      {action.kind === 'approval' && action.accountChange &&
        <p className="m-0 text-sm leading-6 text-muted">{copy.accountHints[action.accountChange.kind]}</p>}
      {(action.kind === 'disable' || action.kind === 'enable' || action.kind === 'role_change') &&
        <p className="m-0 text-sm leading-6 text-muted">{copy.accountHints[action.kind]}</p>}
      {blocked || !methods.length ? <p role="alert" className="m-0 rounded-xl border border-error p-4 text-sm text-error">{blocked || copy.noFactors}</p> : <>
        <h3 ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{copy.stages[stage]}</h3>
        {stage === 'review' && <>
          {action.kind === 'approval' && <fieldset className="m-0 grid gap-3 rounded-xl border border-line p-4">
            <legend className="px-1 text-sm font-semibold">{copy.labels.decision}</legend>
            {(['approve', 'reject'] as const).map(value => <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="radio" name="staff-approval-decision" value={value} checked={decision === value}
                onChange={() => setDecision(value)} className="size-4 focus-visible:focus-ring" />
              {value === 'approve' && action.accountChange ? copy.labels.approveAccount : copy.labels[value]}
            </label>)}
          </fieldset>}
          <TextField label={copy.labels.reason} required value={reason} onChange={event => setReason(event.target.value)}
            helperText={copy.reasonHint} autoComplete="off" slotProps={{ htmlInput: { maxLength: 1000 } }} />
        </>}
        {stage === 'password' && <PasswordField label={copy.labels.password} required autoComplete="current-password"
          value={password} onChange={event => setPassword(event.target.value)} helperText={copy.passwordHint} />}
        {stage === 'factor' && <>
          <fieldset className="m-0 grid gap-3 rounded-xl border border-line p-4">
            <legend className="px-1 text-sm font-semibold">{copy.labels.factor}</legend>
            {(['passkey', 'totp'] as const).filter(value => methods.includes(value)).map(value => <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="radio" name="staff-second-factor" value={value} checked={method === value}
                onChange={() => { setMethod(value); setCode(''); setError(''); }} className="size-4 focus-visible:focus-ring" />
              {copy.labels[value]}
            </label>)}
          </fieldset>
          {method === 'totp' && <TextField label={copy.labels.code} required value={code}
            onChange={event => setCode(event.target.value)} helperText={copy.codeHint} autoComplete="one-time-code"
            slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 } }} />}
          {method === 'passkey' && <p className="m-0 text-sm leading-6 text-muted">{preview ? copy.passkeyHint : copy.livePasskeyHint}</p>}
        </>}
        {stage === 'confirm' && <>
          <p className="m-0 text-sm leading-6 text-muted">{copy.finalHint}</p>
          <div><p className="m-0 text-sm font-semibold">{copy.labels.reason}</p><p className="m-0 text-sm leading-6 wrap-anywhere">{reason.trim()}</p></div>
          <p className="m-0 text-sm leading-6 text-muted">{action.kind === 'revoke' ? copy.revokeHint
            : action.kind === 'disable' || action.kind === 'enable' || action.kind === 'role_change'
              ? action.role === 'super_admin' && action.kind !== 'disable' ? copy.accountApprovalHint : copy.accountHints[action.kind]
            : action.kind === 'approval' && action.accountChange ? decision === 'reject' ? copy.accountRejectHint : copy.accountApprovalHint
            : action.kind === 'approval' && decision === 'reject' ? copy.rejectHint
              : action.kind === 'invite' && action.role === 'super_admin' ? copy.approvalHint : copy.deliveryHint}</p>
        </>}
        {(verificationExpired || challengeExpired) && <div>
          <p role="alert" className="m-0 text-sm text-error">{challengeExpired ? copy.challengeExpired : copy.verificationExpired}</p>
          <button type="button" onClick={() => { setVerifiedAt(null); setPasswordVerifiedAt(null); setError(''); setStage('password'); }}
            className="mt-3 min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 font-semibold focus-visible:focus-ring">{copy.verifyAgain}</button>
        </div>}
      </>}
    </fieldset>
  </ConfirmDialog>;
}
