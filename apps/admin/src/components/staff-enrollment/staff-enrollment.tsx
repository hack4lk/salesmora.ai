'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from '@simplewebauthn/server';
import styles from './staff-enrollment.module.css';

type Factor = 'passkey' | 'totp';
type EnrollmentStartResponse = {
  email: string;
  factor: Factor;
  passkeyOptions?: PublicKeyCredentialCreationOptionsJSON;
  totpURI?: string;
};
type EnrollmentStage = 'details' | 'totp' | 'passkey' | 'complete';

const browserTransports = new Set(['ble', 'hybrid', 'internal', 'nfc', 'usb']);

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function toBrowserTransports(transports: string[] | undefined): AuthenticatorTransport[] {
  return (transports ?? []).filter((transport): transport is AuthenticatorTransport => browserTransports.has(transport));
}

function encodeBase64Url(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function toRegistrationResponse(credential: PublicKeyCredential): RegistrationResponseJSON {
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: credential.id,
    type: 'public-key',
    response: {
      clientDataJSON: encodeBase64Url(response.clientDataJSON),
      attestationObject: encodeBase64Url(response.attestationObject),
      transports: typeof response.getTransports === 'function' ? toBrowserTransports(response.getTransports()) : [],
    },
    clientExtensionResults: credential.getClientExtensionResults(),
    ...(credential.authenticatorAttachment === 'platform' || credential.authenticatorAttachment === 'cross-platform'
      ? { authenticatorAttachment: credential.authenticatorAttachment }
      : {}),
  };
}

async function responseError(response: Response) {
  const result: unknown = await response.json().catch(() => null);
  if (result && typeof result === 'object' && 'error' in result && typeof result.error === 'string') {
    return result.error;
  }
  return 'Enrollment could not be completed. Try again.';
}

export interface StaffEnrollmentProps {
  accessEmail: string;
  token?: string;
}

export function StaffEnrollment({ accessEmail, token }: StaffEnrollmentProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const totpRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [factor, setFactor] = useState<Factor>('passkey');
  const [stage, setStage] = useState<EnrollmentStage>('details');
  const [passkeyOptions, setPasskeyOptions] = useState<PublicKeyCredentialCreationOptionsJSON>();
  const [totpURI, setTotpURI] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    window.history.replaceState(null, '', '/enroll');
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (stage === 'totp') totpRef.current?.focus();
  }, [stage]);

  async function completePasskey(options: PublicKeyCredentialCreationOptionsJSON) {
    if (!navigator.credentials?.create) throw new Error('This browser does not support passkey enrollment.');
    const publicKey: PublicKeyCredentialCreationOptions = {
      ...options,
      challenge: decodeBase64Url(options.challenge),
      user: { ...options.user, id: decodeBase64Url(options.user.id) },
      excludeCredentials: options.excludeCredentials?.map(credential => ({
        id: decodeBase64Url(credential.id),
        type: 'public-key',
        transports: toBrowserTransports(credential.transports),
      })),
    };
    const credential = await navigator.credentials.create({ publicKey });
    if (!(credential instanceof PublicKeyCredential)) throw new Error('Passkey enrollment was cancelled.');
    const response = await fetch('/api/admin/enrollment/complete-passkey', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ response: toRegistrationResponse(credential) }),
    });
    if (!response.ok) throw new Error(await responseError(response));
    const result = await response.json() as { backupCodes?: string[] };
    setBackupCodes(result.backupCodes ?? []);
    setStage('complete');
  }

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!token) {
      setError('This invitation link is missing its enrollment token. Ask an administrator for a new invitation.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/admin/enrollment/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, name, password, factor }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const result = await response.json() as EnrollmentStartResponse;
      setPassword('');
      setConfirmPassword('');
      if (result.factor === 'totp' && result.totpURI) {
        setTotpURI(result.totpURI);
        setStage('totp');
      } else if (result.factor === 'passkey' && result.passkeyOptions) {
        setPasskeyOptions(result.passkeyOptions);
        setStage('passkey');
        await completePasskey(result.passkeyOptions);
      } else {
        throw new Error('The enrollment service returned an incomplete factor setup.');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Enrollment could not be started.');
    } finally {
      setBusy(false);
    }
  }

  async function submitTotp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await fetch('/api/admin/enrollment/complete-totp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: totpCode }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const result = await response.json() as { backupCodes?: string[] };
      setBackupCodes(result.backupCodes ?? []);
      setStage('complete');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Authenticator verification failed.');
      setTotpCode('');
      totpRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  async function retryPasskey() {
    setError('');
    setBusy(true);
    try {
      if (!passkeyOptions) throw new Error('Passkey setup has expired. Restart your invitation link.');
      await completePasskey(passkeyOptions);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Passkey enrollment failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.flow}>
      <h1 id="admin-title">Set up your Admin account</h1>
      <p className={styles.lead}>For SalesMora staff only. This account is separate from any customer account.</p>
      <div className={styles.identity}>
        <span className={styles.identityLabel}>Verified staff email</span>
        <strong>{accessEmail}</strong>
        <span>Locked to the identity verified by Cloudflare Access.</span>
      </div>
      {error && <p className={styles.error} role="alert" aria-live="assertive">{error}</p>}

      {stage === 'details' && (
        <form className={styles.form} onSubmit={submitDetails}>
          <label htmlFor="staff-name">Your name</label>
          <input ref={nameRef} id="staff-name" autoComplete="name" minLength={2} maxLength={120} required value={name} onChange={event => setName(event.target.value)} />

          <label htmlFor="staff-password">Create a password</label>
          <input id="staff-password" type="password" autoComplete="new-password" minLength={14} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} aria-describedby="password-hint" />
          <span id="password-hint" className={styles.hint}>Use at least 14 characters. Your password is required before every second-factor sign-in.</span>

          <label htmlFor="staff-password-confirm">Confirm password</label>
          <input id="staff-password-confirm" type="password" autoComplete="new-password" minLength={14} maxLength={128} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />

          <fieldset className={styles.factors}>
            <legend>Choose your required second factor</legend>
            <label>
              <input type="radio" name="factor" value="passkey" checked={factor === 'passkey'} onChange={() => setFactor('passkey')} />
              Passkey or security key
            </label>
            <label>
              <input type="radio" name="factor" value="totp" checked={factor === 'totp'} onChange={() => setFactor('totp')} />
              Authenticator app
            </label>
          </fieldset>
          <button className={styles.primary} type="submit" disabled={busy || !token}>
            {busy ? 'Preparing secure enrollment…' : 'Continue to factor setup'}
          </button>
        </form>
      )}

      {stage === 'totp' && (
        <form className={styles.form} onSubmit={submitTotp}>
          <h2>Connect your authenticator app</h2>
          <p>Scan the setup link with your authenticator, or enter the secret manually.</p>
          <a className={styles.setupLink} href={totpURI}>Open authenticator app</a>
          <label htmlFor="totp-secret">Setup secret</label>
          <code id="totp-secret" className={styles.secret}>{new URL(totpURI).searchParams.get('secret')}</code>
          <label htmlFor="staff-totp">6-digit verification code</label>
          <input ref={totpRef} id="staff-totp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={totpCode} onChange={event => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
          <button className={styles.primary} type="submit" disabled={busy || totpCode.length !== 6}>
            {busy ? 'Verifying…' : 'Verify and finish setup'}
          </button>
        </form>
      )}

      {stage === 'passkey' && (
        <div className={styles.form}>
          <h2>Register your passkey</h2>
          <p>Use your security key or this device’s biometric authenticator. User verification is required.</p>
          <button className={styles.primary} type="button" disabled={busy} onClick={retryPasskey}>
            {busy ? 'Waiting for passkey…' : 'Try passkey setup again'}
          </button>
        </div>
      )}

      {stage === 'complete' && (
        <div className={styles.form}>
          <h2>Save your recovery codes</h2>
          <p>Each code works once. Store them somewhere safe. They are shown only now.</p>
          <ul className={styles.codes}>{backupCodes.map(code => <li key={code}><code>{code}</code></li>)}</ul>
          <p className={styles.note}>Your staff role is active. No admin session was created during setup. Sign in with your password and new factor.</p>
          <a className={styles.primary} href="/sign-in">Go to Admin sign-in</a>
        </div>
      )}
    </div>
  );
}
