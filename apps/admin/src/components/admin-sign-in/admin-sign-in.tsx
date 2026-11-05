'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type {
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import styles from './admin-sign-in.module.css';

type SignInStage = 'password' | 'factor' | 'totp' | 'recovery' | 'forgot';
type FactorMethod = 'passkey' | 'totp' | 'backup';

interface AuthSessionResponse {
  token?: string;
  session?: { token?: string };
  user?: { email?: string };
  twoFactorRedirect?: boolean;
  twoFactorMethods?: string[];
}

function isAuthSessionResponse(value: unknown): value is AuthSessionResponse {
  return Boolean(value && typeof value === 'object');
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function encodeBase64Url(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function toAuthenticationResponse(credential: PublicKeyCredential): AuthenticationResponseJSON {
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: credential.id,
    type: 'public-key',
    response: {
      authenticatorData: encodeBase64Url(response.authenticatorData),
      clientDataJSON: encodeBase64Url(response.clientDataJSON),
      signature: encodeBase64Url(response.signature),
      ...(response.userHandle ? { userHandle: encodeBase64Url(response.userHandle) } : {}),
    },
    clientExtensionResults: credential.getClientExtensionResults(),
    ...(credential.authenticatorAttachment === 'platform' || credential.authenticatorAttachment === 'cross-platform'
      ? { authenticatorAttachment: credential.authenticatorAttachment }
      : {}),
  };
}

export async function getAdminPasskeyResponse(options: PublicKeyCredentialRequestOptionsJSON) {
  if (!navigator.credentials?.get) throw new Error('This browser does not support passkey verification.');
  const publicKey: PublicKeyCredentialRequestOptions = {
    ...options,
    challenge: decodeBase64Url(options.challenge),
    allowCredentials: options.allowCredentials?.map(credential => ({
      id: decodeBase64Url(credential.id),
      type: 'public-key',
      ...(credential.transports ? { transports: credential.transports.filter(transport =>
        ['ble', 'hybrid', 'internal', 'nfc', 'usb'].includes(transport)) as AuthenticatorTransport[] } : {}),
    })),
  };
  const credential = await navigator.credentials.get({ publicKey });
  if (!(credential instanceof PublicKeyCredential)) throw new Error('Passkey verification was cancelled.');
  return toAuthenticationResponse(credential);
}

function factorMethods(value: unknown): FactorMethod[] {
  if (!Array.isArray(value)) return [];
  return value.filter((method): method is FactorMethod =>
    method === 'passkey' || method === 'totp' || method === 'backup');
}

async function responseBody(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  return isAuthSessionResponse(body) ? body : null;
}

export interface AdminSignInProps {
  accessEmail: string;
}

export function AdminSignIn({ accessEmail }: AdminSignInProps) {
  const passwordRef = useRef<HTMLInputElement>(null);
  const factorRef = useRef<HTMLInputElement>(null);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [stage, setStage] = useState<SignInStage>('password');
  const [methods, setMethods] = useState<FactorMethod[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (stage === 'password') passwordRef.current?.focus();
    if (stage === 'totp' || stage === 'recovery') factorRef.current?.focus();
    if (stage === 'factor' || stage === 'forgot') stageHeadingRef.current?.focus();
  }, [stage]);

  async function finishIfAuthenticated(response: Response) {
    const body = await responseBody(response);
    if (!response.ok || !(body?.session?.token || body?.token)) {
      throw new Error('Sign-in could not be completed. Check your credentials or contact another Super Admin.');
    }
    const sessionResponse = await fetch('/api/auth/get-session', { credentials: 'same-origin' });
    const sessionBody = await responseBody(sessionResponse);
    if (!sessionResponse.ok || !sessionBody?.session ||
      sessionBody.user?.email?.toLowerCase() !== accessEmail.toLowerCase()) {
      throw new Error('Sign-in could not be completed. Check your credentials or contact another Super Admin.');
    }
    window.location.assign('/');
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!accessEmail) {
      setError('Admin identity verification is unavailable. Reload the page or contact an administrator.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: accessEmail, password }),
      });
      const body = await responseBody(response);
      setPassword('');
      if (!response.ok || !body?.twoFactorRedirect) {
        throw new Error('Sign-in could not be completed. Check your credentials or contact another Super Admin.');
      }
      const availableMethods = factorMethods(body.twoFactorMethods);
      if (!availableMethods.length) {
        throw new Error('No second factor is available for this account. Contact another Super Admin.');
      }
      setMethods(availableMethods);
      setStage(availableMethods.includes('passkey') ? 'factor' : availableMethods.includes('totp') ? 'totp' : 'recovery');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign-in could not be completed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyFactor(path: string, body: Record<string, string | boolean>) {
    const response = await fetch(`/api/auth/${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    await finishIfAuthenticated(response);
  }

  async function submitTotp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await verifyFactor('two-factor/verify-totp', { code: totpCode, trustDevice: false });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The code could not be verified. Try again.');
      setTotpCode('');
      factorRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  async function submitRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await verifyFactor('two-factor/verify-backup-code', { code: recoveryCode });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The recovery code could not be verified. Try again.');
      setRecoveryCode('');
      factorRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  async function submitPasskey() {
    setError('');
    setBusy(true);
    try {
      if (!navigator.credentials?.get) throw new Error('This browser does not support passkey sign-in.');
      const optionsResponse = await fetch('/api/auth/passkey/generate-authenticate-options', {
        credentials: 'same-origin',
      });
      const optionsBody: unknown = await optionsResponse.json().catch(() => null);
      if (!optionsResponse.ok || !optionsBody || typeof optionsBody !== 'object' ||
        !('challenge' in optionsBody) || typeof optionsBody.challenge !== 'string') {
        throw new Error('Passkey sign-in could not be started. Try again or choose another factor.');
      }
      const options = optionsBody as PublicKeyCredentialRequestOptionsJSON;
      const assertion = await getAdminPasskeyResponse(options);
      const response = await fetch('/api/auth/passkey/verify-authentication', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ response: assertion }),
      });
      await finishIfAuthenticated(response);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Passkey sign-in failed. Try another factor.');
    } finally {
      setBusy(false);
    }
  }

  function chooseStage(nextStage: SignInStage) {
    setError('');
    setStage(nextStage);
  }

  return (
    <div className={styles.signIn}>
      <div className={styles.identity}>
        <span className={styles.identityLabel}>Verified by Cloudflare Access</span>
        {accessEmail ? <strong>{accessEmail}</strong> : <strong>Identity unavailable</strong>}
        <span>Use your Admin password and second factor. Customer accounts cannot sign in here.</span>
      </div>
      <div className={styles.steps} aria-hidden="true">
        <span className={stage !== 'password' && stage !== 'forgot' ? styles.done : styles.active} />
        <span className={stage !== 'password' && stage !== 'forgot' ? styles.active : ''} />
      </div>
      {error && <p className={styles.error} role="alert" aria-live="assertive">{error}</p>}

      {stage === 'password' && !accessEmail && (
        <section className={styles.form}>
          <h1 id="admin-title">Admin access required</h1>
          <p>Cloudflare Access could not verify your staff identity. Reload this page or contact an administrator. No sign-in attempt was made.</p>
        </section>
      )}

      {stage === 'password' && accessEmail && (
        <form className={styles.form} onSubmit={submitPassword}>
          <h1 id="admin-title">Sign in to Admin</h1>
          <p>For SalesMora staff only. You must verify a second factor after your password.</p>
          <label htmlFor="admin-email">Staff email</label>
          <input id="admin-email" type="email" value={accessEmail} readOnly aria-describedby="email-hint" />
          <span id="email-hint" className={styles.hint}>Locked to the identity verified by Cloudflare Access.</span>
          <label htmlFor="admin-password">Password</label>
          <input ref={passwordRef} id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
          <button className={styles.primary} type="submit" disabled={busy || !accessEmail || !password}>
            {busy ? 'Verifying password…' : 'Continue'}
          </button>
          <button className={styles.link} type="button" onClick={() => chooseStage('forgot')}>Forgot password?</button>
        </form>
      )}

      {stage === 'factor' && (
        <section className={styles.form}>
          <h1 ref={stageHeadingRef} id="admin-title" tabIndex={-1}>Confirm with your passkey</h1>
          <p>Use a passkey or security key registered to <strong>{accessEmail}</strong>. Password verification is already complete.</p>
          <button className={styles.primary} type="button" onClick={submitPasskey} disabled={busy}>
            {busy ? 'Waiting for passkey…' : 'Use passkey'}
          </button>
          {methods.includes('totp') && <button className={styles.link} type="button" onClick={() => chooseStage('totp')}>Use authenticator app code instead</button>}
          {methods.includes('backup') && <button className={styles.link} type="button" onClick={() => chooseStage('recovery')}>Use a recovery code</button>}
          <button className={styles.link} type="button" onClick={() => chooseStage('password')}>Back</button>
        </section>
      )}

      {stage === 'totp' && (
        <form className={styles.form} onSubmit={submitTotp}>
          <h1 id="admin-title">Enter authenticator code</h1>
          <p>Open your authenticator app and enter the current SalesMora Admin code.</p>
          <label htmlFor="admin-totp">6-digit code</label>
          <input ref={factorRef} id="admin-totp" className={styles.code} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={totpCode} onChange={event => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
          <button className={styles.primary} type="submit" disabled={busy || totpCode.length !== 6}>{busy ? 'Verifying…' : 'Verify'}</button>
          {methods.includes('passkey') && <button className={styles.link} type="button" onClick={() => chooseStage('factor')}>Use passkey instead</button>}
          {methods.includes('backup') && <button className={styles.link} type="button" onClick={() => chooseStage('recovery')}>Use a recovery code</button>}
        </form>
      )}

      {stage === 'recovery' && (
        <form className={styles.form} onSubmit={submitRecovery}>
          <h1 id="admin-title">Use a recovery code</h1>
          <p>Each recovery code works once. After signing in, review your factors under My account.</p>
          <label htmlFor="admin-recovery">Recovery code</label>
          <input ref={factorRef} id="admin-recovery" autoComplete="off" placeholder="xxxxx-xxxxx" required value={recoveryCode} onChange={event => setRecoveryCode(event.target.value)} />
          <button className={styles.primary} type="submit" disabled={busy || !recoveryCode.trim()}>{busy ? 'Verifying…' : 'Verify recovery code'}</button>
          {methods.includes('passkey') && <button className={styles.link} type="button" onClick={() => chooseStage('factor')}>Back to passkey</button>}
          {methods.includes('totp') && <button className={styles.link} type="button" onClick={() => chooseStage('totp')}>Use authenticator app code</button>}
        </form>
      )}

      {stage === 'forgot' && (
        <section className={styles.form}>
          <h1 ref={stageHeadingRef} id="admin-title" tabIndex={-1}>Reset your Admin password</h1>
          <p>Admin passwords are not reset by email. Ask another Super Admin to issue a reset. You will need your second factor to complete it.</p>
          <p className={styles.warning}>If you are the only Super Admin and lost all factors, use the bootstrap recovery runbook (Railway shell access required).</p>
          <button className={styles.secondary} type="button" onClick={() => chooseStage('password')}>Back to sign-in</button>
        </section>
      )}
      <p className={styles.foot}>Admin access is protected by Cloudflare Access and recorded through the staff security workflow.</p>
    </div>
  );
}
