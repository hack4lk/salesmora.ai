"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

export type WorkflowAutomationExample = {
  id: string;
  name: string;
  prompt: string;
};

type WorkflowAutomationGuideProps = {
  examples: readonly WorkflowAutomationExample[];
  limitation?: string;
  children: ReactNode;
};

export function WorkflowAutomationGuide({ examples, limitation, children }: WorkflowAutomationGuideProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => { if (open) back.current?.focus(); }, [open]);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  return (
    <div className={`grid min-h-0 min-w-0 ${open ? "sm:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]" : ""}`}>
      {open && (
        <aside
          id={id}
          aria-labelledby={`${id}-title`}
          className="flex max-h-[min(36rem,60dvh)] min-h-0 min-w-0 flex-col overflow-hidden bg-assistant-surface p-4 text-assistant-foreground sm:border-r sm:border-assistant-border"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              close();
            }
          }}
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <h2 id={`${id}-title`} className="m-0 text-base font-semibold">What can I automate?</h2>
            <button
              ref={back}
              type="button"
              className="min-h-11 cursor-pointer rounded-lg border border-assistant-border px-3 text-sm font-semibold focus-visible:focus-ring"
              onClick={close}
            >
              Back to chat
            </button>
          </div>
          <div role="region" aria-label="Available automations" tabIndex={0} className="min-h-0 overflow-y-auto overscroll-contain pr-1 focus-visible:focus-ring">
            {examples.length ? (
              <ul className="m-0 list-none divide-y divide-assistant-border p-0">
                {examples.map((example) => (
                  <li key={example.id} className="py-3 text-sm">
                    <strong>{example.name}</strong>
                    <p className="mb-0 mt-1 text-assistant-muted">“{example.prompt}”</p>
                  </li>
                ))}
              </ul>
            ) : <p className="mb-0 text-sm text-assistant-muted">No automations are available in this workspace.</p>}
            {limitation && <p className="mb-0 text-sm text-assistant-muted">{limitation}</p>}
          </div>
        </aside>
      )}
      <div className={`min-h-0 min-w-0 ${open ? "hidden sm:block" : ""}`}>
        <div className="px-6 pt-4 sm:px-8">
          <button
            ref={trigger}
            type="button"
            aria-label="What can I automate?"
            aria-controls={open ? id : undefined}
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-assistant-border border-l-4 border-l-seafoam-light bg-assistant-message px-4 py-3 text-left text-assistant-foreground hover:bg-assistant-header focus-visible:focus-ring"
          >
            <span className="min-w-0">
              <strong className="block text-sm font-semibold">What can I automate?</strong>
            </span>
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-assistant-border text-lg text-seafoam-pale">→</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
