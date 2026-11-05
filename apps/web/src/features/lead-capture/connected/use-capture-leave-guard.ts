'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
/** Keep local edits when a native sidebar link or browser Back leaves setup. */
export function useCaptureLeaveGuard(dirty: boolean, pending: boolean) {
  const params = useSearchParams(), [leave, setLeave] = useState<string | null>(null);
  useEffect(() => {
    if (!dirty && !pending) return;
    const navigation = (window as Window & { navigation?: EventTarget }).navigation;
    const traverse = (event: Event) => {
      const next = event as Event & { navigationType: string; destination: { url: string } };
      if (next.navigationType !== 'traverse' || !event.cancelable || new URL(next.destination.url).pathname === location.pathname) return;
      // Cancel the traversal before the router observes a different history entry.
      event.preventDefault(); if (!pending) setLeave(next.destination.url);
    };
    const currentURL = location.href, currentState: unknown = history.state;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const click = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest?.('a[href]');
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const href = anchor.getAttribute('href'); if (!href || href.startsWith('#')) return;
      const target = new URL(href, location.href); if (target.pathname === location.pathname && target.origin === location.origin) return;
      event.preventDefault(); event.stopPropagation(); if (!pending) setLeave(target.href);
    };
    const pop = (event: PopStateEvent) => {
      const target = location.href;
      if (new URL(target).pathname === new URL(currentURL).pathname) return;
      // Stop Next from unmounting the editor until discard is confirmed. Restore
      // its own opaque history state as well as the URL; no router fields are invented.
      event.stopImmediatePropagation(); history.pushState(currentState, '', currentURL);
      if (!pending) setLeave(target);
    };
    navigation?.addEventListener('navigate', traverse);
    window.addEventListener('beforeunload', warn); document.addEventListener('click', click, true); window.addEventListener('popstate', pop, true);
    return () => { navigation?.removeEventListener('navigate', traverse); window.removeEventListener('beforeunload', warn); document.removeEventListener('click', click, true); window.removeEventListener('popstate', pop, true); };
  }, [dirty, pending, params]);
  return { leave, setLeave };
}
