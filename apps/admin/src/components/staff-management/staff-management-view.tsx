'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { staffEmailSchema, staffEmailDomain, staffRoleIds, staffRoleCatalog, type StaffRoleId, type StaffManagementSnapshot } from '@salesmora/contracts';
import type { StaffAccessAction } from '../staff-action-review/staff-action-review';
import {
  staffManagementData as copy,
  type StaffInvitationPreview,
  type StaffMemberPreview,
} from './staff-management.data';
import styles from './staff-management.module.css';

export interface StaffManagementViewProps {
  staff: readonly StaffMemberPreview[];
  invitations: readonly StaffInvitationPreview[];
  approvals: StaffManagementSnapshot['approvals'];
  onAction: (action: StaffAccessAction) => void;
  onRetryDelivery: (invitationId: string) => void;
  pendingDeliveryId?: string;
  accountControls: ReactNode;
}

function roleLabel(role: StaffRoleId | null) {
  return role === null ? copy.noRole : staffRoleCatalog[role].label;
}

export function StaffManagementView({
  staff,
  invitations,
  approvals,
  onAction,
  onRetryDelivery,
  pendingDeliveryId,
  accountControls,
}: StaffManagementViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRoleId>('support');
  const [notice, setNotice] = useState('');
  const listedStaff = staff.filter(member => member.role === null);

  function closeForm() {
    setShowForm(false);
    setEmail('');
    setRole('support');
  }

  function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = staffEmailSchema.safeParse(email);
    if (!parsed.success) {
      setNotice(`Enter a valid @${staffEmailDomain} staff email address.`);
      return;
    }
    onAction({ kind: 'invite', email: parsed.data, role });
    closeForm();
  }

  function revokeInvitation(invitation: StaffInvitationPreview) {
    onAction({
      kind: 'revoke',
      email: invitation.email,
      role: invitation.role,
      invitationId: invitation.id,
    });
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Access administration</p>
          <h1 id="admin-title">{copy.title}</h1>
          <p className={styles.description}>{copy.liveDescription}</p>
        </div>
        <button className={styles.primary} type="button" onClick={() => { setNotice(''); setShowForm(true); }}>
          Invite staff
        </button>
      </header>

      <div className={styles.notice} role="note">{copy.liveNotice}</div>
      {notice && <p className={styles.statusMessage} role="status">{notice}</p>}

      {showForm && (
        <section className={styles.formPanel} aria-labelledby="invite-heading">
          <div className={styles.panelHeader}>
            <div>
              <h2 id="invite-heading">{copy.invitationForm.title}</h2>
              <p>Invitations expire after 24 hours and can be accepted once.</p>
            </div>
            <button className={styles.close} type="button" onClick={closeForm} aria-label="Close invitation form">×</button>
          </div>
          <form className={styles.form} onSubmit={submitInvitation}>
            <label htmlFor="staff-invite-email">{copy.invitationForm.emailLabel}</label>
            <input id="staff-invite-email" type="email" autoComplete="email" placeholder={`name@${staffEmailDomain}`}
              required value={email}
              onChange={event => setEmail(event.target.value)} />
            <span className={styles.hint}>{copy.invitationForm.emailHint}</span>
            <label htmlFor="staff-invite-role">{copy.invitationForm.roleLabel}</label>
            <select id="staff-invite-role" value={role} onChange={event => setRole(event.target.value as StaffRoleId)}>
              {staffRoleIds.map(roleId => <option key={roleId} value={roleId}>{roleLabel(roleId)}</option>)}
            </select>
            {role === 'super_admin' && <p className={styles.approvalNotice}>{copy.invitationForm.superAdminNotice}</p>}
            <div className={styles.formActions}>
              <button className={styles.secondary} type="button" onClick={closeForm}>Cancel</button>
              <button className={styles.primary} type="submit">
                {role === 'super_admin' ? copy.invitationForm.requestApproval : copy.reviewInvite}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className={styles.panel} aria-labelledby="staff-list-heading">
        <div className={styles.panelHeader}>
          <div><h2 id="staff-list-heading">Staff accounts</h2><p>{staff.length} staff members</p></div>
        </div>
        {accountControls}
        {listedStaff.length > 0 && <div className={styles.tableWrap}>
          <table>
            <thead><tr>
              <th scope="col">Staff member</th><th scope="col">Role</th><th scope="col">Status</th>
              <th scope="col">Second factors</th><th scope="col">Last activity</th>
            </tr></thead>
            <tbody>{listedStaff.map(member => (
              <tr key={member.id}>
                <td><strong>{member.name}</strong><span className={styles.subtext}>{member.email}</span></td>
                <td>{roleLabel(member.role)}</td>
                <td><span className={`${styles.badge} ${member.status === 'active' ? styles.active : styles.suspended}`}>
                  {member.status === 'active' ? 'Active' : member.status === 'no_access' ? copy.noAccess : 'Suspended'}
                </span></td>
                <td>{member.factors.join(', ')}</td><td>{member.lastActive}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
        {listedStaff.length === 0 && <p className={styles.empty}>No staff accounts without an active role.</p>}
      </section>

      <section className={styles.panel} aria-labelledby="invitation-list-heading">
        <div className={styles.panelHeader}>
          <div><h2 id="invitation-list-heading">Invitations</h2><p>Pending invitations and recent invitation outcomes.</p></div>
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr>
              <th scope="col">Staff email</th><th scope="col">Role</th><th scope="col">Status</th>
              <th scope="col">Expiry / activity</th><th scope="col"><span className={styles.srOnly}>Actions</span></th>
            </tr></thead>
            <tbody>{invitations.map(invitation => (
              <tr key={invitation.id}>
                <td>{invitation.email}{invitation.delivery && <span className={styles.subtext}>{copy.deliveryLabels[invitation.delivery]}</span>}</td>
                <td>{roleLabel(invitation.role)}</td>
                <td><span className={`${styles.badge} ${styles[invitation.status]}`}>
                  {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                </span></td>
                <td>{invitation.expires}</td>
                <td className={styles.actionCell}>
                  {invitation.status === 'pending' && (invitation.delivery === 'failed' || invitation.delivery === 'pending') &&
                    <button className={styles.secondary} type="button" disabled={Boolean(pendingDeliveryId)}
                      onClick={() => onRetryDelivery(invitation.id)}>{copy.retryEmail}</button>}
                  {invitation.status === 'pending'
                    ? <button className={styles.action} type="button" onClick={() => revokeInvitation(invitation)}>Revoke</button>
                    : <span className={styles.mutedAction}>—</span>}
                </td>
              </tr>
            ))}{invitations.length === 0 && (
              <tr><td className={styles.empty} colSpan={5}>No invitations yet. Invite a staff member to get started.</td></tr>
            )}</tbody>
          </table>
        </div>
      </section>

      {approvals.length > 0 && (
        <section className={styles.panel} aria-labelledby="approvals-heading">
          <div className={styles.panelHeader}><div>
            <h2 id="approvals-heading">Super Admin approval requests</h2>
            <p>These invitations are held until another authorized staff member approves.</p>
          </div></div>
          <ul className={styles.approvalList}>{approvals.map(request => <li key={request.id}>
            <span><strong>{request.email}</strong><small>{request.requestedBy.name} · {copy.approvalStatuses[request.status]} · {request.expiresAt}</small></span>
            {request.status === 'pending' && <button className={styles.secondary} type="button" onClick={() => onAction({
              kind: 'approval', email: request.email, role: 'super_admin', requestId: request.id,
              requestedBy: request.requestedBy, expiresAt: request.expiresAt,
              ...(request.accountChange ? { accountChange: request.accountChange } : {}),
            })}>{copy.reviewApproval}</button>}
          </li>)}</ul>
        </section>
      )}
    </div>
  );
}
