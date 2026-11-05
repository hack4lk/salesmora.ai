'use client';
import { createContext, useLayoutEffect, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';

import { captureSetupCanonical, type CaptureSetupContext, type CaptureSetupView, type ChatPageContext } from '@salesmora/contracts';
export type AssistantPageContext = ChatPageContext & { key: string; label: string };
type AssistantStatus = 'ready' | 'busy' | 'unavailable';
type SetupHost = { read: () => CaptureSetupContext | undefined; apply: (view: CaptureSetupView) => void };
type WorkspaceAssistant = {
  open: boolean; setOpen: (open: boolean) => void;
  draft: string; setDraft: (draft: string) => void;
  status: AssistantStatus; setStatus: (status: AssistantStatus) => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  pageContext?: AssistantPageContext; setPageContext: (context?: AssistantPageContext) => void; clearPageContext: () => void;
  registerCaptureSetup: (host?: SetupHost) => void;
  readCaptureSetup: () => CaptureSetupContext | undefined;
  applyCaptureSetup: (view: CaptureSetupView, checkOnly?: boolean) => boolean;
  prepare: (prompt: string, trigger: HTMLElement | null) => void;
};
const Context = createContext<WorkspaceAssistant | undefined>(undefined);
/** Coordinates existing UI only; app/session permissions remain server-owned. */
export function WorkspaceAssistantProvider({ enabled, initialPageContext, children }: { enabled: boolean; initialPageContext?: AssistantPageContext; children: ReactNode }) {
  const [pageContext, updatePageContext] = useState(initialPageContext), [clearedKey, setClearedKey] = useState<string>();
  const setPageContext = useCallback((next?: AssistantPageContext) => { updatePageContext(old => JSON.stringify(old) === JSON.stringify(next) ? old : next); }, []);
  const clearPageContext = useCallback(() => { setClearedKey(pageContext?.key); }, [pageContext?.key]);
  const activeContext = pageContext?.key === clearedKey ? undefined : pageContext;
  const [open, setOpen] = useState(false), [draft, setDraft] = useState('');
  const [status, setStatus] = useState<AssistantStatus>(enabled ? 'busy' : 'unavailable');
  const captureHost = useRef<SetupHost | undefined>(undefined);
  const registerCaptureSetup = useCallback((host?: SetupHost) => { captureHost.current = host; }, []);
  const activeContextRef = useRef(activeContext); useLayoutEffect(() => { activeContextRef.current = activeContext; }, [activeContext]);
  const readCaptureSetup = useCallback(() => {
    const snapshot = captureHost.current?.read();
    return snapshot && activeContextRef.current?.captureContext?.surface === 'lead_capture.setup' && activeContextRef.current.captureContext.sourceId === snapshot.sourceId ? snapshot : undefined;
  }, []);
  const applyCaptureSetup = useCallback((view: CaptureSetupView, checkOnly = false) => {
    const snapshot = readCaptureSetup();
    if (!snapshot || captureSetupCanonical(snapshot) !== captureSetupCanonical(view.review.base)) return false;
    if (!checkOnly) captureHost.current?.apply(view);
    return true;
  }, [readCaptureSetup]);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const prepare = useCallback((prompt: string, trigger: HTMLElement | null) => {
    if (!enabled || status !== 'ready') return;
    setClearedKey(undefined);
    returnFocusRef.current = trigger;
    setDraft(current => current.trim() ? current : prompt);
    setOpen(true);
  }, [enabled, status]);
  const value = useMemo(() => ({ registerCaptureSetup, readCaptureSetup, applyCaptureSetup, open, setOpen, draft, setDraft, status: enabled ? status : 'unavailable' as const, setStatus, returnFocusRef, prepare, pageContext: activeContext, setPageContext, clearPageContext }), [registerCaptureSetup, readCaptureSetup, applyCaptureSetup, open, draft, enabled, status, prepare, activeContext, setPageContext, clearPageContext]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useWorkspaceAssistant() { return useContext(Context); }
