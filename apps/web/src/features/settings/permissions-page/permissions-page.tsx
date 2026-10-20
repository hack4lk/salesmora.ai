'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { permissionCatalog, permissionIds, workspaceRoles, type PermissionDefinition, type PermissionId, type PermissionScope, type PolicyChange, type WorkspacePolicy, type WorkspaceRole } from '@salesmora/contracts';
import { validateWorkspacePolicy } from '@salesmora/domain';
import { FormFeedback, SubmitButton } from '@salesmora/ui';
import { permissionsPageData as copy } from './permissions-page.data';
export type PermissionSaveResult = {
  ok: true;
  policy: WorkspacePolicy;
} | {
  ok: false;
  reason: 'conflict' | 'reauthentication' | 'error';
};
export interface PermissionsPageProps {
  workspaceName: string;
  viewerRole: WorkspaceRole;
  policy: WorkspacePolicy;
  defaultPolicy: WorkspacePolicy;
  /** Current server-owned feature availability. This prop does not authorize a save. */
  availablePermissions: readonly PermissionId[];
  initialRole?: WorkspaceRole;
  onSave: (change: PolicyChange) => Promise<PermissionSaveResult>;
  onReload?: () => Promise<WorkspacePolicy>;
  onReauthenticate?: () => Promise<void>;
}
const buttonClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
const clone = (policy: WorkspacePolicy): WorkspacePolicy => ({ ...policy, grants: policy.grants.map(grant => ({ ...grant })) });
const getScope = (policy: WorkspacePolicy, role: WorkspaceRole, permission: PermissionId) => policy.grants.find(grant => grant.role === role && grant.permission === permission)?.scope;
const spec = (permission: PermissionId): PermissionDefinition => permissionCatalog[permission];
const eligible = (role: WorkspaceRole, permission: PermissionId) => spec(permission).eligibleRoles.includes(role) && (!['team.invite', 'team.role.assign', 'team.remove'].includes(permission) || role === 'owner' || role === 'admin');
function differences(before: WorkspacePolicy, after: WorkspacePolicy) {
  return workspaceRoles.flatMap(role => permissionIds.flatMap(permission => {
    const previous = getScope(before, role, permission), next = getScope(after, role, permission);
    return previous === next ? [] : [{ role, permission, before: previous, after: next }];
  }));
}
/** Presentation only. Connected adapters must enforce Owner authority, current revision and recent authentication. */
export function PermissionsPage(props: PermissionsPageProps) {
  if (props.viewerRole !== 'owner')
    return <section className="rounded-2xl border border-line bg-paper p-6 sm:p-8"><FormFeedback kind="error" title={copy.deniedTitle} message={copy.denied}/></section>;
  return <PermissionsEditor key={props.policy.workspaceId} {...props}/>;
}
function PermissionsEditor({ workspaceName, policy, defaultPolicy, availablePermissions, initialRole = 'office', onSave, onReload, onReauthenticate }: PermissionsPageProps) {
  const id = useId();
  const [base, setBase] = useState(() => clone(policy));
  const [draft, setDraft] = useState(() => clone(policy));
  const [role, setRole] = useState<WorkspaceRole>(initialRole);
  const [search, setSearch] = useState('');
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'conflict' | 'reauthentication'>('idle');
  const locked = useRef(false);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const changes = differences(base, draft);
  const validation = validateWorkspacePolicy(draft);
  const originalValid = validateWorkspacePolicy(base).ok;
  const stale = policy.workspaceId !== base.workspaceId || policy.revision > base.revision;
  const conflict = status === 'conflict' || stale;
  const mutable = (permission: PermissionId) => eligible(role, permission) && !spec(permission).locked && spec(permission).reviewed && availablePermissions.includes(permission);
  const disabled = busy || conflict || !originalValid;
  useEffect(() => {
    if (review) reviewHeading.current?.focus();
  }, [review]);
  useEffect(() => {
    if (status !== 'idle') feedback.current?.focus();
  }, [status]);
  function edit(permission: PermissionId, scope: PermissionScope | undefined) {
    if (disabled || !mutable(permission))
      return;
    setStatus('idle');
    setDraft(current => ({ ...current, grants: [...current.grants.filter(grant => grant.role !== role || grant.permission !== permission), ...(scope ? [{ role, permission, scope }] : [])] }));
  }
  function discard() {
    setDraft(clone(base));
    setStatus('idle');
    setReview(false);
  }
  function back() {
    setReview(false);
    requestAnimationFrame(() => reviewButton.current?.focus());
  }
  async function save() {
    if (locked.current || disabled || !review || !validation.ok || !changes.length)
      return;
    locked.current = true;
    setBusy(true);
    setStatus('idle');
    const proposed = { ...clone(draft), revision: base.revision + 1 };
    try {
      const result = await onSave({ expectedRevision: base.revision, policy: proposed });
      if (!result.ok) {
        setStatus(result.reason);
        return;
      }
      const validated = validateWorkspacePolicy(result.policy);
      if (!validated.ok || result.policy.workspaceId !== base.workspaceId || result.policy.revision !== proposed.revision) {
        setStatus('conflict');
        return;
      }
      setBase(clone(result.policy));
      setDraft(clone(result.policy));
      setReview(false);
      setStatus('success');
    }
    catch {
      setStatus('error');
    }
    finally {
      locked.current = false;
      setBusy(false);
    }
  }
  async function reload() {
    if (!onReload || locked.current)
      return;
    locked.current = true;
    setBusy(true);
    try {
      const latest = await onReload();
      if (latest.workspaceId !== base.workspaceId || !validateWorkspacePolicy(latest).ok)
        throw Error('Invalid policy');
      setBase(clone(latest));
      setDraft(clone(latest));
      setReview(false);
      setStatus('idle');
    }
    catch {
      setStatus('conflict');
    }
    finally {
      locked.current = false;
      setBusy(false);
    }
  }
  const query = search.trim().toLowerCase();
  const groups = copy.groups.map(group => ({ ...group, permissions: permissionIds.filter(permission => group.prefixes.some(prefix => permission.startsWith(prefix)) && copy.labels[permission].toLowerCase().includes(query)) })).filter(group => group.permissions.length);
  const value = (scope: PermissionScope | undefined) => scope ? scope === 'enabled' ? copy.enabled : copy.scopes[scope] : copy.disabled;
  const outcome = conflict ? { title: copy.conflictTitle, message: copy.conflict } : status === 'reauthentication' ? { title: copy.reauthTitle, message: copy.reauth } : status === 'error' ? { title: copy.errorTitle, message: copy.error } : status === 'success' ? { title: copy.successTitle, message: copy.success } : null;
  return <section className="grid min-w-0 gap-6" aria-labelledby={`${id}-title`}>
  <header><p className="m-0 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p><div className="mt-3 flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h1 id={`${id}-title`} className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-2 text-sm font-semibold text-muted wrap-anywhere">{workspaceName}</p></div><span className="rounded-full border border-line bg-paper px-3 py-2 text-xs font-semibold text-primary">{copy.ownerOnly}</span></div><p className="mb-0 mt-4 max-w-3xl text-base leading-relaxed text-muted">{copy.description}</p></header>
  {outcome && <div ref={feedback} tabIndex={-1} className="rounded-xl focus-visible:focus-ring"><FormFeedback kind={status === 'success' && !conflict ? 'success' : 'error'} title={outcome.title} message={outcome.message}/>{conflict && onReload && <button type="button" disabled={busy} onClick={reload} className={`${buttonClass} mt-3`}>{busy ? copy.loading : copy.reload}</button>}{status === 'reauthentication' && onReauthenticate && <button type="button" disabled={busy} onClick={async () => { if (locked.current)
    return; locked.current = true; setBusy(true); try {
    await onReauthenticate();
    setStatus('idle');
  }
  catch {
    setStatus('reauthentication');
  }
  finally {
    locked.current = false;
    setBusy(false);
  } }} className={`${buttonClass} mt-3`}>{copy.reauthenticate}</button>}</div>}
  {(!validation.ok || !originalValid) && <FormFeedback kind="error" title={copy.invalidTitle} message={!validation.ok ? (copy.dependencyErrors[validation.reason] ?? copy.invalid) : copy.invalid}/>}
  <form aria-label={copy.title} aria-busy={busy} onSubmit={event => { event.preventDefault(); if (review)
    void save();
  else if (changes.length && validation.ok && !disabled)
    setReview(true); }} className="grid min-w-0 gap-6">
   {review ? <section className="rounded-2xl border border-line bg-paper p-4 sm:p-6" aria-labelledby={`${id}-review`} onKeyDown={event => { if (event.key === 'Escape' && !busy)
      back(); }}>
    <h2 ref={reviewHeading} tabIndex={-1} id={`${id}-review`} className="m-0 rounded-lg text-xl font-semibold text-ink focus-visible:focus-ring">{copy.reviewTitle}</h2><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.reviewHelp}</p>
    <ul className="m-0 grid list-none gap-3 p-0">{changes.map(change => <li key={`${change.role}:${change.permission}`} className="grid min-w-0 gap-3 rounded-xl border border-line bg-canvas p-4 sm:grid-cols-2"><div><span className="text-xs font-bold tracking-widest text-muted uppercase">{copy.roles[change.role]}</span><p className="mb-0 mt-1 font-semibold text-ink">{copy.labels[change.permission]}</p></div><dl className="m-0 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted">{copy.before}</dt><dd className="m-0 mt-1 font-semibold text-ink">{value(change.before)}</dd></div><div><dt className="text-muted">{copy.after}</dt><dd className="m-0 mt-1 font-semibold text-primary">{value(change.after)}</dd></div></dl></li>)}</ul>
   </section> : <>
    <nav aria-label={copy.rolesLabel} className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-paper p-2 sm:grid-cols-4">{workspaceRoles.map(option => <button key={option} type="button" aria-pressed={role === option} disabled={busy} onClick={() => setRole(option)} className={`min-h-11 cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold focus-visible:focus-ring ${role === option ? 'bg-primary text-paper' : 'text-muted hover:bg-canvas hover:text-ink'}`}>{copy.roles[option]}</button>)}</nav>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="m-0 text-xl font-semibold text-ink">{copy.roles[role]}</h2><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.roleHelp[role]} {copy.applies}</p></div><button type="button" disabled={disabled} onClick={() => { setStatus('idle'); setDraft(current => ({ ...current, grants: [...current.grants.filter(grant => grant.role !== role || !mutable(grant.permission)), ...defaultPolicy.grants.filter(grant => grant.role === role && mutable(grant.permission))] })); }} className={buttonClass}>{copy.reset}</button></div>
    <label className="grid gap-2 text-sm font-semibold text-ink" htmlFor={`${id}-search`}>{copy.search}<input id={`${id}-search`} type="search" value={search} disabled={busy} onChange={event => setSearch(event.target.value)} placeholder={copy.searchPlaceholder} className="min-h-11 w-full rounded-xl border border-line bg-paper px-4 py-3 font-normal text-ink focus-visible:focus-ring"/></label>
    <p className="m-0 text-sm leading-6 text-muted">{copy.availabilityHelp}</p>
    {groups.length === 0 && <p role="status" className="rounded-xl border border-line bg-paper p-6 text-muted">{copy.noResults}</p>}
    {groups.map(group => <section key={group.id} aria-labelledby={`${id}-${group.id}`} className="min-w-0 overflow-hidden rounded-2xl border border-line bg-paper"><h3 id={`${id}-${group.id}`} className="m-0 border-b border-line bg-canvas px-4 py-4 text-base font-semibold text-ink sm:px-6">{group.label}</h3><div className="divide-y divide-line">{group.permissions.map(permission => {
          const definition = spec(permission), scope = getScope(draft, role, permission), allowed = eligible(role, permission);
          const restriction = !allowed ? definition.eligibleRoles.length === 1 ? copy.ownerRestriction : copy.adminRestriction : definition.locked ? copy.locked : !definition.reviewed ? copy.unreviewed : !availablePermissions.includes(permission) ? copy.future : undefined;
          return <div key={permission} className="grid min-w-0 gap-3 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-6"><div className="min-w-0 flex-1"><label htmlFor={`${id}-${permission}`} className="text-sm font-semibold text-ink">{copy.labels[permission]}</label>{restriction && <p id={`${id}-${permission}-hint`} className="mb-0 mt-1 text-xs leading-5 text-muted">{restriction}</p>}{definition.dependencies.length > 0 && mutable(permission) && <p className="mb-0 mt-1 text-xs leading-5 text-muted">{copy.requires} {definition.dependencies.map(dependency => copy.labels[dependency as PermissionId]).join(', ')}</p>}</div><div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end">{scope && definition.scopes.length > 1 && <select aria-label={`${copy.labels[permission]} ${copy.scope}`} value={scope} disabled={disabled || !mutable(permission)} onChange={event => edit(permission, event.target.value as PermissionScope)} className="min-h-11 min-w-0 max-w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus-visible:focus-ring disabled:text-muted">{definition.scopes.map(option => <option key={option} value={option}>{copy.scopes[option]}</option>)}</select>}{scope && definition.scopes.length === 1 && scope !== 'enabled' && <span className="text-xs text-muted">{copy.scopes[scope]}</span>}<span className="relative inline-flex min-h-11 shrink-0 items-center"><input id={`${id}-${permission}`} type="checkbox" role="switch" checked={!!scope} aria-describedby={restriction ? `${id}-${permission}-hint` : undefined} disabled={disabled || !mutable(permission)} onChange={event => edit(permission, event.target.checked ? definition.defaults[role] ?? definition.scopes[0] : undefined)} className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"/><span aria-hidden="true" className="inline-flex h-6 w-11 items-center rounded-full border border-muted bg-muted p-0.5 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:focus-ring peer-disabled:opacity-50"><span className={`size-4 rounded-full bg-paper transition-transform motion-reduce:transition-none ${scope ? 'translate-x-5' : 'translate-x-0'}`}/></span></span></div></div>;
        })}</div></section>)}
    <p className="m-0 text-sm leading-6 text-muted">{copy.protectedHelp}</p>
   </>}
   <footer className={`${changes.length?'sticky bottom-4':'sm:sticky sm:bottom-4'} z-10 flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-4 shadow-lg sm:p-6`}><div className="min-w-0"><p role="status" className="m-0 text-sm font-semibold text-ink">{changes.length ? copy.pending(changes.length) : copy.clean}</p><p className="mb-0 mt-1 text-xs leading-5 text-muted">{copy.audit}</p></div><div className="flex w-full flex-wrap gap-3 sm:w-auto">{review ? <button type="button" disabled={busy} onClick={back} className={buttonClass}>{copy.back}</button> : <button type="button" disabled={busy || !changes.length} onClick={discard} className={buttonClass}>{copy.discard}</button>}<div className="min-w-0 flex-1 sm:flex-none"><SubmitButton ref={reviewButton} label={review ? copy.save : copy.review} pendingLabel={copy.saving} pending={busy} disabled={disabled || !changes.length || !validation.ok}/></div></div></footer>
  </form>
 </section>;
}
