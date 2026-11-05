'use client';

import { useCallback, useState } from 'react';
import type { AdminCustomerUser, AdminUserDetailSupplemental } from './admin-user-management.data';
import type { AdminCustomerUserPendingEmailChange } from '@salesmora/contracts';
import { adminUserManagementData as copy, getAdminCustomerUserStatus } from './admin-user-management.data';
import { AdminUserSuspension } from './admin-user-suspension';
import { AdminUserSessionActions } from './admin-user-session-actions';
import { AdminUserPasswordReset } from './admin-user-password-reset';
import { AdminUserEmailVerification } from './admin-user-email-verification';
import { AdminUserEmailChange } from './admin-user-email-change';
import { AdminUserPrivacy } from './admin-user-privacy';
import styles from './admin-user-management.module.css';

export interface AdminUserDetailProps {
  user?: AdminCustomerUser;
  supplemental?: AdminUserDetailSupplemental;
  loading?: boolean;
  error?: string;
  canSuspend?: boolean;
  canRequestPasswordReset?: boolean;
  canManageEmailVerification?: boolean;
  canChangeEmail?: boolean;
  canRevealPii?: boolean;
  canReadRelatedAudit?: boolean;
  pendingEmailChange?: AdminCustomerUserPendingEmailChange | null;
  canRevokeSessions?: boolean;
  sessionRefreshKey?: number;
  onBack: () => void;
  onRetry?: () => void;
  onSuspensionComplete?: () => void;
  onEmailVerificationComplete?: () => void;
  onEmailChangeComplete?: () => void;
  onSessionRevocationComplete?: () => void;
  onAccessError?: (status: number, message: string) => void;
}

function displayDate(value: string | null) {
  if (!value) return copy.unknownDate;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? copy.unknownDate : new Intl.DateTimeFormat('en', {
    dateStyle: 'medium', timeZone: 'UTC',
  }).format(timestamp);
}

export function AdminUserDetail({
  user, supplemental, loading = false, error, canSuspend = false, onBack, onRetry,
  onSuspensionComplete, onEmailVerificationComplete, onEmailChangeComplete, onSessionRevocationComplete, onAccessError,
  canRevokeSessions = true, sessionRefreshKey = 0,
  canRequestPasswordReset, canManageEmailVerification, canChangeEmail, canRevealPii, canReadRelatedAudit, pendingEmailChange,
}: AdminUserDetailProps) {
  const [privacyHistoryRefreshKey, setPrivacyHistoryRefreshKey] = useState(0);
  const refreshPrivacyHistory = useCallback(() => {
    setPrivacyHistoryRefreshKey(current => current + 1);
  }, []);

  return (
    <div className={styles.page}>
      <button className={`${styles.secondary} ${styles.backButton}`} type="button" onClick={onBack}>{copy.back}</button>
      {loading ? <p className={styles.empty} role="status">{copy.loadingDetail}</p> : error ? (
        <div className={styles.empty} role="alert">
          <p>{error}</p>
          {onRetry && <button className={styles.secondary} type="button" onClick={onRetry}>{copy.retry}</button>}
        </div>
      ) : !user ? (
        <div className={styles.empty} role="status"><p>{copy.detailUnavailable}</p></div>
      ) : (
        <>
          <header className={styles.pageHeader}>
            <div>
              <p className={styles.eyebrow}>{copy.eyebrow}</p>
              <h1 id="admin-title">{user.name}</h1>
              <p className={styles.description}>{copy.detailTitle}</p>
            </div>
          </header>
          <p className={styles.notice} role="note">
            {supplemental ? copy.liveDetailNotice : copy.liveNotice}
          </p>
          <p className={styles.privacyNotice} role="note">{copy.privacyNotice}</p>
          {onSuspensionComplete && onAccessError && (
            <AdminUserSuspension
              userId={user.id}
              name={user.name}
              maskedEmail={user.maskedEmail}
              suspended={Boolean(user.suspendedAt)}
              deletionPending={Boolean(user.deletionRequestedAt)}
              activeSessions={supplemental?.totalSessions ?? 0}
              ownsWorkspace={user.memberships.some(membership => membership.role === 'Owner')}
              canManage={canSuspend}
              onComplete={onSuspensionComplete}
              onAccessError={onAccessError}
            />
          )}
          <section className={styles.panel} aria-labelledby="profile-title">
            <div className={styles.panelHeader}><h2 id="profile-title">{copy.profile}</h2></div>
            <dl className={styles.profile}>
              <div><dt>{copy.userId}</dt><dd>{user.id}</dd></div>
              <div><dt>{copy.email}</dt><dd>{user.maskedEmail}</dd></div>
              <div><dt>{copy.status}</dt><dd>
                <span className={`${styles.badge} ${styles[getAdminCustomerUserStatus(user)]}`}>
                  {copy.statusLabel(getAdminCustomerUserStatus(user))}
                </span>
              </dd></div>
              <div><dt>{copy.emailVerified}</dt><dd>{user.emailVerified ? copy.verified : copy.notVerified}</dd></div>
              <div><dt>{copy.createdAt}</dt><dd>{displayDate(user.createdAt)}</dd></div>
            </dl>
          </section>
          {supplemental && onAccessError && (
            <AdminUserPrivacy
              key={user.id}
              userId={user.id}
              maskedEmail={user.maskedEmail}
              canReveal={canRevealPii ?? false}
              canReadHistory={canReadRelatedAudit ?? false}
              historyRefreshKey={privacyHistoryRefreshKey}
              onAccessError={onAccessError}
            />
          )}
          <section className={styles.panel} aria-labelledby="memberships-title">
            <div className={styles.panelHeader}>
              <h2 id="memberships-title">{copy.memberships}</h2>
              <span className={styles.badge}>{copy.membershipCount(user.memberships.length)}</span>
            </div>
            {user.memberships.length === 0 ? <p className={styles.empty}>{copy.noWorkspaces}</p> : (
              <ul className={styles.membershipList}>
                {user.memberships.map(membership => (
                  <li key={membership.workspaceId}>
                    <div><strong>{membership.workspaceName}</strong><span>{membership.workspaceId}</span></div>
                    <span className={styles.badge}>{membership.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {supplemental && (
            <>
              <section className={styles.panel} aria-labelledby="auth-methods-title">
                <div className={styles.panelHeader}><h2 id="auth-methods-title">{copy.authMethods}</h2></div>
                {supplemental.authMethods.length === 0 ? <p className={styles.empty}>{copy.noAuthMethods}</p> : (
                  <ul className={styles.supplementalList}>
                    {supplemental.authMethods.map(method => <li key={method}>{method}</li>)}
                  </ul>
                )}
              </section>
              {onEmailChangeComplete && onAccessError && (
                <AdminUserEmailChange
                  userId={user.id}
                  maskedEmail={user.maskedEmail}
                  pendingEmailChange={pendingEmailChange}
                  deletionPending={Boolean(user.deletionRequestedAt)}
                  canManage={canChangeEmail ?? false}
                  onComplete={onEmailChangeComplete}
                  onAccessError={onAccessError}
                />
              )}
              {!user.emailVerified &&
                onEmailVerificationComplete && onAccessError && (
                <AdminUserEmailVerification userId={user.id} name={user.name} maskedEmail={user.maskedEmail}
                  deletionPending={Boolean(user.deletionRequestedAt)}
                  canManage={canManageEmailVerification ?? false}
                  onComplete={onEmailVerificationComplete}
                  onAccessError={onAccessError} />
              )}
              {onAccessError && (
                <AdminUserPasswordReset userId={user.id} maskedEmail={user.maskedEmail}
                  authMethods={supplemental.authMethods} canManage={canRequestPasswordReset ?? false}
                  onAccessError={onAccessError} />
              )}
              {onSessionRevocationComplete && onAccessError ? (
                    <AdminUserSessionActions
                      key={user.id}
                      userId={user.id}
                      totalSessions={supplemental.totalSessions}
                      profileSessions={supplemental.sessions}
                      canManage={canRevokeSessions}
                      canRevealPii={canRevealPii ?? false}
                      refreshKey={sessionRefreshKey}
                      onComplete={onSessionRevocationComplete}
                      onPiiReveal={refreshPrivacyHistory}
                      onAccessError={onAccessError}
                    />
              ) : (
                <section className={styles.panel} aria-labelledby="sessions-title">
                  <div className={styles.panelHeader}><h2 id="sessions-title">{copy.sessions}</h2></div>
                  {supplemental.sessions.length === 0 ? <p className={styles.empty}>{copy.noSessions}</p> : (
                    <ul className={styles.supplementalList}>
                      {supplemental.sessions.map((session, index) => (
                        <li key={`${session.createdAt}:${index}`}>
                          <strong>{session.device}</strong>
                          <dl className={styles.sessionDetails}>
                            <div><dt>{copy.sessionIp}</dt><dd>{session.maskedIp ?? copy.unknownDate}</dd></div>
                            <div><dt>{copy.sessionCreated}</dt><dd>{displayDate(session.createdAt)}</dd></div>
                            <div><dt>{copy.lastActivity}</dt><dd>{displayDate(session.lastActivityAt)}</dd></div>
                          </dl>
                        </li>
                      ))}
                    </ul>
                  )}
                  {supplemental.totalSessions > supplemental.sessions.length && (
                    <p className={styles.sessionSummary}>
                      {copy.sessionsShown(supplemental.sessions.length, supplemental.totalSessions)}
                    </p>
                  )}
                </section>
              )}
              <section className={styles.panel} aria-labelledby="notification-preferences-title">
                <div className={styles.panelHeader}><h2 id="notification-preferences-title">{copy.notificationPreferences}</h2></div>
                {!supplemental.notificationPreferencesRecorded && (
                  <p className={styles.sessionSummary}>{copy.defaultNotificationPreferences}</p>
                )}
                <dl className={styles.preferenceList}>
                  {(Object.keys(copy.notificationPreferenceLabels) as Array<keyof typeof copy.notificationPreferenceLabels>)
                    .map(preference => (
                      <div key={preference}>
                        <dt>{copy.notificationPreferenceLabels[preference]}</dt>
                        <dd>{supplemental.notificationPreferences[preference] ? copy.enabled : copy.disabled}</dd>
                      </div>
                    ))}
                </dl>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
