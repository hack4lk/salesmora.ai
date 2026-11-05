'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminFeatureFlagOperationSchema,
  adminFeatureFlagResultSchema,
  adminFeatureFlagStartResponseSchema,
  type AdminFeatureFlagId,
  type AdminFeatureFlagResponse,
  type AdminFeatureFlagTarget,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import styles from './admin-feature-flags-page.module.css';

type VerificationState = { token: string; options: PublicKeyCredentialRequestOptionsJSON };
type TargetType = AdminFeatureFlagTarget['type'];
type ChangeValue = 'enabled' | 'disabled' | 'inherit';

class FeatureFlagsRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestFlags(body: unknown) {
  let response: Response;
  try {
    response = await fetch('/api/admin/flags', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new FeatureFlagsRequestError('Feature flag settings are unavailable. Try again.', 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new FeatureFlagsRequestError('The feature flag response was invalid.', response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : 'The feature flag could not be changed. Refresh and try again.';
    throw new FeatureFlagsRequestError(message, response.status);
  }
  return result;
}

function targetCaption(target: AdminFeatureFlagTarget) {
  if (target.type === 'global') return 'Global';
  return target.type === 'plan' ? `Plan · ${target.planId}` : `Workspace · ${target.workspaceId}`;
}

function dateCaption(value: string | null) {
  return value ? new Date(value).toLocaleString() : 'No expiry';
}

export function AdminFeatureFlagsPage({ flags }: { flags: AdminFeatureFlagResponse }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminFeatureFlagId | null>(null);
  const [targetType, setTargetType] = useState<TargetType>('global');
  const [targetId, setTargetId] = useState('');
  const [changeValue, setChangeValue] = useState<ChangeValue>('enabled');
  const [expiresAt, setExpiresAt] = useState('');
  const [reason, setReason] = useState('');
  const [method, setMethod] = useState<'passkey' | 'totp'>(flags.methods.includes('passkey') ? 'passkey' : 'totp');
  const [code, setCode] = useState('');
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const [stage, setStage] = useState<'review' | 'verification'>('review');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedFlag = flags.flags.find(flag => flag.id === editing);
  const disabled = pending || !flags.methods.includes(method) ||
    (stage === 'review' && (
      reason.trim().length < 10 || reason.trim().length > 500 ||
      (targetType !== 'global' && !targetId.trim())
    )) ||
    (stage === 'verification' && method === 'totp' && !/^\d{6}$/.test(code.trim()));

  function beginEdit(flagId: AdminFeatureFlagId) {
    setEditing(flagId);
    setTargetType('global');
    setTargetId('');
    setChangeValue('enabled');
    setExpiresAt('');
    setReason('');
    setCode('');
    setError('');
    setSuccess('');
    setVerification(null);
    setStage('review');
  }

  function closeEditor() {
    setEditing(null);
    setVerification(null);
    setStage('review');
    setCode('');
    setError('');
  }

  function buildTarget(): AdminFeatureFlagTarget {
    if (targetType === 'global') return { type: 'global' };
    if (targetType === 'plan') {
      if (!['free', 'standard', 'premium'].includes(targetId)) throw new FeatureFlagsRequestError('Choose Free, Standard, or Premium.', 400);
      return { type: 'plan', planId: targetId as 'free' | 'standard' | 'premium' };
    }
    return { type: 'workspace', workspaceId: targetId.trim() };
  }

  async function submit() {
    setError('');
    setPending(true);
    try {
      if (stage === 'review') {
        if (!selectedFlag) throw new FeatureFlagsRequestError('Choose a feature flag before continuing.', 400);
        const target = buildTarget();
        const parsed = adminFeatureFlagOperationSchema.safeParse({
          operation: 'start',
          flagId: selectedFlag.id,
          target,
          enabled: changeValue === 'inherit' ? null : changeValue === 'enabled',
          expiresAt: changeValue === 'inherit' || !expiresAt ? null : new Date(expiresAt).toISOString(),
          reason: reason.trim(),
        });
        if (!parsed.success || parsed.data.operation !== 'start') {
          throw new FeatureFlagsRequestError('Enter a valid target, expiry, and reason of 10–500 characters.', 400);
        }
        if (!flags.methods.length) throw new FeatureFlagsRequestError('Enroll a passkey or authenticator app before changing feature flags.', 409);
        const start = adminFeatureFlagStartResponseSchema.safeParse(await requestFlags(parsed.data));
        if (!start.success) throw new FeatureFlagsRequestError('The verification response was invalid.', 502);
        setVerification(start.data);
        setMethod(flags.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }
      if (!verification || !selectedFlag) throw new FeatureFlagsRequestError('The verification expired. Start again.', 409);
      const factorResponse = await requestFlags(method === 'passkey'
        ? {
          operation: 'factor',
          token: verification.token,
          method,
          response: await getAdminPasskeyResponse(verification.options),
        }
        : { operation: 'factor', token: verification.token, method, code: code.trim() });
      if (!factorResponse || typeof factorResponse !== 'object' || !('verified' in factorResponse) || factorResponse.verified !== true) {
        throw new FeatureFlagsRequestError('Second-factor verification failed.', 401);
      }
      const result = adminFeatureFlagResultSchema.safeParse(
        await requestFlags({ operation: 'commit', token: verification.token }),
      );
      if (!result.success || !result.data.changed) {
        throw new FeatureFlagsRequestError('The feature flag was not changed. Refresh before trying again.', 409);
      }
      setSuccess(`${selectedFlag.label}: ${result.data.enabled === null
        ? 'override cleared; inherited setting restored'
        : result.data.enabled ? 'enabled' : 'disabled'}.`);
      closeEditor();
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The feature flag could not be changed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 id="admin-title">Feature flags</h1>
        <p>Control chat and estimate sharing rollouts globally, by plan, or for an individual workspace.</p>
        <p className={styles.note}>Environment variables remain hard-off ceilings. Admin flags cannot enable a feature disabled by its environment setting.</p>
      </header>
      {success && <p className={styles.success} role="status">{success}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!flags.methods.length && <p className={styles.notice}>A verified passkey or authenticator app is required to change flags.</p>}

      <div className={styles.list}>
        {flags.flags.map(flag => (
          <section className={styles.card} key={flag.id} aria-labelledby={`flag-${flag.id}`}>
            <header className={styles.cardHeader}>
              <div>
                <h2 id={`flag-${flag.id}`}>{flag.label}</h2>
                <p>{flag.description}</p>
              </div>
              <span className={styles.owner}>Owner: {flag.owner}</span>
            </header>
            <div className={styles.global} aria-label={`${flag.label} global setting`}>
              <strong>Global default: {flag.global.enabled ? 'Enabled' : 'Disabled'}</strong>
              <span>Expires: {dateCaption(flag.global.expiresAt)}</span>
              <span>Environment ceiling: {flag.environmentVariable}=true</span>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.button} onClick={() => beginEdit(flag.id)} disabled={!flags.methods.length}>
                Change {flag.label}
              </button>
            </div>
            <h3>Plan and workspace overrides</h3>
            {flag.overrides.length ? (
              <ul className={styles.overrides}>
                {flag.overrides.map(override => (
                  <li key={`${override.target.type}-${override.target.type === 'plan'
                    ? override.target.planId
                    : override.target.type === 'workspace' ? override.target.workspaceId : 'global'}`}>
                    <strong>{targetCaption(override.target)} · {override.enabled ? 'Enabled' : 'Disabled'}</strong>
                    <span>Expires: {dateCaption(override.expiresAt)}</span>
                    <span>Updated by {override.updatedBy}</span>
                  </li>
                ))}
              </ul>
            ) : <p className={styles.empty}>No plan or workspace overrides.</p>}
          </section>
        ))}
      </div>

      {editing && selectedFlag && (
        <section className={styles.editor} aria-label="Change feature flag">
          <h2>Change {selectedFlag.label}</h2>
          {stage === 'review' ? (
            <>
              <label>
                Target scope
                <select value={targetType} onChange={event => setTargetType(event.target.value as TargetType)}>
                  <option value="global">Global</option>
                  <option value="plan">Plan</option>
                  <option value="workspace">Workspace</option>
                </select>
              </label>
              {targetType !== 'global' && (
                <label>
                  {targetType === 'plan' ? 'Plan' : 'Workspace ID'}
                  {targetType === 'plan' ? (
                    <select aria-label="Plan" value={targetId} onChange={event => setTargetId(event.target.value)}>
                      <option value="">Choose a plan</option>
                      <option value="free">Free</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  ) : (
                    <input aria-label="Workspace ID" value={targetId} onChange={event => setTargetId(event.target.value)} />
                  )}
                </label>
              )}
              <label>
                Result
                <select value={changeValue} onChange={event => setChangeValue(event.target.value as ChangeValue)}>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                  <option value="inherit">{targetType === 'global' ? 'Restore catalog default' : 'Clear override (inherit)'}</option>
                </select>
              </label>
              {changeValue !== 'inherit' && (
                <label>
                  Expiry (optional)
                  <input type="datetime-local" value={expiresAt} onChange={event => setExpiresAt(event.target.value)} />
                </label>
              )}
              <label>
                Reason (10–500 characters)
                <textarea value={reason} onChange={event => setReason(event.target.value)} minLength={10} maxLength={500} />
              </label>
              <div className={styles.actions}>
                <button type="button" className={styles.button} onClick={() => void submit()} disabled={disabled}>Continue to verification</button>
                <button type="button" className={styles.secondary} onClick={closeEditor} disabled={pending}>Cancel</button>
              </div>
            </>
          ) : (
            <section className={styles.verification} aria-label="Verify feature flag change">
              <p>Verify this change with a second factor. The action and reason will be recorded in the Admin audit log.</p>
              <label>
                Verification method
                <select value={method} onChange={event => setMethod(event.target.value as 'passkey' | 'totp')}>
                  {flags.methods.includes('passkey') && <option value="passkey">Passkey</option>}
                  {flags.methods.includes('totp') && <option value="totp">Authenticator app</option>}
                </select>
              </label>
              {method === 'totp' && (
                <label>
                  Six-digit authenticator code
                  <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value)} />
                </label>
              )}
              <div className={styles.actions}>
                <button type="button" className={styles.button} onClick={() => void submit()} disabled={disabled}>Verify and save</button>
                <button type="button" className={styles.secondary} onClick={() => { setStage('review'); setVerification(null); setCode(''); }} disabled={pending}>Back</button>
              </div>
            </section>
          )}
        </section>
      )}

      <section className={styles.history}>
        <h2>Recent changes</h2>
        {flags.history.length ? (
          <ol>
            {flags.history.map(entry => (
              <li key={entry.id}>
                <strong>{flags.flags.find(flag => flag.id === entry.flagId)?.label} · {targetCaption(entry.target)} · {entry.action}</strong>
                <span>{entry.reason}</span>
                <span>{entry.actorName} · {new Date(entry.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ol>
        ) : <p className={styles.empty}>No feature flag changes have been recorded.</p>}
      </section>
    </div>
  );
}
