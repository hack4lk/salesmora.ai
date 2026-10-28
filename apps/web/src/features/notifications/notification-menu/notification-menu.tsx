'use client';

import { useId, useState } from 'react';
import Popover from '@mui/material/Popover';
import { FormFeedback, NotificationsNoneOutlined, StatusBadge } from '@salesmora/ui';
import { notificationMenuData as copy } from './notification-menu.data';

export type NotificationMenuItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  /** Already-authorized display values only; no hidden linked records or aggregate counts. */
  details?: readonly { label: string; value: string }[];
  recordLabels?: readonly string[];
  /** Server-resolved, currently authorized workspace-scoped destination. */
  href: string;
  /** Defaults to the lead link label. */
  actionLabel?: string;
};
export type NotificationMenuProps = {
  workspaceName: string;
  unreadCount: number | null;
  items: readonly NotificationMenuItem[];
  state: 'ready' | 'loading' | 'error';
  preferencesHref: string;
  pendingId?: string;
  actionError?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onOpen: () => void;
  onRetry: () => void;
  onMarkRead: (id: string) => void;
  onLoadMore: () => void;
};
const buttonClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:text-muted';
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

/** Presentation only: caller must scope all counts/items and recheck read authority on navigation. */
export function NotificationMenu({ workspaceName, unreadCount, items, state, preferencesHref, pendingId, actionError = false, hasMore = false, loadingMore = false, onOpen, onRetry, onMarkRead, onLoadMore }: NotificationMenuProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const count = unreadCount !== null && Number.isSafeInteger(unreadCount) && unreadCount >= 0 ? unreadCount : null;
  return <>
    <button type="button" aria-label={copy.open(count)} aria-haspopup="dialog" aria-expanded={!!anchor} aria-controls={anchor ? `${id}-panel` : undefined}
      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-primary hover:bg-canvas focus-visible:focus-ring"
      onClick={event => { setAnchor(event.currentTarget); onOpen(); }}>
      <NotificationsNoneOutlined aria-hidden="true"/>
      {count !== null && count > 0 && <span aria-hidden="true" className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-paper">{count > 99 ? copy.cappedCount : count}</span>}
    </button>
    <Popover anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { id: `${id}-panel`, role: 'dialog', 'aria-modal': true, 'aria-labelledby': `${id}-title`, 'aria-describedby': `${id}-workspace`, className: 'w-full rounded-2xl border border-line bg-paper text-ink sm:w-112' } }}>
      <header className="flex items-start justify-between gap-4 border-b border-line p-4 sm:p-6">
        <div className="min-w-0"><h2 id={`${id}-title`} className="m-0 text-xl font-semibold text-ink">{copy.title}</h2><p id={`${id}-workspace`} className="mb-0 mt-2 text-sm text-muted wrap-anywhere">{workspaceName}</p></div>
        <button type="button" autoFocus onClick={() => setAnchor(null)} className={buttonClass}>{copy.close}</button>
      </header>
      <div className="max-h-96 overflow-y-auto overscroll-contain p-4 sm:p-6" aria-busy={state === 'loading'}>
        {state === 'loading' ? <p role="status" className="m-0 text-sm leading-6 text-muted">{copy.loading}</p> : state === 'error' ? <div className="grid gap-4"><FormFeedback kind="error" title={copy.loadErrorTitle} message={copy.loadError}/><button type="button" className={buttonClass} onClick={onRetry}>{copy.retry}</button></div> : <div className="grid min-w-0 gap-4">
          {actionError && <FormFeedback kind="error" title={copy.actionErrorTitle} message={copy.actionError}/>}
          {!items.length ? <div><h3 className="m-0 text-base font-semibold text-ink">{copy.emptyTitle}</h3><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.empty}</p></div> : <ul className="m-0 grid min-w-0 list-none gap-3 p-0">{items.map(item => {
            const date = new Date(item.createdAt);
            const validDate = Number.isFinite(date.getTime());
            return <li key={item.id} className={`min-w-0 rounded-xl border p-4 ${item.read ? 'border-line bg-paper' : 'border-primary/30 bg-canvas'}`}>
              <div className="mb-3 flex flex-wrap items-center gap-2"><StatusBadge label={item.read ? copy.read : copy.unread} tone={item.read ? 'neutral' : 'info'}/>{validDate ? <time dateTime={date.toISOString()} className="text-xs leading-5 text-muted">{copy.timestamp(dateFormatter.format(date))}</time> : <span className="text-xs text-muted">{copy.unknownDate}</span>}</div>
              <h3 className="m-0 text-base font-semibold text-ink wrap-anywhere">{item.title}</h3>
              <p className="mb-0 mt-2 text-sm leading-6 text-muted wrap-anywhere">{item.description}</p>
              {item.details && item.details.length > 0 && <dl className="mb-0 mt-3 grid min-w-0 gap-3 rounded-lg border border-line bg-paper p-3 text-sm">{item.details.map(detail => <div key={detail.label} className="min-w-0"><dt className="font-semibold text-muted">{detail.label}</dt><dd className="m-0 mt-1 wrap-anywhere">{detail.value}</dd></div>)}</dl>}
              {item.recordLabels && item.recordLabels.length > 0 && <section aria-label={copy.visitRecords} className="mt-3 grid min-w-0 gap-2"><h4 className="m-0 text-sm font-semibold">{copy.visitRecords}</h4><ul className="m-0 grid min-w-0 list-none gap-1 p-0 text-sm">{item.recordLabels.map(label => <li key={label} className="wrap-anywhere">{label}</li>)}</ul></section>}
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={item.href} onClick={() => setAnchor(null)} className={buttonClass}>{item.actionLabel ?? copy.view}</a>
                {!item.read && <button type="button" disabled={!!pendingId} aria-busy={pendingId === item.id} onClick={() => { if (!pendingId) onMarkRead(item.id); }} className={buttonClass}>{pendingId === item.id ? copy.marking : copy.markRead}</button>}
              </div>
            </li>;
          })}</ul>}
          {hasMore && <button type="button" disabled={loadingMore} className={buttonClass} onClick={() => { if (!loadingMore) onLoadMore(); }}>{loadingMore ? copy.loadingOlder : copy.older}</button>}
        </div>}
      </div>
      <footer className="border-t border-line p-4 sm:px-6"><a href={preferencesHref} onClick={() => setAnchor(null)} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.preferences}</a></footer>
    </Popover>
  </>;
}
