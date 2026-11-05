'use client';
import Link from 'next/link';
import { useId, useRef, useState, type FormEvent } from 'react';
import { FormFeedback, SubmitButton } from '@salesmora/ui';
import { workspaceSuspendedNoticeData as copy } from './workspace-suspended-notice.data';
export interface WorkspaceSuspendedNoticeProps {
  /** Active workspaces the person can still open. Never includes suspended ones. */
  workspaces: readonly { id: string; name: string }[];
  onSignOut: () => Promise<boolean>;
}
/** Shown instead of a suspended workspace. Deliberately omits the staff-entered suspension reason. */
export function WorkspaceSuspendedNotice({ workspaces, onSignOut }: WorkspaceSuspendedNoticeProps) {
  const id = useId();
  const [status, setStatus] = useState<'idle' | 'pending' | 'error'>('idle');
  const locked = useRef(false);
  async function signOut(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true; setStatus('pending');
    try { setStatus(await onSignOut() ? 'idle' : 'error'); } catch { setStatus('error'); }
    finally { locked.current = false; }
  }
  return <section aria-labelledby={`${id}-title`} className="grid w-full min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
    <div>
      <h2 id={`${id}-title`} className="m-0 text-xl font-semibold leading-normal text-ink">{copy.title}</h2>
      <p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.description}</p>
      <p className="mb-0 mt-2 text-sm leading-6 text-ink">{copy.contact}</p>
    </div>
    {workspaces.length > 0 && <nav aria-labelledby={`${id}-others`} className="grid min-w-0 gap-2">
      <h3 id={`${id}-others`} className="m-0 text-sm font-semibold text-ink">{copy.otherWorkspaces}</h3>
      <ul className="m-0 grid list-none gap-2 p-0">
        {workspaces.map(workspace => <li key={workspace.id} className="min-w-0">
          <Link href={`/home?workspace=${encodeURIComponent(workspace.id)}`} aria-label={copy.open(workspace.name)} className="block rounded-xl border border-line bg-canvas p-3 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring">{workspace.name}</Link>
        </li>)}
      </ul>
    </nav>}
    <form aria-busy={status === 'pending'} onSubmit={signOut} className="grid min-w-0 gap-4">
      {status === 'error' && <FormFeedback kind="error" title={copy.signOutErrorTitle} message={copy.signOutError} />}
      <SubmitButton label={copy.signOut} pendingLabel={copy.signingOut} pending={status === 'pending'} />
    </form>
  </section>;
}
