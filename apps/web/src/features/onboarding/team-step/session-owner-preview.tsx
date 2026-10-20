import { useEffect, useRef, useState, type ReactNode } from 'react';
import { teamStepData as copy } from './team-step.data';

/** Storybook-only session bridge; production receives the owner from its server session. */
export function SessionOwnerPreview({ children }: { children: (email: string) => ReactNode }) {
  const [owner, setOwner] = useState<string | null>();
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => { if (owner) content.current?.querySelector<HTMLHeadingElement>('h2')?.focus(); }, [owner]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/auth/get-session?disableCookieCache=true&disableRefresh=true', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Session unavailable');
        const session = await response.json();
        if (!controller.signal.aborted) setOwner(typeof session?.user?.email === 'string' ? session.user.email : null);
      } catch {
        if (!controller.signal.aborted) setOwner(null);
      }
    }
    void load();
    return () => controller.abort();
  }, []);
  if (owner === undefined) return <p role="status" className="m-0 text-sm text-muted">{copy.stories.loadingOwner}</p>;
  if (!owner) return <div className="rounded-xl border border-line bg-paper p-4"><p className="m-0 text-sm leading-6 text-muted">{copy.stories.signInHelp}</p><a href={copy.stories.loginUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center rounded-lg px-2 font-semibold text-primary underline focus-visible:focus-ring">{copy.stories.signIn}</a></div>;
  return <div ref={content}>{children(owner)}</div>;
}
