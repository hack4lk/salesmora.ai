'use client';

import Link from 'next/link';
import { useRef, type KeyboardEvent } from 'react';
import type { AdminWorkspaceDirectoryItem } from '@salesmora/contracts';
import type {
  AdminWorkspacePlanFilter,
  AdminWorkspaceStatus,
} from './admin-workspace-management.data';
import { adminWorkspaceManagementData as copy } from './admin-workspace-management.data';
import styles from './admin-workspace-directory.module.css';

export interface AdminWorkspaceDirectoryViewProps {
  workspaces: readonly AdminWorkspaceDirectoryItem[];
  query: string;
  plan: 'all' | AdminWorkspacePlanFilter;
  status: 'all' | AdminWorkspaceStatus;
  page: number;
  pageSize: number;
  total: number;
  preview?: boolean;
  loading?: boolean;
  error?: string;
  onQueryChange: (query: string) => void;
  onPlanChange: (plan: 'all' | AdminWorkspacePlanFilter) => void;
  onStatusChange: (status: 'all' | AdminWorkspaceStatus) => void;
  onPageChange: (page: number) => void;
  onSelect?: (workspaceId: string) => void;
  onRetry?: () => void;
}

const statusValues = Object.keys(copy.statuses) as Array<'all' | AdminWorkspaceStatus>;

function displayDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? copy.createdUnknown : new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(timestamp);
}

export function AdminWorkspaceDirectoryView({
  workspaces,
  query,
  plan,
  status,
  page,
  pageSize,
  total,
  preview = true,
  loading = false,
  error,
  onQueryChange,
  onPlanChange,
  onStatusChange,
  onPageChange,
  onSelect,
  onRetry,
}: AdminWorkspaceDirectoryViewProps) {
  const statusTabs = useRef<Array<HTMLButtonElement | null>>([]);
  const pages = Math.ceil(total / pageSize);
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);

  function handleStatusKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % statusValues.length;
        break;
      case 'ArrowLeft':
        nextIndex = (index - 1 + statusValues.length) % statusValues.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = statusValues.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    statusTabs.current[nextIndex]?.focus();
    onStatusChange(statusValues[nextIndex]);
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

      <section className={styles.controls} aria-label="Workspace search and filters">
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
        <label className={styles.planFilter}>
          <span>{copy.planFilter}</span>
          <select
            value={plan}
            onChange={event => onPlanChange(event.currentTarget.value as 'all' | AdminWorkspacePlanFilter)}
          >
            {Object.entries(copy.plans).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <div className={styles.statusFilters} role="tablist" aria-label={copy.statusFilter}>
          {statusValues.map((value, index) => (
            <button
              key={value}
              id={`workspace-status-tab-${value}`}
              ref={element => { statusTabs.current[index] = element; }}
              type="button"
              role="tab"
              aria-selected={status === value}
              aria-controls="workspace-status-panel"
              tabIndex={status === value ? 0 : -1}
              onClick={() => onStatusChange(value)}
              onKeyDown={event => handleStatusKeyDown(event, index)}
            >
              {copy.statuses[value]}
            </button>
          ))}
        </div>
      </section>

      <div id="workspace-status-panel" role="tabpanel" aria-labelledby={`workspace-status-tab-${status}`} tabIndex={0}>
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
                    <th scope="col">{copy.columns.workspace}</th>
                    <th scope="col">{copy.columns.owner}</th>
                    <th scope="col">{copy.columns.plan}</th>
                    <th scope="col">{copy.columns.status}</th>
                    <th scope="col">{copy.columns.members}</th>
                    <th scope="col">{copy.columns.created}</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map(workspace => (
                    <tr key={workspace.id}>
                      <td>
                        {onSelect ? (
                          <button className={styles.workspaceLink} type="button" onClick={() => onSelect(workspace.id)}>
                            <strong>{workspace.name}</strong>
                            <span>{workspace.id}</span>
                          </button>
                        ) : !preview ? (
                          <Link className={styles.workspaceLink} href={`/workspaces/${encodeURIComponent(workspace.id)}`}>
                            <strong>{workspace.name}</strong>
                            <span>{workspace.id}</span>
                          </Link>
                        ) : (
                          <div className={styles.workspaceText}>
                            <strong>{workspace.name}</strong>
                            <span>{workspace.id}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={styles.ownerName}>{workspace.ownerName}</span>
                        <span className={styles.ownerEmail}>
                          {workspace.maskedOwnerEmail}
                        </span>
                      </td>
                      <td>
                        <span className={styles.plan}>{copy.plans[workspace.plan]}</span>
                        {workspace.overridePlan && (
                          <span className={styles.override}>
                            {copy.override}: {copy.plans[workspace.overridePlan]}
                          </span>
                        )}
                      </td>
                      <td><span className={`${styles.badge} ${styles[workspace.status]}`}>
                        {copy.statusLabel(workspace.status)}
                      </span></td>
                      <td>{copy.membershipCount(workspace.memberCount)}</td>
                      <td>{displayDate(workspace.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav className={styles.pagination} aria-label={copy.pagination}>
              <p>{copy.results(start, end, total)}</p>
              <div>
                <button className={styles.secondary} type="button" disabled={page <= 0 || loading}
                  onClick={() => onPageChange(page - 1)}>
                  {copy.previous}
                </button>
                <button className={styles.secondary} type="button" disabled={page >= pages - 1 || loading}
                  onClick={() => onPageChange(page + 1)}>
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
