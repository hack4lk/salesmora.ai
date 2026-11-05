'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminPlatformSettingsOperationSchema,
  adminPlatformSettingsResultSchema,
  adminPlatformSettingsStartSchema,
  adminPlatformSettingsVerifiedSchema,
  type AdminPlatformSettingsResponse,
} from '@salesmora/contracts';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { getAdminPasskeyResponse } from '../admin-sign-in/admin-sign-in';
import { adminPlatformSettingsPageData as copy } from './admin-platform-settings-page.data';
import styles from './admin-platform-settings-page.module.css';

type Method = 'passkey' | 'totp';
type VerificationState = { token: string; options: PublicKeyCredentialRequestOptionsJSON };

class PlatformSettingsRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function requestSettings(body?: unknown) {
  let response: Response;
  try {
    response = await fetch('/api/admin/settings/ai-budget', {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body === undefined
        ? {}
        : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new PlatformSettingsRequestError('Platform settings are unavailable. Try again.', 0);
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new PlatformSettingsRequestError('The platform settings response was invalid.', response.status); }
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : 'The default AI budget could not be changed. Refresh settings before trying again.';
    throw new PlatformSettingsRequestError(message, response.status);
  }
  return result;
}

function formattedTokens(value: number) {
  return value.toLocaleString('en-US');
}

export function AdminPlatformSettingsPage({ settings }: { settings: AdminPlatformSettingsResponse }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [stage, setStage] = useState<'review' | 'verification'>('review');
  const [monthlyTokens, setMonthlyTokens] = useState(String(settings.defaultMonthlyAITokens));
  const [reset, setReset] = useState(false);
  const [reason, setReason] = useState('');
  const [method, setMethod] = useState<Method>(settings.methods.includes('passkey') ? 'passkey' : 'totp');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const value = /^(0|[1-9]\d*)$/.test(monthlyTokens) && Number.isSafeInteger(Number(monthlyTokens))
    ? Number(monthlyTokens)
    : null;
  const target = reset ? null : value;
  const validTarget = target === null || target <= copy.maxTokens;
  const routerRefresh = () => router.refresh();

  function closeEditor() {
    setEditing(false);
    setStage('review');
    setVerification(null);
    setReset(false);
    setReason('');
    setCode('');
    setError('');
  }

  function beginEdit() {
    setMonthlyTokens(String(settings.defaultMonthlyAITokens));
    setReset(false);
    setReason('');
    setError('');
    setSuccess('');
    setEditing(true);
    setStage('review');
    setVerification(null);
  }

  async function submit() {
    setError('');
    setPending(true);
    try {
      if (stage === 'review') {
        if (!settings.methods.length) throw new PlatformSettingsRequestError('Enroll a passkey or authenticator app before changing platform settings.', 409);
        const startRequest = adminPlatformSettingsOperationSchema.safeParse({
          operation: 'start',
          monthlyTokens: target,
          expectedVersion: settings.version,
          reason: reason.trim(),
        });
        if (!startRequest.success || startRequest.data.operation !== 'start' || !validTarget) {
          throw new PlatformSettingsRequestError('Enter a valid monthly token allowance and a reason of 10–500 characters.', 400);
        }
        const start = adminPlatformSettingsStartSchema.safeParse(await requestSettings(startRequest.data));
        if (!start.success) throw new PlatformSettingsRequestError('The verification response was invalid.', 502);
        setVerification(start.data);
        setMethod(settings.methods.includes('passkey') ? 'passkey' : 'totp');
        setStage('verification');
        return;
      }
      if (!verification) throw new PlatformSettingsRequestError('The verification expired. Start again.', 409);
      const factorResponse = await requestSettings(method === 'passkey'
        ? {
          operation: 'factor',
          token: verification.token,
          method,
          response: await getAdminPasskeyResponse(verification.options),
        }
        : { operation: 'factor', token: verification.token, method, code: code.trim() });
      if (!adminPlatformSettingsVerifiedSchema.safeParse(factorResponse).success) {
        throw new PlatformSettingsRequestError('Second-factor verification failed.', 401);
      }
      const result = adminPlatformSettingsResultSchema.safeParse(
        await requestSettings({ operation: 'commit', token: verification.token }),
      );
      if (!result.success || result.data.monthlyTokens !== target) {
        throw new PlatformSettingsRequestError('The platform setting changed unexpectedly. Refresh and try again.', 409);
      }
      setSuccess(target === null
        ? 'The environment-configured default is active again.'
        : `The default allowance is now ${formattedTokens(target)} tokens per workspace per month.`);
      closeEditor();
      routerRefresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The default AI budget could not be changed.');
    } finally {
      setPending(false);
    }
  }

  const disabled = pending || (stage === 'review' && (
    !validTarget || (!reset && value === null) || reason.trim().length < 10 || reason.trim().length > 500
  )) || (stage === 'verification' && (
    !settings.methods.includes(method) || (method === 'totp' && !/^\d{6}$/.test(code.trim()))
  ));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 id="admin-title">{copy.title}</h1>
        <p>{copy.description}</p>
        <p className={styles.note}>{copy.inheritanceNote}</p>
      </header>
      {success && <p className={styles.success} role="status">{success}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <section className={styles.panel} aria-labelledby="default-ai-budget-title">
        <h2 id="default-ai-budget-title">Default monthly AI allowance</h2>
        <strong className={styles.budgetValue}>{formattedTokens(settings.defaultMonthlyAITokens)} tokens</strong>
        <p className={styles.source}>{settings.source === 'admin'
          ? `Admin-managed setting · version ${settings.version}`
          : copy.environmentSource}</p>
        {settings.methods.length === 0 && <p className={styles.notice}>A verified passkey or authenticator app is required to change this setting.</p>}
        {!editing ? (
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={beginEdit} disabled={!settings.methods.length}>
              Change default allowance
            </button>
          </div>
        ) : (
          <div className={styles.form}>
            {stage === 'review' ? (
              <>
                <label className={styles.field} htmlFor="monthly-ai-tokens">
                  Monthly tokens per workspace
                  <input
                    className={styles.input}
                    id="monthly-ai-tokens"
                    inputMode="numeric"
                    max={copy.maxTokens}
                    min={0}
                    onChange={event => setMonthlyTokens(event.target.value)}
                    value={monthlyTokens}
                  />
                </label>
                <label className={styles.radio}>
                  <input checked={reset} onChange={event => setReset(event.target.checked)} type="checkbox" />
                  {copy.resetLabel}
                </label>
                {reset && <p className={styles.note}>{copy.resetDescription}</p>}
                <label className={styles.field} htmlFor="platform-ai-budget-reason">
                  {copy.reasonLabel}
                  <textarea
                    className={styles.textarea}
                    id="platform-ai-budget-reason"
                    maxLength={500}
                    minLength={10}
                    onChange={event => setReason(event.target.value)}
                    value={reason}
                  />
                </label>
              </>
            ) : (
              <section className={styles.verification} aria-label="Verify platform setting change">
                <p>Verify this change with a second factor. The setting is versioned only after verification.</p>
                {settings.methods.map(available => (
                  <label className={styles.radio} key={available}>
                    <input
                      checked={method === available}
                      name="platform-setting-factor"
                      onChange={() => setMethod(available)}
                      type="radio"
                    />
                    {available === 'totp' ? 'Authenticator app' : 'Passkey'}
                  </label>
                ))}
                {method === 'totp' && (
                  <label className={styles.field} htmlFor="platform-setting-totp">
                    Six-digit authenticator code
                    <input
                      autoComplete="one-time-code"
                      className={styles.input}
                      id="platform-setting-totp"
                      inputMode="numeric"
                      maxLength={6}
                      onChange={event => setCode(event.target.value)}
                      value={code}
                    />
                  </label>
                )}
              </section>
            )}
            <div className={styles.actions}>
              <button type="button" className={styles.button} disabled={disabled} onClick={() => void submit()}>
                {pending ? 'Working…' : stage === 'review' ? 'Continue to verification' : 'Verify and save'}
              </button>
              <button type="button" className={styles.secondaryButton} disabled={pending} onClick={closeEditor}>Cancel</button>
            </div>
          </div>
        )}
      </section>
      <section className={styles.panel} aria-labelledby="platform-settings-history-title">
        <h2 id="platform-settings-history-title">Change history</h2>
        {settings.history.length === 0 ? <p className={styles.empty}>{copy.noHistory}</p> : (
          <ol className={styles.history}>
            {settings.history.map(entry => (
              <li className={styles.historyItem} key={entry.version}>
                <strong>Version {entry.version} · {entry.monthlyTokens === null
                  ? 'Environment default'
                  : `${formattedTokens(entry.monthlyTokens)} tokens per workspace per month`}</strong>
                <span>{entry.reason}</span>
                <span>{entry.actorName} · {new Date(entry.createdAt).toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' })}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
