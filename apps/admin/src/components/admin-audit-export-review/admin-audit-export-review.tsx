'use client';

import { useEffect, useRef, useState } from 'react';
import { staffRolePermissions, type AuditExportSnapshot, type StaffRoleId } from '@salesmora/contracts';
import { ConfirmDialog, PasswordField, TextField } from '@salesmora/ui';
import type { StaffSecondFactor, StaffVerificationResult } from '../staff-action-review/staff-action-review';
import { adminAuditViewerData as viewerCopy } from '../admin-audit-viewer/admin-audit-viewer.data';
import { adminAuditExportReviewData as copy } from './admin-audit-export-review.data';

export type { AuditExportSnapshot } from '@salesmora/contracts';
export type AuditExportReviewInput = { snapshot: AuditExportSnapshot; reason: string };
export interface AdminAuditExportReviewProps {
  snapshot: AuditExportSnapshot;
  reviewerRole: StaffRoleId;
  methods: readonly StaffSecondFactor['method'][];
  preview?: boolean;
  onVerifyPassword: (password: string, input: AuditExportReviewInput) => Promise<StaffVerificationResult>;
  onVerifyFactor: (factor: StaffSecondFactor) => Promise<StaffVerificationResult>;
  onConfirm: (input: AuditExportReviewInput) => Promise<StaffVerificationResult>;
  onClose: () => void;
}

const verificationLifetime = 5 * 60 * 1000;
const snapshotKey = ({ filters, count, asOf, throughSequence }: AuditExportSnapshot) =>
  JSON.stringify([filters.query, filters.actor, filters.category, filters.range, count, asOf, throughSequence]);

/** Mount for one snapshot; unmount on close to discard credentials and verification. */
export function AdminAuditExportReview({ snapshot, reviewerRole, methods, preview = true, onVerifyPassword, onVerifyFactor, onConfirm, onClose }: AdminAuditExportReviewProps) {
  const [scope] = useState(() => ({ ...snapshot, filters: { ...snapshot.filters } }));
  const [stage, setStage] = useState<keyof typeof copy.stages>('review');
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [method, setMethod] = useState<StaffSecondFactor['method']>(methods.includes('passkey') ? 'passkey' : 'totp');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);
  const [error, setError] = useState('');
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

  const blocked = !staffRolePermissions[reviewerRole].includes('admin.audit.export') ? copy.denied
    : snapshotKey(snapshot) !== snapshotKey(scope) ? copy.changed
      : !Number.isSafeInteger(scope.count) || scope.count < 0 || !Number.isFinite(Date.parse(scope.asOf)) ||
        !/^(0|[1-9]\d{0,18})$/.test(scope.throughSequence) ? copy.invalid
        : scope.count > 50_000 ? copy.limit : scope.count === 0 ? copy.empty : !methods.length ? copy.noFactors : '';
  const expiredAt = (time: number) => startedAt !== null && time - startedAt >= verificationLifetime;
  const expired = expiredAt(now);
  const disabled = Boolean(blocked) || expired ||
    (stage === 'review' && (!reason.trim() || reason.trim().length > 1000)) ||
    (stage === 'password' && !password) ||
    (stage === 'factor' && (!methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code))));
  const input = { snapshot: scope, reason: reason.trim() };

  async function advance() {
    setError('');
    if (blocked || disabled) return;
    if (expiredAt(Date.now())) { setNow(Date.now()); setError(copy.expired); return; }
    if (stage === 'review') { setStage('password'); return; }
    if (stage === 'password') {
      const timestamp = Date.now();
      try {
        const result = await onVerifyPassword(password, input);
        if (!result.ok) { setError(result.message); return; }
        setStartedAt(timestamp);
        setStage('factor');
      } finally { setPassword(''); }
      return;
    }
    if (stage === 'factor') {
      try {
        const result = await onVerifyFactor(method === 'passkey' ? { method } : { method, code });
        if (!result.ok) { setError(result.message); return; }
        if (expiredAt(Date.now())) { setNow(Date.now()); setError(copy.expired); return; }
        setStage('confirm');
      } finally { setCode(''); }
      return;
    }
    const result = await onConfirm(input);
    if (!result.ok) { setError(result.message); return; }
    onClose();
  }

  const rows = [
    [copy.labels.count, scope.count.toLocaleString('en-US')],
    [copy.labels.search, scope.filters.query || copy.labels.allSearch],
    [copy.labels.actor, scope.filters.actor || copy.labels.allActors],
    [copy.labels.category, viewerCopy.categories[scope.filters.category]],
    [copy.labels.range, viewerCopy.ranges[scope.filters.range]],
    [copy.labels.snapshot, scope.asOf],
    [copy.labels.sequence, scope.throughSequence],
  ];

  return <ConfirmDialog open title={copy.title} description={copy.description} initialFocus="content" printHidden
    confirmLabel={preview ? stage === 'factor' ? copy.buttons[method] : copy.buttons[stage]
      : stage === 'factor' ? copy.liveButtons[method] : stage === 'confirm' ? copy.liveButtons.confirm : copy.buttons[stage]}
    confirmDisabled={disabled} pendingLabel={copy.buttons.pending} error={error}
    onConfirm={async () => { setBusy(true); try { await advance(); } finally { setBusy(false); } }} onClose={onClose}>
    <fieldset disabled={busy} className="m-0 grid min-w-0 gap-5 border-0 p-0">
      <p role="note" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6">{preview ? copy.preview : copy.liveNotice}</p>
      <dl className="m-0 grid gap-3 text-sm">{rows.map(([label, value]) => <div key={label}>
        <dt className="text-muted">{label}</dt><dd className="m-0 font-semibold wrap-anywhere">{value}</dd>
      </div>)}</dl>
      <p className="m-0 text-sm leading-6 text-muted">{preview ? copy.scope : copy.liveScope}</p>
      <p className="m-0 text-sm leading-6 text-muted">{copy.sensitive}</p>
      {blocked ? <p role="alert" className="m-0 rounded-xl border border-error p-4 text-sm text-error">{blocked}</p> : <>
        <h3 ref={heading} tabIndex={-1} className="m-0 text-lg font-semibold focus-visible:focus-ring">{copy.stages[stage]}</h3>
        {stage === 'review' && <TextField label={copy.labels.reason} required value={reason} autoComplete="off"
          onChange={event => setReason(event.target.value)} helperText={copy.reasonHint} slotProps={{ htmlInput: { maxLength: 1000 } }} />}
        {stage === 'password' && <PasswordField label={copy.labels.password} required autoComplete="current-password"
          value={password} onChange={event => setPassword(event.target.value)} helperText={copy.passwordHint} />}
        {stage === 'factor' && <>
          <fieldset className="m-0 grid gap-3 rounded-xl border border-line p-4">
            <legend className="px-1 text-sm font-semibold">{copy.labels.factor}</legend>
            {(['passkey', 'totp'] as const).filter(value => methods.includes(value)).map(value => <label key={value}
              className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="radio" name="audit-export-factor" checked={method === value} onChange={() => { setMethod(value); setCode(''); setError(''); }}
                className="size-4 focus-visible:focus-ring" />{copy.labels[value]}
            </label>)}
          </fieldset>
          {method === 'passkey' ? <p className="m-0 text-sm leading-6 text-muted">{preview ? copy.passkeyHint : copy.livePasskeyHint}</p>
            : <TextField label={copy.labels.code} required value={code} autoComplete="one-time-code"
              onChange={event => setCode(event.target.value)} helperText={copy.codeHint}
              slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 } }} />}
        </>}
        {stage === 'confirm' && <>
          <p className="m-0 text-sm leading-6 text-muted">{preview ? copy.finalHint : copy.liveFinalHint}</p>
          <div><p className="m-0 text-sm font-semibold">{copy.labels.reason}</p><p className="m-0 text-sm leading-6 wrap-anywhere">{reason.trim()}</p></div>
        </>}
        {expired && <div>
          <p role="alert" className="m-0 text-sm text-error">{copy.expired}</p>
          <button type="button" className="mt-3 min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 font-semibold focus-visible:focus-ring"
            onClick={() => { setStartedAt(null); setPassword(''); setCode(''); setError(''); setStage('password'); }}>{copy.verifyAgain}</button>
        </div>}
      </>}
    </fieldset>
  </ConfirmDialog>;
}
