"use client";

import { useEffect, useId, useRef, useState, type RefObject, type ReactNode } from "react";
import { LeadSearchResultsCard, type LeadSearchResultSet } from '../lead-search-results-card/lead-search-results-card';
import { LeadActivityCard, type LeadActivityResult } from '../lead-activity-card/lead-activity-card';
import { LeadDetailsCard, type LeadDetailsResult } from '../lead-details-card/lead-details-card';
import { ChatBubbleOutlined } from "../../icons";
import { FormFeedback } from "../../forms/form-feedback/form-feedback";
import { SubmitButton } from "../../forms/submit-button/submit-button";
import { LeadDeleteDraftCard, type LeadDeleteProposal } from '../lead-delete-draft-card/lead-delete-draft-card';
import { LeadExportDraftCard, type LeadExportProposal } from '../lead-export-draft-card/lead-export-draft-card';
import { LeadArchiveDraftCard, type LeadArchiveProposal } from '../lead-archive-draft-card/lead-archive-draft-card';
import { LeadNoteDraftCard, type LeadNoteProposal } from '../lead-note-draft-card/lead-note-draft-card';
import { LeadAssignmentDraftCard, type LeadAssignmentProposal } from '../lead-assignment-draft-card/lead-assignment-draft-card';
import { LeadUpdateDraftCard, type LeadUpdateProposal } from '../lead-update-draft-card/lead-update-draft-card';
import { LeadStageDraftCard, type LeadStageProposal } from '../lead-stage-draft-card/lead-stage-draft-card';
import { LeadDraftCard, type LeadDraftProposal, type LeadDraftCardProps } from '../lead-draft-card/lead-draft-card';
import { ContextChip } from '../context-chip/context-chip';
import { assistantPanelData as copy } from "./assistant-panel.data";

export interface AssistantSource { slug: string; anchor: string; title: string; heading: string; href: string }
export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  interrupted?: boolean;
  searchResult?: LeadSearchResultSet;
  detailsResult?: LeadDetailsResult;
  historyResult?: LeadActivityResult;
  sources?: readonly AssistantSource[];
  action?: (LeadDeleteProposal & { actionType: 'lead.delete' }) | (LeadExportProposal & { actionType: 'lead.export' }) | (LeadArchiveProposal & { actionType: 'lead.archive' }) | (LeadNoteProposal & { actionType: 'lead.note' }) | (LeadAssignmentProposal & { actionType: 'lead.assign' }) | (LeadUpdateProposal & { actionType: 'lead.update' }) | LeadDraftProposal | (LeadStageProposal & { actionType: 'lead.stage' });
}

export interface AssistantPanelProps {
  /** Host-owned presentation slot. Never executes tool calls or interprets model markup. */
  renderMessageSupplement?: (message: AssistantMessage) => ReactNode;
  /** Optional host controls for opening the existing modal from another surface. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  draft?: string;
  onDraftChange?: (draft: string) => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  title?: string;
  description?: string;
  /** Optional selected-record label; ordinary page context stays in the app adapter. */
  contextLabel?: string;
  /** The parent owns context selection; clearing must not silently widen access. */
  onClearContext?: () => void;
  badge?: string;
  onNewConversation?: () => void;
  onAction?: (draft: NonNullable<AssistantMessage['action']>, decision: 'confirm' | 'cancel', typedConfirmation?: string) => ReturnType<NonNullable<LeadDraftCardProps['onDecide']>>;
  onOpenHistoryResult?: (resultId: string, leadId?: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  onOpenDetailsResult?: (resultId: string, leadId?: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  onOpenSearchResult?: (resultId: string, leadId?: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  messages?: readonly AssistantMessage[];
  disabled?: boolean;
  /** Allows drafting and expansion while the server runtime is unavailable. */
  sendDisabled?: boolean;
  /** Transport owns partial messages and cancellation; closing only hides the dialog. */
  runStatus?: 'thinking' | 'streaming' | 'cancelled' | 'failed' | 'completed';
  onStop?: () => void;
  onRetry?: () => Promise<{ ok: true } | { ok: false; message: string }>;
  /** Presentation boundary only. Authorization, persistence, and AI execution belong to the server adapter. */
  onSend: (
    message: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
}

/** Shared prototype-based interaction surface. No domain mutations or model calls live here. */
export function AssistantPanel({
  open, onOpenChange, draft: controlledDraft, onDraftChange, returnFocusRef,
  title = copy.title,
  description = copy.description,
  contextLabel,
  onClearContext,
  badge,
  onNewConversation,
  onAction,
  renderMessageSupplement,
  onOpenSearchResult,
  onOpenDetailsResult,
  onOpenHistoryResult,
  messages = [],
  disabled = false,
  sendDisabled = false,
  runStatus,
  onStop,
  onRetry,
  onSend,
}: AssistantPanelProps) {
  const id = useId();
  const composer = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = open ?? internalExpanded;
  function setExpanded(next: boolean) { if (open === undefined) setInternalExpanded(next); onOpenChange?.(next); }
  const openedFromLauncher = useRef(false);
  const sending = useRef(false);
  const restoreFocus = useRef(false);
  const [internalDraft, setInternalDraft] = useState("");
  const draft = controlledDraft ?? internalDraft;
  function setDraft(next: string) { if (controlledDraft === undefined) setInternalDraft(next); onDraftChange?.(next); }
  const [navigating, setNavigating] = useState(false);
  const navigationPending = useRef(false);
  const [pending, setPending] = useState(false);
  const [navigationError, setNavigationError] = useState(false);
  const [error, setError] = useState<string>();
  const active = pending || runStatus === 'thinking' || runStatus === 'streaming';
  const locked = disabled || active || navigating;
  const visibleError = runStatus === 'cancelled' ? undefined : error;
  const followLatest = useRef(true);
  useEffect(() => {
    if (expanded && followLatest.current && panel.current) panel.current.scrollTop = panel.current.scrollHeight;
  }, [messages, runStatus, expanded]);
  useEffect(() => {
    const dialog = panel.current;
    if (!dialog) return;
    // Keep the composer mounted so closing the modal preserves the draft.
    if (expanded) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.showModal();
      composer.current?.focus();
      return () => { document.body.style.overflow = previousOverflow; };
    }
    if (dialog.open) {
      dialog.close();
      const target = openedFromLauncher.current ? launcher.current : returnFocusRef?.current ?? launcher.current;
      (target?.isConnected && !target.matches(':disabled') && target.getClientRects().length ? target : launcher.current)?.focus();
      openedFromLauncher.current = false;
    }
  }, [expanded, returnFocusRef]);

  async function openReadResult(kind: 'search' | 'details' | 'history', resultId: string, leadId?: string) {
    const navigate = kind === 'history' ? onOpenHistoryResult : kind === 'details' ? onOpenDetailsResult : onOpenSearchResult;
    if (locked || navigationPending.current || !navigate) return;
    navigationPending.current = true; setNavigating(true); setNavigationError(true); setError(undefined);
    try { const result = await navigate(resultId, leadId); if (!result.ok) setError(result.message); }
    catch { setError(copy.failure); }
    finally { navigationPending.current = false; setNavigating(false); }
  }
  function collapse() {
    setExpanded(false);
  }
  useEffect(() => {
    if (!locked && restoreFocus.current) {
      restoreFocus.current = false;
      if (expanded) composer.current?.focus({ preventScroll: true });
    }
  }, [locked, expanded]);

  async function send() {
    const message = draft.trim();
    if (locked || sendDisabled || sending.current || !message) return;
    if (draft.length > copy.maxLength) {
      setError(copy.tooLong);
      return;
    }
    await execute(() => onSend(message));
  }

  async function execute(work: () => Promise<{ ok: true } | { ok: false; message: string }>) {
    if (locked || sendDisabled || sending.current) return;
    sending.current = true;
    setPending(true);
    setNavigationError(false);
    setError(undefined);
    try {
      const result = await work();
      if (result.ok) setDraft("");
      else setError(result.message);
    } catch {
      setError(copy.failure);
    } finally {
      sending.current = false;
      restoreFocus.current = true;
      setPending(false);
    }
  }

  return (
    <>
    <button
      ref={launcher}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-controls={`${id}-dialog`}
      onClick={() => { openedFromLauncher.current = true; setExpanded(true); }}
      className="fixed bottom-4 right-4 z-40 flex min-h-14 max-w-full cursor-pointer items-center gap-3 rounded-2xl border border-assistant-border bg-assistant-header px-5 py-3 text-left text-assistant-foreground shadow-xl hover:bg-assistant-surface focus-visible:focus-ring sm:bottom-6 sm:right-6"
    >
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-assistant-accent text-assistant-surface"><ChatBubbleOutlined /></span>
      <span><span className="block text-base font-semibold">{copy.launcher}</span>{" "}<span className="block text-sm text-assistant-muted">{copy.launcherHint}</span></span>
    </button>
    <dialog
      ref={panel}
      id={`${id}-dialog`}
      aria-modal={expanded || undefined}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onScroll={event => {
        const dialog = event.currentTarget;
        followLatest.current = dialog.scrollHeight - dialog.scrollTop - dialog.clientHeight < 80;
      }}
      onCancel={(event) => { event.preventDefault(); collapse(); }}
      onKeyDown={(event) => {
        if (!expanded || event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), textarea:not(:disabled), a[href]"));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus();
        }
      }}
      onClick={(event) => {
        if (!expanded || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) collapse();
      }}
      className="fixed inset-0 m-auto max-h-full w-full min-w-0 max-w-5xl overflow-y-auto rounded-2xl border border-assistant-border bg-assistant-surface p-0 text-assistant-foreground shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <header className="grid gap-4 bg-assistant-header p-6 text-assistant-foreground sm:flex sm:flex-wrap sm:items-start sm:p-8">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-assistant-accent text-xl text-assistant-surface"
        >
          <ChatBubbleOutlined />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id={`${id}-title`}
            className="m-0 text-lg font-semibold text-assistant-foreground wrap-anywhere"
          >
            {title}
          </h2>
          <p
            id={`${id}-description`}
            className="mb-0 mt-2 text-sm leading-6 text-assistant-muted"
          >
            {description}
          </p>
        </div>
        {badge && (
          <span className="w-fit rounded-full border border-assistant-border bg-assistant-surface/60 px-3 py-2 text-xs font-semibold text-assistant-foreground">
            {badge}
          </span>
        )}
      </header>
      <div className="grid min-w-0 gap-6 p-6 sm:p-8">
      {expanded && <div className="flex flex-wrap justify-end gap-3">
        {onNewConversation && <button type="button" disabled={locked} onClick={onNewConversation} className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring disabled:opacity-50">{copy.newConversation}</button>}
        <button type="button" onClick={collapse} className="min-h-11 rounded-xl border border-assistant-border bg-assistant-surface px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring focus-visible:outline-assistant-accent">
          {copy.collapse}
        </button>
      </div>}
      {contextLabel && <div className="min-w-0"><ContextChip label={contextLabel} disabled={locked} onClear={onClearContext ? () => { onClearContext(); composer.current?.focus(); } : undefined}/></div>}
      {expanded && messages.length === 0 && !active && <p className="m-0 min-h-40 text-sm leading-6 text-assistant-muted sm:min-h-64">{copy.emptyConversation}</p>}
      {messages.length > 0 && (
        <div
          role="log"
          aria-label={copy.conversation}
          aria-live="off"
          className={`grid min-w-0 content-start gap-4 ${expanded ? "min-h-40 sm:min-h-64" : ""}`}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`min-w-0 rounded-xl border border-assistant-border p-4 ${message.role === "user" ? "bg-assistant-header" : "bg-assistant-message"}`}
            >
              <p className="m-0 text-sm font-semibold text-assistant-foreground">
                {message.role === "user" ? copy.user : copy.assistant}
              </p>
              <p className="mb-0 mt-2 whitespace-pre-wrap text-sm leading-6 text-assistant-foreground wrap-anywhere">
                {message.text}
              </p>
              {message.sources && message.sources.length > 0 && <nav aria-label={copy.sources} className="mt-3">
                <p className="m-0 text-sm font-semibold text-assistant-muted">{copy.sources}</p>
                <ul className="mb-0 mt-2 grid gap-2 pl-5">{message.sources.map(source => <li key={`${source.slug}:${source.anchor}`}><a href={source.href} target="_blank" rel="noopener noreferrer" className="text-sm text-assistant-accent underline underline-offset-4 focus-visible:focus-ring focus-visible:outline-assistant-accent">{source.title} · {source.heading}<span className="sr-only">{copy.newTab}</span></a></li>)}</ul>
              </nav>}
              {renderMessageSupplement?.(message)}
              {message.historyResult && <LeadActivityCard result={message.historyResult} disabled={locked || sendDisabled} onOpenLead={onOpenHistoryResult ? leadId => void openReadResult('history', message.historyResult!.id, leadId) : undefined}/>}
              {message.detailsResult && <LeadDetailsCard result={message.detailsResult} disabled={locked || sendDisabled} onOpenLead={onOpenDetailsResult ? leadId => void openReadResult('details', message.detailsResult!.id, leadId) : undefined}/>}
              {message.searchResult && <LeadSearchResultsCard result={message.searchResult} disabled={locked || sendDisabled} onOpenLead={onOpenSearchResult ? leadId => void openReadResult('search', message.searchResult!.id, leadId) : undefined} onOpenList={onOpenSearchResult ? resultId => void openReadResult('search', resultId) : undefined}/>}
              {message.action && ('actionType' in message.action
                ? message.action.actionType === 'lead.delete'
                  ? <LeadDeleteDraftCard draft={message.action} disabled={locked} onDecide={onAction ? (_draft, decision, typedConfirmation) => onAction(message.action!, decision, typedConfirmation) : undefined}/>
                : message.action.actionType === 'lead.export'
                  ? <LeadExportDraftCard draft={message.action} disabled={locked} onDecide={onAction ? (_draft, decision) => onAction(message.action!, decision) : undefined}/>
                : message.action.actionType === 'lead.archive'
                  ? <LeadArchiveDraftCard draft={message.action} disabled={locked} onDecide={onAction ? (_draft, decision) => onAction(message.action!, decision) : undefined}/>
                  : message.action.actionType === 'lead.note'
                  ? <LeadNoteDraftCard draft={message.action} disabled={locked} onDecide={onAction ? (_draft, decision) => onAction(message.action!, decision) : undefined}/>
                  : message.action.actionType === 'lead.assign'
                  ? <LeadAssignmentDraftCard draft={message.action} disabled={locked} onDecide={onAction ? (_draft, decision) => onAction(message.action!, decision) : undefined}/>
                  : message.action.actionType === 'lead.update'
                  ? <LeadUpdateDraftCard draft={message.action} disabled={locked} onDecide={onAction ? (_draft, decision) => onAction(message.action!, decision) : undefined}/>
                  : <LeadStageDraftCard draft={message.action} disabled={locked} onDecide={onAction ? (_draft, decision) => onAction(message.action!, decision) : undefined}/>
                : <LeadDraftCard draft={message.action} disabled={locked} onDecide={onAction}/>)}
              {message.interrupted && <p className="mb-0 mt-2 text-sm text-assistant-muted">{copy.interrupted}</p>}
            </div>
          ))}
        </div>
      )}
      <div role="status" aria-live="polite" aria-atomic="true" className={active || runStatus ? "text-sm text-assistant-muted" : "sr-only"}>
        {active ? (runStatus === 'streaming' ? copy.streaming : copy.thinking) : runStatus === 'cancelled' ? copy.cancelled : runStatus === 'failed' ? copy.streamFailure : runStatus === 'completed' ? copy.completed : ''}
      </div>
      {((active && onStop) || (!active && !disabled && !sendDisabled && onRetry && (runStatus === 'failed' || runStatus === 'cancelled'))) && <div className="flex flex-wrap gap-3">
        {active && onStop && <button type="button" onClick={onStop} className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring focus-visible:outline-assistant-accent">{copy.stop}</button>}
        {!active && !disabled && !sendDisabled && onRetry && (runStatus === 'failed' || runStatus === 'cancelled') && <button type="button" onClick={() => { if (onRetry) void execute(onRetry); }} className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold text-assistant-accent focus-visible:focus-ring focus-visible:outline-assistant-accent">{copy.retry}</button>}
      </div>}
      <form
        aria-label={copy.composer}
        aria-busy={active}
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
        className="grid min-w-0 gap-4"
      >
        <textarea
          ref={composer}
          id={`${id}-message`}
          value={draft}
          rows={3}
          disabled={locked}
          aria-label={copy.composer}
          aria-describedby={`${id}-hint${visibleError ? ` ${id}-error` : ""}`}
          aria-invalid={!!visibleError}
          placeholder={copy.placeholder}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(undefined);
          }}
          className="block min-h-28 w-full min-w-0 resize-y rounded-xl border border-assistant-border bg-assistant-surface p-4 text-base leading-6 text-assistant-foreground placeholder:text-assistant-muted focus-visible:focus-ring focus-visible:outline-assistant-accent disabled:bg-assistant-message"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p
            id={`${id}-hint`}
            className="m-0 max-w-xl text-sm leading-6 text-assistant-muted"
          >
            {copy.hint}
          </p>
          <SubmitButton
            label={copy.submit}
            pendingLabel={runStatus === 'streaming' ? copy.pending : copy.thinking}
            pending={active}
            disabled={disabled || sendDisabled || !draft.trim()}
            fullWidth={false}
            className="bg-assistant-accent! text-assistant-surface! hover:bg-assistant-accent/90! disabled:bg-assistant-border! disabled:text-assistant-foreground! focus-visible:outline-assistant-accent!"
          />
        </div>
        {visibleError && (
          <div id={`${id}-error`}>
            <FormFeedback
              kind="error"
              title={navigationError ? copy.navigationErrorTitle : runStatus === 'failed' ? copy.responseErrorTitle : copy.errorTitle}
              message={visibleError}
            />
          </div>
        )}
      </form>
      </div>
    </dialog>
    </>
  );
}
