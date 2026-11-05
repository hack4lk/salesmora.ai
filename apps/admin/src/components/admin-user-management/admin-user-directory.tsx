'use client';

import { useRef, type KeyboardEvent } from 'react';
import type { AdminCustomerUser, AdminCustomerUserStatus } from './admin-user-management.data';
import { adminUserManagementData as copy, getAdminCustomerUserStatus } from './admin-user-management.data';
import styles from './admin-user-management.module.css';

export interface AdminUserDirectoryProps {
  users: readonly AdminCustomerUser[];
  query: string;
  status: 'all' | AdminCustomerUserStatus;
  page: number;
  pageSize: number;
  total: number;
  preview?: boolean;
  loading?: boolean;
  error?: string;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: 'all' | AdminCustomerUserStatus) => void;
  onPageChange: (page: number) => void;
  onSelect: (userId: string) => void;
  onRetry?: () => void;
}

function displayDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? copy.unknownDate : new Intl.DateTimeFormat('en', {
    dateStyle: 'medium', timeZone: 'UTC',
  }).format(timestamp);
}

export function AdminUserDirectory({
  users, query, status, page, pageSize, total, preview = true, loading = false, error,
  onQueryChange, onStatusChange, onPageChange, onSelect, onRetry,
}: AdminUserDirectoryProps) {
  const statuses = Object.keys(copy.statuses) as Array<'all' | AdminCustomerUserStatus>;
  const statusTabs = useRef<Array<HTMLButtonElement | null>>([]);
  const pages = Math.ceil(total / pageSize);
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);

  function handleStatusKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % statuses.length;
        break;
      case 'ArrowLeft':
        nextIndex = (index - 1 + statuses.length) % statuses.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = statuses.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    statusTabs.current[nextIndex]?.focus();
    onStatusChange(statuses[nextIndex]);
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 id="admin-title">{copy.title}</h1>
          <p className={styles.description}>{copy.description}</p>
        </div>
      </header>

      <p className={styles.notice} role="note">{preview ? copy.previewNotice : copy.liveNotice}</p>
      <p className={styles.privacyNotice} role="note">{copy.privacyNotice}</p>

      <section className={styles.controls} aria-label="User search and filters">
        <label className={styles.search}>
          <span>{copy.search}</span>
          <input
            type="search"
            maxLength={254}
            value={query}
            placeholder={copy.searchPlaceholder}
            onChange={event => onQueryChange(event.currentTarget.value)}
          />
        </label>
        <div className={styles.statusFilters} role="tablist" aria-label={copy.statusFilter}>
          {statuses.map((value, index) => (
            <button
              key={value}
              id={`user-status-tab-${value}`}
              ref={element => { statusTabs.current[index] = element; }}
              type="button"
              role="tab"
              aria-selected={status === value}
              aria-controls="user-status-panel"
              tabIndex={status === value ? 0 : -1}
              onClick={() => onStatusChange(value)}
              onKeyDown={event => handleStatusKeyDown(event, index)}
            >
              {copy.statuses[value]}
            </button>
          ))}
        </div>
      </section>

      <div id="user-status-panel" role="tabpanel" aria-labelledby={`user-status-tab-${status}`} tabIndex={0}>
        {loading ? <p className={styles.empty} role="status">{copy.loading}</p> : error ? (
          <div className={styles.empty} role="alert">
            <p>{error}</p>
            {onRetry && <button className={styles.secondary} type="button" onClick={onRetry}>{copy.retry}</button>}
          </div>
        ) : total === 0 ? (
          <div className={styles.empty} role="status">
            <h2>{copy.emptyTitle}</h2>
            <p>{copy.emptyDescription}</p>
          </div>
        ) : (
          <section className={styles.panel} aria-labelledby="admin-title">
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">{copy.columns.user}</th>
                    <th scope="col">{copy.columns.status}</th>
                    <th scope="col">{copy.columns.workspaces}</th>
                    <th scope="col">{copy.columns.created}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const userStatus = getAdminCustomerUserStatus(user);
                    return (
                      <tr key={user.id}>
                        <td>
                          <button className={styles.userLink} type="button" onClick={() => onSelect(user.id)}>
                            <strong>{user.name}</strong>
                            <span>{user.maskedEmail}</span>
                          </button>
                          <span className={styles.userId}>{user.id}</span>
                        </td>
                        <td><span className={`${styles.badge} ${styles[userStatus]}`}>{copy.statusLabel(userStatus)}</span></td>
                        <td>
                          {user.memberships.length === 0 ? copy.noMemberships : (
                            <ul className={styles.memberships}>
                              {user.memberships.map(membership => (
                                <li key={membership.workspaceId}>
                                  <span>{membership.workspaceName}</span>
                                  <span className={styles.membershipRole}>{membership.role}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td>{displayDate(user.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <nav className={styles.pagination} aria-label={copy.pagination}>
              <p>{copy.results(start, end, total)}</p>
              <div>
                <button
                  className={styles.secondary}
                  type="button"
                  disabled={page <= 0 || loading}
                  onClick={() => onPageChange(page - 1)}
                >
                  {copy.previous}
                </button>
                <button
                  className={styles.secondary}
                  type="button"
                  disabled={page >= pages - 1 || loading}
                  onClick={() => onPageChange(page + 1)}
                >
                  {copy.next}
                </button>
              </div>
            </nav>
          </section>
        )}
      </div>
    </div>
  );
}
