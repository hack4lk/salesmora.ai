"use client";
import { useId, useRef, useState } from "react";
import { customerExportDraftCardData as c } from "./customer-export-draft-card.data";
export function CustomerExportDraftCard({
  count,
  scope,
  columns,
  state = "pending",
  onDownload,
}: {
  count: number;
  scope: string;
  columns: readonly string[];
  state?: "pending" | "forbidden" | "expired" | "confirmed";
  onDownload?: () => Promise<void>;
}) {
  const id = useId(),
    lock = useRef(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const valid =
    Number.isSafeInteger(count) &&
    count > 0 &&
    count <= 50000 &&
    columns.length > 0;
  return (
    <section
      aria-labelledby={id}
      aria-busy={busy}
      className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground"
    >
      <h3 id={id} className="m-0 text-lg font-semibold">
        {c.title}
      </h3>
      {state !== "forbidden" && (
        <>
          <p className="m-0 text-sm wrap-anywhere">{scope}</p>
          <p className="m-0 text-sm text-assistant-muted">{c.count(count)}</p>
          <ul className="m-0 pl-5 text-sm">
            {columns.map((column) => (
              <li key={column} className="wrap-anywhere">
                {column}
              </li>
            ))}
          </ul>
        </>
      )}
      <p role="status" className="m-0 text-sm">
        {busy ? c.busy : c.states[state]}
      </p>
      {count > 50000 && state !== "forbidden" && (
        <p role="alert" className="m-0 text-sm">
          {c.limit}
        </p>
      )}
      {error && (
        <p role="alert" className="m-0 text-sm">
          {error}
        </p>
      )}
      {onDownload && state === "pending" && (
        <button
          type="button"
          disabled={busy || !valid}
          onClick={async () => {
            if (lock.current || !valid) return;
            lock.current = true;
            setBusy(true);
            setError("");
            try {
              await onDownload();
            } catch {
              setError(c.error);
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
          className="min-h-11 cursor-pointer rounded-xl bg-assistant-accent px-4 py-2 text-sm font-semibold text-assistant-surface focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {c.download}
        </button>
      )}
      <p className="m-0 text-xs leading-5 text-assistant-muted">{c.hint}</p>
    </section>
  );
}
