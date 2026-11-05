'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { FormFeedback, MoreHorizOutlined } from '@salesmora/ui';
import { CaptureDashboardSummary } from '../capture-dashboard-summary/capture-dashboard-summary';
import { captureDashboardSummaryData as summaryCopy } from '../capture-dashboard-summary/capture-dashboard-summary.data';
import { validCaptureIntakeHref, type CaptureSourceTotals } from '../capture-dashboard-summary/capture-dashboard-summary.validation';
import { CaptureSourceDetails } from '../capture-source-details/capture-source-details';
import { CapturePublicationInstructions } from '../capture-publication-instructions/capture-publication-instructions';
import type { CapturePublication } from '../capture-publication-instructions/capture-publication-instructions.validation';
import { captureDashboardPageData as copy } from './capture-dashboard-page.data';
import { captureDashboardActions, captureDashboardPublication, validCaptureDashboardRecord, type CaptureDashboardAction, type CaptureDashboardRecord } from './capture-dashboard-page.validation';
export type CaptureDashboardTab = keyof typeof copy.tabs;
export type CaptureDashboardPageProps = {
  source: CaptureDashboardRecord; totals?: CaptureSourceTotals; publication: CapturePublication | null; tab: CaptureDashboardTab;
  canRead: boolean; canEdit: boolean; canManageConnection: boolean; canReadPublication: boolean; canReadIntake: boolean; intakeHref?: string;
  state?: 'ready' | 'loading' | 'error'; totalsState?: 'ready' | 'loading' | 'error'; pending?: boolean;
  onTab: (tab: CaptureDashboardTab) => void; onBack: () => void; onRetry: () => void; onRetryTotals: () => void;
  onEdit: (source: CaptureDashboardRecord) => void; onManageConnection: (source: CaptureDashboardRecord) => void;
  /** Opens a review dialog only. The host owns frozen snapshots and authorized mutations. */
  onAction: (source: CaptureDashboardRecord, action: CaptureDashboardAction) => void; onCopy?: (text: string) => Promise<void>; dialogs?: ReactNode;
};
const button = 'min-h-11 max-w-full cursor-pointer rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50';
function CaptureDashboardActionsMenu({ source, pending, onAction, canReadIntake, intakeHref }: { source: CaptureDashboardRecord; pending: boolean; canReadIntake: boolean; intakeHref?: string; onAction: CaptureDashboardPageProps['onAction'] }) {
  const id = useId(), [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const requested = useRef<{ source: CaptureDashboardRecord; action: CaptureDashboardAction } | null>(null);
  const actions = captureDashboardActions(source);
  const intakeAvailable = canReadIntake && validCaptureIntakeHref(intakeHref);
  if (!actions.length && !intakeAvailable) return null;
  return <>
    <button type="button" id={`${id}-trigger`} aria-label={copy.actionsLabel} aria-haspopup="menu" aria-expanded={!!anchor && !pending} aria-controls={anchor ? `${id}-menu` : undefined} disabled={pending} onClick={event => { if (!pending) { requested.current = null; setAnchor(event.currentTarget); } }} className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"><MoreHorizOutlined aria-hidden="true" /></button>
    <Menu id={`${id}-menu`} anchorEl={anchor} open={!!anchor && !pending} onClose={() => { requested.current = null; setAnchor(null); }} slotProps={{ paper: { className: 'rounded-xl border border-line bg-paper text-ink' }, list: { 'aria-labelledby': `${id}-trigger` }, transition: { onExited: () => {
      const next = requested.current; requested.current = null;
      if (next && !pending && source.id === next.source.id && source.version === next.source.version && captureDashboardActions(source).includes(next.action)) onAction(next.source, next.action);
    } } }}>
      {intakeAvailable && <MenuItem component="a" href={intakeHref} disabled={pending} className="min-h-11 whitespace-normal text-sm text-ink focus-visible:focus-ring" onClick={() => { requested.current = null; setAnchor(null); }}>{summaryCopy.review}</MenuItem>}
      {actions.map(action => <MenuItem key={action} disabled={pending} className="min-h-11 whitespace-normal text-sm text-ink focus-visible:focus-ring" onClick={() => { if (!pending) { requested.current = { source: structuredClone(source), action }; setAnchor(null); } }}>{copy.actions[action]}</MenuItem>)}
    </Menu>
  </>;
}
export function CaptureDashboardPage(props: CaptureDashboardPageProps) {
  const { source, canRead, pending = false, state = 'ready' } = props;
  const tabsId = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const busy = pending || state !== 'ready', publicationAllowed = source.type === 'website' && props.canReadPublication;
  const tab = props.tab === 'publication' && !publicationAllowed ? 'settings' : props.tab;
  const actionsMenu = <CaptureDashboardActionsMenu key={`${source.id}-${source.version}`} source={source} pending={pending} onAction={props.onAction} canReadIntake={props.canReadIntake} intakeHref={props.intakeHref} />;
  return <div className="grid min-w-0 gap-6">
    <header className="flex min-w-0 flex-wrap items-start justify-between gap-4"><div className="grid min-w-0 gap-2"><h1 className="m-0 text-heading font-semibold">{copy.title}</h1>{state === 'ready' && validCaptureDashboardRecord(source) && <p className="m-0 text-sm font-semibold wrap-anywhere">{source.name}</p>}</div><div className="flex items-center gap-3"><button type="button" className={button} disabled={pending} onClick={() => { if (!pending) props.onBack(); }}>{copy.back}</button>{state === 'ready' && validCaptureDashboardRecord(source) && actionsMenu}</div></header>
    {state === 'loading' ? <p role="status" aria-busy="true" className="m-0 text-sm text-muted">{copy.loading}</p> : state === 'error' || !validCaptureDashboardRecord(source) ? <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message={state === 'error' ? copy.error : copy.invalid} /><button type="button" className={button} disabled={pending} onClick={props.onRetry}>{copy.retry}</button></div> : <>
      <div role="tablist" aria-label={copy.tabsLabel} className="flex min-w-0 border-b border-line">{(Object.keys(copy.tabs) as CaptureDashboardTab[]).filter(key => key !== 'publication' || publicationAllowed).map(key => <button key={key} id={`${tabsId}-${key}`} role="tab" aria-selected={tab === key} aria-controls={`${tabsId}-panel`} tabIndex={tab === key ? 0 : -1} type="button" disabled={busy}
        className={`min-h-12 min-w-0 flex-1 cursor-pointer border-b-2 px-1 py-3 text-center text-sm font-semibold wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-6 ${tab === key ? 'border-primary bg-paper text-primary' : 'border-transparent text-muted hover:bg-paper/60 hover:text-ink'}`}
        onClick={() => { if (!busy) props.onTab(key); }} onKeyDown={event => {
          if (busy || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const tabs = Array.from(event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
          const index = tabs.indexOf(event.currentTarget), next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          tabs[next].focus(); tabs[next].click();
        }}>{copy.tabs[key]}</button>)}</div>
      <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${tab}`} tabIndex={0} className="grid min-w-0 gap-6 focus-visible:focus-ring">
        {tab === 'overview' ? <CaptureDashboardSummary source={source} totals={props.totals} state={props.totalsState} canRead canReadIntake={false} onRetry={pending ? undefined : props.onRetryTotals} /> : tab === 'settings' ? <CaptureSourceDetails source={source} configuration={source.configuration} draftVersion={source.draftVersion} availability={source.availability} canRead canEdit={props.canEdit} canManageConnection={props.canManageConnection} canReadPublication={props.canReadPublication} pending={pending} onEdit={() => { if (!pending && props.canEdit && source.status !== 'archived') props.onEdit(structuredClone(source)); }} onManageConnection={() => { if (!pending && props.canManageConnection && source.type === 'gmail' && source.status !== 'archived') props.onManageConnection(structuredClone(source)); }} onViewPublication={() => { if (!pending && publicationAllowed) props.onTab('publication'); }} /> : source.configuration.kind === 'draft' || captureDashboardPublication(source, props.publication) ? <CapturePublicationInstructions key={`${source.id}-${source.configuration.version}`} publication={source.configuration.kind === 'draft' ? null : props.publication} canRead pending={pending} onCopy={props.onCopy} /> : <div className="grid justify-items-start gap-3"><FormFeedback kind="error" message={copy.publicationInvalid} /><button type="button" className={button} disabled={pending} onClick={props.onRetry}>{copy.retry}</button></div>}
      </div>
      {props.dialogs}
    </>}
  </div>;
}
