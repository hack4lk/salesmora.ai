'use client';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';

import type { ChatPageContext } from '@salesmora/contracts';
export type AssistantPageContext = ChatPageContext & { key: string; label: string };
type AssistantStatus = 'ready' | 'busy' | 'unavailable';
type WorkspaceAssistant = {
  open: boolean; setOpen: (open: boolean) => void;
  draft: string; setDraft: (draft: string) => void;
  status: AssistantStatus; setStatus: (status: AssistantStatus) => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  pageContext?: AssistantPageContext; setPageContext: (context?: AssistantPageContext) => void; clearPageContext: () => void;
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
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const prepare = useCallback((prompt: string, trigger: HTMLElement | null) => {
    if (!enabled || status !== 'ready') return;
    returnFocusRef.current = trigger;
    setDraft(current => current.trim() ? current : prompt);
    setOpen(true);
  }, [enabled, status]);
  const value = useMemo(() => ({ open, setOpen, draft, setDraft, status: enabled ? status : 'unavailable' as const, setStatus, returnFocusRef, prepare, pageContext: activeContext, setPageContext, clearPageContext }), [open, draft, enabled, status, prepare, activeContext, setPageContext, clearPageContext]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useWorkspaceAssistant() { return useContext(Context); }
