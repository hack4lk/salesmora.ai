"use client";
import { useId, useRef, useState } from "react";
import type { CustomerValues } from "../customer-preview.types";
import { customerAssistantDraftData as c } from "./customer-assistant-draft.data";
export type CustomerAssistantDraftProps = {
  state?: "idle" | "drafting" | "error" | "empty";
  draft?: Partial<CustomerValues>;
  disabled?: boolean;
  onDraft: (prompt: string) => Promise<void>;
  onApply: (draft: Partial<CustomerValues>) => void;
};
export function CustomerAssistantDraft({
  state = "idle",
  draft,
  disabled,
  onDraft,
  onApply,
}: CustomerAssistantDraftProps) {
  const id = useId(),
    lock = useRef(false),
    [prompt, setPrompt] = useState(""),
    [working, setWorking] = useState(false),
    [error, setError] = useState("");
  const busy = working || state === "drafting";
  return (
    <aside
      aria-labelledby={id}
      aria-busy={busy}
      className="grid min-w-0 content-start gap-5 rounded-2xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground"
    >
      <div>
        <h2 id={id} className="m-0 text-lg font-semibold">
          {c.title}
        </h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-assistant-muted">
          {c.intro}
        </p>
      </div>
      <p className="m-0 rounded-xl bg-assistant-message p-4 text-sm leading-6">
        {c.example}
      </p>
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!prompt.trim() || busy || disabled || lock.current) return;
          lock.current = true;
          setWorking(true);
          setError("");
          try {
            await onDraft(prompt.trim());
          } catch {
            setError(c.error);
          } finally {
            lock.current = false;
            setWorking(false);
          }
        }}
      >
        <label htmlFor={`${id}-prompt`} className="text-sm font-semibold">
          {c.label}
        </label>
        <textarea
          id={`${id}-prompt`}
          rows={3}
          maxLength={4000}
          value={prompt}
          disabled={busy || disabled}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full min-w-0 rounded-xl border border-assistant-border bg-assistant-message p-3 text-assistant-foreground focus-visible:focus-ring"
        />
        <button
          type="submit"
          disabled={busy || disabled || !prompt.trim()}
          className="min-h-11 cursor-pointer rounded-xl bg-assistant-accent px-4 py-2 font-semibold text-assistant-surface focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? c.thinking : c.draft}
        </button>
      </form>
      {busy && (
        <p role="status" className="m-0 text-sm">
          {c.thinking}
        </p>
      )}
      {(error || state === "error") && (
        <p role="alert" className="m-0 text-sm">
          {error || c.error}
        </p>
      )}
      {state === "empty" && (
        <p role="status" className="m-0 text-sm">
          {c.empty}
        </p>
      )}
      {draft && Object.keys(draft).length > 0 && (
        <section className="grid min-w-0 gap-3 rounded-xl border border-assistant-border p-4">
          <h3 className="m-0 text-base font-semibold">{c.review}</h3>
          <dl className="m-0 grid gap-3">
            {Object.entries(draft).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm text-assistant-muted">
                  {c.fields[key as keyof CustomerValues]}
                </dt>
                <dd className="m-0 mt-1 text-sm whitespace-pre-wrap wrap-anywhere">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            disabled={busy || disabled}
            onClick={() => onApply(draft)}
            className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {c.apply}
          </button>
        </section>
      )}
      <p className="m-0 text-sm leading-6 text-assistant-muted">{c.hint}</p>
    </aside>
  );
}
