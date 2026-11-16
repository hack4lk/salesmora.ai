'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { workspacePolicySchema } from '@salesmora/contracts';
import { FormFeedback, PasswordField, SubmitButton } from '@salesmora/ui';
import { PermissionsPage, type PermissionsPageProps, type PermissionSaveResult } from './permissions-page';
import { permissionsRouteData as copy } from './permissions-route.data';
import { SettingsQueryBoundary, useSettingsRequest } from '../use-settings-request';
import { ApiRequestError } from '../../api/api-request';
import { isApiAccessError } from '../../api/api-query';

type Props = Omit<PermissionsPageProps, 'onSave' | 'onReload' | 'onReauthenticate'> & { email: string; userId: string };

export function PermissionsRoute(props: Props) {
  return <SettingsQueryBoundary workspaceId={props.policy.workspaceId}><PermissionsHost {...props}/></SettingsQueryBoundary>;
}
function PermissionsHost({ email, userId, ...props }: Props) {
  const parse = (raw: unknown) => {
    if (!raw || typeof raw !== 'object' || !('policy' in raw)) throw new Error(copy.reloadError);
    const policy = workspacePolicySchema.parse(raw.policy);
    if (policy.workspaceId !== props.policy.workspaceId) throw new Error(copy.reloadError);
    return policy;
  };
  const api = useSettingsRequest('permissions', `/api/permissions?workspace=${encodeURIComponent(props.policy.workspaceId)}`, parse, copy.reloadError);
  const router = useRouter();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const confirmation = useRef<{ resolve: () => void; reject: () => void } | null>(null);
  const submitting = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (confirming) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirming]);
  useEffect(() => () => { confirmation.current?.reject(); }, []);

  function close(confirmed: boolean) {
    const current = confirmation.current;
    confirmation.current = null;
    setConfirming(false);
    setPassword('');
    setError(undefined);
    if (confirmed) current?.resolve();
    else current?.reject();
    requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus());
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !password) return;
    submitting.current = true;
    setPending(true);
    setError(undefined);
    try {
      // Reuse the existing rate-limited credential endpoint to issue a fresh session.
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok || result.user?.id !== userId) {
        setError(response.status === 429 ? copy.rateLimited : copy.identityError);
        setPassword('');
        return;
      }
      close(true);
    } catch { setError(copy.identityError); setPassword(''); }
    finally { submitting.current = false; setPending(false); }
  }

  if (unavailable) return <FormFeedback kind="error" message={copy.unavailable}/>;
  return <div ref={root} className="grid min-w-0 gap-6">
    <PermissionsPage {...props}
      onSave={async change => {
        try {
          const policy = await api.write({ path: '/api/permissions', method: 'POST', body: change, parse, failureMessage: copy.reloadError });
          router.refresh();
          return { ok: true, policy };
        } catch (error) {
          if (api.isActive() && isApiAccessError(error)) setUnavailable(true);
          const status = error instanceof ApiRequestError ? error.status : undefined;
          return { ok: false, reason: status === 409 ? 'conflict' : status === 428 ? 'reauthentication' : 'error' } satisfies PermissionSaveResult;
        }
      }}
      onReload={async () => {
        try {
          const policy = await api.read();
          router.refresh();
          return policy;
        } catch (error) {
          if (api.isActive() && isApiAccessError(error)) setUnavailable(true);
          throw error;
        }
      }}
      onReauthenticate={() => new Promise<void>((resolve, reject) => {
        confirmation.current = { resolve, reject };
        setConfirming(true);
      })}
    />
    <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-help`} onCancel={event => { event.preventDefault(); if (!submitting.current) close(false); }} className="m-auto w-full max-w-lg rounded-2xl border border-line bg-paper p-6 text-ink shadow-xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm sm:p-8">
      <h2 id={`${id}-title`} className="m-0 text-xl font-semibold">{copy.identityTitle}</h2>
      <p id={`${id}-help`} className="mb-6 mt-3 text-sm leading-6 text-muted">{copy.identityHelp}</p>
      <form aria-label={copy.identityTitle} onSubmit={confirm} className="grid gap-6">
        {error && <FormFeedback kind="error" message={error} />}
        <PasswordField label={copy.password} name="password" autoComplete="current-password" required value={password} disabled={pending} onChange={event => setPassword(event.target.value)} />
        <div className="flex flex-wrap gap-3"><button type="button" disabled={pending} onClick={() => close(false)} className="min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary focus-visible:focus-ring disabled:cursor-not-allowed">{copy.cancel}</button><div className="flex-1"><SubmitButton label={copy.confirm} pending={pending} pendingLabel={copy.confirming} disabled={!password} /></div></div>
      </form>
    </dialog>
  </div>;
}
