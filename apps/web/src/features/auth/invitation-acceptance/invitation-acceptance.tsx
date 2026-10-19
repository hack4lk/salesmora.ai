'use client';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { FormFeedback, SubmitButton } from '@salesmora/ui';
import { RegistrationForm, type RegistrationFormProps } from '../registration-form/registration-form';
import { registrationScreenData as registrationCopy } from '../registration-screen/registration-screen.data';
import { useFormReady } from '../use-form-ready';
import { invitationAcceptanceData as copy } from './invitation-acceptance.data';
export interface InvitationSummary {
  id: string;
  workspaceName: string;
  inviterName: string;
  email: string;
  role: 'admin' | 'office' | 'field';
  expiresAt: string;
}
export type InvitationUnavailable = 'expired' | 'invalid' | 'revoked';
export type InvitationAcceptanceResult = { ok: true } | { ok: false; reason?: InvitationUnavailable | 'wrong-account' | 'rate-limited' | 'capacity' };
interface Actions {
  currentEmail?: string;
  disabled?: boolean;
  onAccept: () => Promise<InvitationAcceptanceResult>;
  onCreateAccount: RegistrationFormProps['onSubmit'];
  onSignIn: () => void;
  onSwitchAccount: () => void;
  onContinue: () => void;
}
export type InvitationAcceptanceProps = Actions & (
  | { availability: 'ready' | 'accepted'; invitation: InvitationSummary }
  | { availability: InvitationUnavailable; invitation?: never }
);
/** Parent supplies server-resolved invitation/session data and handles auth/navigation. */
export function InvitationAcceptance(props: InvitationAcceptanceProps) {
  return <InvitationAcceptanceContent key={`${props.invitation?.id ?? props.availability}:${props.currentEmail ?? ''}`} {...props} />;
}
function InvitationAcceptanceContent(props: InvitationAcceptanceProps) {
  const { currentEmail, disabled = false, onAccept, onCreateAccount, onSignIn, onSwitchAccount, onContinue } = props;
  const id = useId();
  const ready = useFormReady();
  const locked = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error' | 'limited' | 'wrong-account' | 'capacity' | InvitationUnavailable>('idle');
  const invitation = props.invitation;
  const unavailable = props.availability !== 'ready' && props.availability !== 'accepted' ? props.availability : status === 'expired' || status === 'invalid' || status === 'revoked' ? status : undefined;
  const accepted = props.availability === 'accepted' || status === 'success';
  const mismatch = !!invitation && !!currentEmail && (currentEmail.trim().toLowerCase() !== invitation.email.trim().toLowerCase() || status === 'wrong-account');
  const pending = status === 'pending';
  const blocked = !ready || disabled || pending;
  useEffect(() => {
    if (status !== 'idle' && status !== 'pending') feedback.current?.focus();
  }, [status]);
  async function accept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked || locked.current || accepted || unavailable || !currentEmail || mismatch) return;
    locked.current = true; setStatus('pending');
    try {
      const result = await onAccept();
      setStatus(result.ok ? 'success' : result.reason === 'rate-limited' ? 'limited' : result.reason ?? 'error');
    } catch { setStatus('error'); }
    finally { locked.current = false; }
  }
  const feedbackClass = 'rounded-xl focus-visible:focus-ring';
  const secondaryClass = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
  if (unavailable) return <section aria-labelledby={`${id}-title`} className="grid min-w-0 gap-4">
    <h2 id={`${id}-title`} className="m-0 text-xl font-semibold leading-normal text-ink">{copy.title}</h2>
    <div ref={feedback} tabIndex={-1} className={feedbackClass}><FormFeedback kind="error" title={copy.unavailable[unavailable].title} message={copy.unavailable[unavailable].message} /></div>
  </section>;
  if (!invitation) return null;
  const details = [[copy.workspace, invitation.workspaceName], [copy.invitedEmail, invitation.email], [copy.role, copy.roles[invitation.role]], [copy.expires, copy.formatExpiry(invitation.expiresAt)]];
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-6">
    <header><h2 id={`${id}-title`} className="m-0 text-xl font-semibold leading-normal text-ink">{copy.title}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.introduction(invitation.inviterName)}</p></header>
    <dl className="m-0 grid min-w-0 gap-4 rounded-xl border border-line bg-canvas p-4 text-sm leading-6">{details.map(([label, value]) => <div key={label}><dt className="text-muted">{label}</dt><dd className="m-0 mt-1 font-semibold text-ink wrap-anywhere">{value}</dd></div>)}</dl>
    {accepted ? <><div ref={feedback} tabIndex={-1} className={feedbackClass}><FormFeedback kind="success" title={copy.successTitle} message={copy.success} /></div><button type="button" disabled={blocked} onClick={onContinue} className={secondaryClass}>{copy.continue}</button></> : <>
      <p className="m-0 text-sm leading-6 text-muted">{copy.purpose}</p>
      {!currentEmail ? <><p className="m-0 text-sm leading-6 text-muted">{copy.signedOut}</p>
        <RegistrationForm initialEmail={invitation.email} emailDisabled onSubmit={onCreateAccount} submitLabel={copy.createAccount} pendingLabel={copy.creatingAccount} successMessage={copy.accountReady} termsHref={registrationCopy.termsHref} privacyHref={registrationCopy.privacyHref} />
        <div className="grid gap-3 text-sm leading-6 text-muted">
          <details id="terms-preview" className="rounded-xl border border-line p-3"><summary className="cursor-pointer text-primary focus-visible:focus-ring">{registrationCopy.legal.termsTitle}</summary><p className="mt-2">{registrationCopy.legal.unavailable}</p></details>
          <details id="privacy-preview" className="rounded-xl border border-line p-3"><summary className="cursor-pointer text-primary focus-visible:focus-ring">{registrationCopy.legal.privacyTitle}</summary><p className="mt-2">{registrationCopy.legal.unavailable}</p></details>
        </div>
        <button type="button" disabled={blocked} onClick={onSignIn} className={secondaryClass}>{copy.signIn}</button></> : <>
        <p className="m-0 text-sm leading-6 text-muted">{copy.signedIn} <span className="font-semibold text-ink wrap-anywhere">{currentEmail}</span></p>
        {mismatch ? <><div ref={feedback} tabIndex={-1} className={feedbackClass}><FormFeedback kind="error" title={copy.wrongAccountTitle} message={copy.wrongAccount} /></div><button type="button" disabled={blocked} onClick={onSwitchAccount} className={secondaryClass}>{copy.switchAccount}</button></> : <form aria-labelledby={`${id}-title`} aria-busy={pending} onSubmit={accept} className="grid min-w-0 gap-4">
          {(status === 'error' || status === 'limited' || status === 'capacity') && <div ref={feedback} tabIndex={-1} className={feedbackClass}><FormFeedback kind="error" title={status === 'capacity' ? copy.capacityTitle : status === 'limited' ? copy.limitedTitle : copy.errorTitle} message={status === 'capacity' ? copy.capacity : status === 'limited' ? copy.limited : copy.error} /></div>}
          <SubmitButton label={copy.accept} pendingLabel={copy.accepting} pending={pending} disabled={blocked} />
        </form>}
      </>}
    </>}
  </section>;
}
