'use client';
import { useEffect, useRef } from 'react';
import { publicCapturePageData as copy } from './public-capture-page.data';
type Turnstile = { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: Turnstile } }
let loading: Promise<void> | undefined;
function load() {
  if (window.turnstile) return Promise.resolve(); if (loading) return loading;
  const script = document.createElement('script'); script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true;
  const nonce = document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce; if (nonce) script.nonce = nonce;
  const promise = new Promise<void>((resolve, reject) => { script.onload = () => window.turnstile ? resolve() : reject(Error('Verification unavailable')); script.onerror = () => { script.remove(); reject(Error('Verification unavailable')); }; });
  loading = promise; void promise.catch(() => { if (loading === promise) loading = undefined; }); document.head.append(script); return promise;
}
export function TurnstileCheck({ siteKey, cData, onVerified, onExpired, onError }: { siteKey: string; cData: string; onVerified: (token: string) => void; onExpired: () => void; onError: () => void }) {
  const element = useRef<HTMLDivElement>(null), callbacks = useRef({ onVerified, onExpired, onError });
  useEffect(() => { callbacks.current = { onVerified, onExpired, onError }; }, [onVerified, onExpired, onError]);
  useEffect(() => {
    let cancelled = false, widget: string | undefined;
    void load().then(() => {
      if (cancelled || !element.current) return;
      try { widget = window.turnstile!.render(element.current, { sitekey: siteKey, action: 'capture_submit', cData, size: 'compact', callback: (token: string) => callbacks.current.onVerified(token), 'expired-callback': () => callbacks.current.onExpired(), 'error-callback': () => callbacks.current.onError() }); }
      catch { callbacks.current.onError(); }
    }, () => { if (!cancelled) callbacks.current.onError(); });
    return () => { cancelled = true; if (widget) window.turnstile?.remove(widget); };
  }, [siteKey, cData]);
  return <div ref={element} role="group" aria-label={copy.securityLabel} className="min-w-0 max-w-full" />;
}
