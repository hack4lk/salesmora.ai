'use client';

import { useEffect, useState } from 'react';
import { staffRoleCatalog, staffRoleIds, staffRoleIdSchema, type StaffRoleId } from '@salesmora/contracts';
import { BrandProvider } from '@salesmora/ui';
import { StaffActionReview, type StaffAccessAction, type StaffActionReviewProps } from '../staff-action-review/staff-action-review';
import { staffAccountControlsData as copy, type StaffAccountPreview } from './staff-account-controls.data';

export interface StaffAccountControlsProps {
  accounts?: readonly StaffAccountPreview[];
  reviewer?: { id: string; role: StaffRoleId };
  onVerifyPassword?: StaffActionReviewProps['onVerifyPassword'];
  onVerifyFactor?: StaffActionReviewProps['onVerifyFactor'];
  onAction?: (action: StaffAccessAction) => void;
  preview?: boolean;
  embedded?: boolean;
}

const buttonClass = 'min-h-11 cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';

export function StaffAccountControls({ accounts: initial = copy.accounts, reviewer = { id: 'jordan', role: 'super_admin' },
  onVerifyPassword, onVerifyFactor, onAction, preview = true, embedded = false }: StaffAccountControlsProps) {
  const [accounts, setAccounts] = useState([...initial]);
  const [roles, setRoles] = useState<Record<string, StaffRoleId>>({});
  const [action, setAction] = useState<StaffAccessAction | null>(null);
  const [notice, setNotice] = useState('');
  const [requests, setRequests] = useState<{ id: string; email: string; expiresAt: number }[]>([]);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const activeSuperAdmins = accounts.filter(account => account.active && account.role === 'super_admin').length;

  function review(account: StaffAccountPreview, kind: 'disable' | 'enable' | 'role_change') {
    setNotice('');
    const next: StaffAccessAction = { kind, email: account.email, userId: account.id, currentRole: account.role,
      role: kind === 'role_change' ? roles[account.id] ?? account.role : account.role, active: account.active, activeSuperAdmins, expectedVersion: account.version ?? 0 };
    if (!preview) {
      if (!onAction) throw new Error('Live account controls require an action handler.');
      onAction(next);
    } else {
      if (!onVerifyPassword || !onVerifyFactor) throw new Error('Preview account controls require verification handlers.');
      setAction(next);
    }
  }

  return <BrandProvider><div className="grid min-w-0 gap-5 text-ink">
    {!embedded && <header><h1 id="admin-title">{copy.title}</h1><p>{copy.description}</p></header>}
    <p role="note" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6">{preview ? copy.notice : copy.liveNotice}</p>
    {notice && <p role="status" className="m-0 text-sm">{notice}</p>}
    {accounts.length === 0 && <p>{copy.empty}</p>}
    {accounts.map(account => <section key={account.id} aria-label={account.email} className="grid min-w-0 gap-4 rounded-xl border border-line p-4">
      <div className="min-w-0"><h2 className="m-0 text-lg font-semibold">{account.name}</h2>
        <p className="m-0 text-sm wrap-anywhere">{account.email}</p>
        <p className="m-0 text-sm">{staffRoleCatalog[account.role].label} · {account.active ? copy.active : copy.disabled}</p></div>
      {account.factors && <p className="m-0 text-sm">{account.factors.join(', ')} · {account.lastActive}</p>}
      <div className="flex flex-wrap items-end gap-3">
        {!preview && <a className={buttonClass} href={`/audit#q=${encodeURIComponent(account.id)}`}>{copy.auditHistory}</a>}
        <button type="button" className={buttonClass} onClick={() => review(account, account.active ? 'disable' : 'enable')}>
          {account.active ? copy.disable : copy.enable}
        </button>
        {account.active && <>
          <label className="grid gap-2 text-sm font-semibold">{copy.role}
            <select className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink focus-visible:focus-ring"
              value={roles[account.id] ?? account.role} onChange={event => {
                const value = staffRoleIdSchema.parse(event.target.value);
                setRoles(current => ({ ...current, [account.id]: value }));
              }}>
              {staffRoleIds.map(role => <option key={role} value={role}>{staffRoleCatalog[role].label}</option>)}
            </select>
          </label>
          <button type="button" className={buttonClass} disabled={(roles[account.id] ?? account.role) === account.role}
            onClick={() => review(account, 'role_change')}>{copy.change}</button>
        </>}
      </div>
    </section>)}
    {requests.map(request => <section key={request.id} aria-label={`${copy.requestLabel}: ${request.email} (${request.id})`} className="rounded-xl border border-line p-4">
      <h2 className="m-0 text-lg font-semibold wrap-anywhere">{request.email}</h2>
      <p className="text-sm">{request.expiresAt <= now ? copy.requestExpired : copy.pending}</p>
    </section>)}
    {action && onVerifyPassword && onVerifyFactor && <StaffActionReview action={action} reviewer={reviewer} methods={['passkey', 'totp']}
      onVerifyPassword={onVerifyPassword} onVerifyFactor={onVerifyFactor} onClose={() => setAction(null)}
      onConfirm={async ({ action: confirmed }) => {
        if (confirmed.kind !== 'disable' && confirmed.kind !== 'enable' && confirmed.kind !== 'role_change') {
          return { ok: false, message: copy.reviewFailed };
        }
        const target = accounts.find(account => account.id === confirmed.userId);
        if (!target || target.role !== confirmed.currentRole || target.active !== confirmed.active) {
          return { ok: false, message: copy.reviewFailed };
        }
        if (confirmed.kind !== 'disable' && confirmed.role === 'super_admin') {
          setRequests(current => [...current, { id: `${confirmed.userId}-${current.length}`, email: confirmed.email, expiresAt: Date.now() + 300000 }]);
          setNotice(copy.pending);
        } else {
          setAccounts(current => current.map(account => account.id === confirmed.userId
            ? { ...account, role: confirmed.role, active: confirmed.kind !== 'disable' } : account));
          setNotice(copy.completed);
        }
        return { ok: true };
      }} />}
  </div></BrandProvider>;
}
