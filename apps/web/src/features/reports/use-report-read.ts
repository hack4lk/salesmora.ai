'use client';

import { useEffect, useState } from 'react';

/** Request keys hide old results before fetching; active guards also reject transports that ignore abort. */
export function useReportRead(input: {
  key: string; initial: unknown; url: string; validate: (raw: unknown) => void; failureMessage: string; enabled?: boolean;
}) {
  const { key, initial, url, validate, failureMessage, enabled = true } = input;
  const [loaded, setLoaded] = useState<{ key: string; raw?: unknown; error?: string; denied?: boolean }>(() => ({ key, raw: initial }));
  useEffect(() => {
    if (!enabled || loaded.key === key) return;
    const abort = new AbortController();
    let active = true;
    async function load() {
      try {
        const response = await fetch(url, { cache: 'no-store', signal: abort.signal });
        const raw: unknown = await response.json();
        if (!response.ok) {
          const message = typeof raw === 'object' && raw !== null && 'error' in raw && typeof raw.error === 'string'
            ? raw.error : failureMessage;
          if (active) setLoaded({ key, error: message, denied: [401, 403, 404, 423].includes(response.status) });
          return;
        }
        validate(raw);
        if (active) setLoaded({ key, raw });
      } catch (error) {
        if (!active || abort.signal.aborted) return;
        setLoaded({ key, error: error instanceof Error ? error.message : failureMessage });
      }
    }
    void load();
    return () => { active = false; abort.abort(); };
  }, [key, url, validate, failureMessage, loaded.key, enabled]);
  if (!enabled) return { key, raw: undefined, error: undefined, denied: undefined, pending: false };
  return { ...loaded, pending: loaded.key !== key };
}
