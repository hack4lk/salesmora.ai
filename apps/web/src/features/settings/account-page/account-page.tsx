'use client';

import { useId, useRef, useState } from 'react';
import type { WorkspaceRole } from '@salesmora/contracts';
import { PasswordField, TextField } from '@salesmora/ui';
import { accountPageData as copy } from './account-page.data';

export interface AccountPageProps {
  viewerRole: WorkspaceRole;
  account?: { name: string; email: string; workspace: string };
  settingsHref?: string;
  billingHref?: string;
  deletionAllowed?: boolean;
  onDelete?: (input: { password: string; confirmation: string; acknowledged: true }) => Promise<{ ok: boolean; message?: string }>;
}
const button = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring';
const destructive = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-error bg-error px-5 py-3 text-sm font-semibold text-white hover:brightness-95 focus-visible:focus-ring disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-muted';

/** Presentation and confirmation only. The connected adapter performs server-verified deletion. */
export function AccountPage({ viewerRole, account, settingsHref = '/settings', billingHref = '/settings/billing', deletionAllowed = true, onDelete }: AccountPageProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const available = deletionAllowed && (!account || !!onDelete);
  const owner = viewerRole === 'owner';
  const details = account ?? copy.fixture;
  const expected = owner ? details.workspace : details.email;
  const ready = password.length > 0 && confirmation === expected && acknowledged;
  const reset = () => { setPassword(''); setConfirmation(''); setAcknowledged(false); };
  const close = () => { if (pending) return; dialog.current?.close(); reset(); };
  async function submit() {
    if (!ready || pending || !available) return;
    if (!onDelete) { close(); setComplete(true); return; }
    setPending(true); setError('');
    try {
      const result = await onDelete({ password, confirmation, acknowledged: true });
      if (!result.ok) { setError(result.message ?? copy.failed); return; }
      dialog.current?.close(); reset(); setComplete(true);
    } catch { setError(copy.failed); }
    finally { setPassword(''); setPending(false); }
  }
  return <div className="grid min-w-0 gap-6">
    <header><a href={settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.back}</a><p className="mb-0 mt-4 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p><h1 className="mb-0 mt-3 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-4 text-muted">{copy.description}</p></header>
    <section aria-labelledby={`${id}-profile`} className="rounded-2xl border border-line bg-paper p-6 sm:p-8"><h2 id={`${id}-profile`} className="m-0 text-xl font-semibold text-ink">{copy.profile}</h2><dl className="mb-0 mt-6 grid gap-6 sm:grid-cols-3">{[[copy.name,details.name],[copy.email,details.email],[copy.role,copy.roles[viewerRole]]].map(([label,value]) => <div key={label} className="min-w-0"><dt className="text-sm text-muted">{label}</dt><dd className="mb-0 ml-0 mt-2 font-semibold text-ink wrap-anywhere">{value}</dd></div>)}</dl></section>
    <section aria-labelledby={`${id}-danger`} className="rounded-2xl border border-l-8 border-error bg-error/5 p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id={`${id}-danger`} className="m-0 text-2xl font-semibold text-ink">{copy.danger}</h2><span className="rounded-full border border-error px-3 py-2 text-xs font-semibold text-ink">{copy.noRecovery}</span></div><h3 className="mb-0 mt-6 text-lg font-semibold text-ink">{owner ? copy.ownerTitle : copy.memberTitle}</h3><p className="text-base leading-relaxed text-ink">{owner ? copy.ownerDescription : copy.memberDescription}</p><ul className="space-y-2 pl-5 text-sm leading-6 text-ink">{(owner ? copy.ownerConsequences : copy.memberConsequences).map(item => <li key={item}>{item}</li>)}</ul><p className="my-5 text-sm leading-6 text-muted">{copy.retention}</p><button type="button" disabled={!available || complete} className={destructive} onClick={() => { reset(); setError(''); setComplete(false); dialog.current?.showModal(); cancelButton.current?.focus(); }}>{owner ? copy.ownerTitle : copy.memberTitle}</button>{account && !available && <p role="note" className="mb-0 mt-4 text-sm leading-6 text-muted">{copy.unavailable}</p>}</section>
    {owner && <section className="rounded-2xl border border-line bg-paper p-6"><h2 className="m-0 text-lg font-semibold text-ink">{copy.transferTitle}</h2><p className="mb-0 mt-3 text-sm leading-6 text-muted">{copy.transferNote}</p><p className="mb-4 mt-4 text-sm leading-6 text-muted">{copy.cancellation}</p><a className={button} href={billingHref}>{copy.billing}</a></section>}
    {complete && <p role="status" className="rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-ink">{onDelete ? copy.accepted : copy.complete}{onDelete && <a href="/login" className="ml-2 font-semibold text-primary underline focus-visible:focus-ring">{copy.signIn}</a>}</p>}
    <dialog ref={dialog} aria-labelledby={`${id}-confirm`} aria-describedby={`${id}-consequences`} onCancel={event => { if (pending) event.preventDefault(); else reset(); }} className="m-auto max-h-full w-full max-w-form overflow-y-auto rounded-2xl border border-line bg-paper p-6 text-ink shadow-xl backdrop:bg-ink/50 sm:p-8">
      <form aria-busy={pending} onSubmit={event => { event.preventDefault(); void submit(); }} className="grid gap-5">
        <h2 id={`${id}-confirm`} className="m-0 text-2xl font-semibold">{owner ? copy.confirmOwner : copy.confirmMember}</h2><p id={`${id}-consequences`} className="m-0 text-sm leading-6 text-muted">{owner ? copy.ownerDescription : copy.memberDescription}</p>
        <PasswordField disabled={pending} label={copy.password} autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} helperText={copy.passwordHint}/>
        <TextField disabled={pending} label={owner ? copy.workspaceLabel : copy.memberLabel} autoComplete="off" required value={confirmation} onChange={event => setConfirmation(event.target.value)} helperText={copy.matchHint(expected)}/>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6"><input type="checkbox" disabled={pending} checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} className="mt-1 size-5 shrink-0 accent-primary focus-visible:focus-ring"/>{copy.acknowledge}</label>
        {error && <p role="alert" className="m-0 rounded-xl border border-error bg-error/5 p-4 text-sm text-ink">{error}</p>}
        <p className="m-0 text-sm leading-6 text-muted">{copy.retention}</p>
        <button type="button" disabled={pending} ref={cancelButton} onClick={close} className={button}>{copy.cancel}</button><button type="submit" disabled={!ready || pending} className={destructive}>{pending ? copy.deleting : owner ? copy.deleteOwner : copy.deleteMember}</button>
      </form>
    </dialog>
  </div>;
}
