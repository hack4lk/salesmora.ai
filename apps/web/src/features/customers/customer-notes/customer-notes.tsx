"use client";
import { useId, useRef, useState } from "react";
import { FormFeedback } from "@salesmora/ui";
import type { CustomerNote } from "../customer-preview.types";
import {
  customerDate,
  customerPanel,
  customerInput,
  customerPrimary,
} from "../customer-ui";
import { customerNotesData as c } from "./customer-notes.data";
export function CustomerNotes({
  notes,
  canAdd,
  onAdd,
  total = notes.length,
  onLoadMore,
}: {
  notes: readonly CustomerNote[];
  canAdd: boolean;
  total?: number;
  onLoadMore?: () => void;
  onAdd: (body: string) => Promise<void>;
}) {
  const id = useId(),
    lock = useRef(false),
    [body, setBody] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  return (
    <section aria-labelledby={id} className={`${customerPanel} grid gap-5`}>
      <h2 id={id} className="m-0 text-lg font-semibold">
        {c.title}
      </h2>
      <p className="m-0 text-sm text-muted">{c.hint}</p>
      {canAdd && (
        <form
          noValidate
          aria-busy={busy}
          onSubmit={async (e) => {
            e.preventDefault();
            if (lock.current) return;
            if (!body.trim() || body.trim().length > 4000) {
              setError(c.validation);
              return;
            }
            lock.current = true;
            setBusy(true);
            setError("");
            setSaved(false);
            try {
              await onAdd(body.trim());
              setBody("");
              setSaved(true);
            } catch {
              setError(c.error);
            } finally {
              setBusy(false);
              lock.current = false;
            }
          }}
          className="grid gap-3"
        >
          <label htmlFor={`${id}-body`} className="text-sm font-semibold">
            {c.label}
          </label>
          <textarea
            id={`${id}-body`}
            rows={3}
            value={body}
            disabled={busy}
            onChange={(e) => {
              setBody(e.target.value);
              setError("");
              setSaved(false);
            }}
            className={customerInput}
          />
          <p className="m-0 text-xs text-muted">{c.count(body.length)}</p>
          {error && <FormFeedback kind="error" message={error} />}
          <div>
            <button type="submit" disabled={busy} className={customerPrimary}>
              {busy ? c.saving : c.add}
            </button>
          </div>
        </form>
      )}
      {saved && (
        <p role="status" className="m-0 text-sm text-success">
          {c.saved}
        </p>
      )}
      {!notes.length && <p className="m-0 text-sm text-muted">{c.empty}</p>}
      <ol className="m-0 grid list-none gap-4 p-0">
        {notes.map((note) => (
          <li key={note.id} className="grid gap-2 border-t border-line pt-4">
            <p className="m-0 whitespace-pre-wrap wrap-anywhere">{note.body}</p>
            <p className="m-0 text-sm text-muted wrap-anywhere">
              {note.author} ·{" "}
              <time dateTime={note.createdAt}>
                {customerDate(note.createdAt)}
              </time>
            </p>
          </li>
        ))}
      </ol>
      {notes.length < total && onLoadMore && (
        <button type="button" className={customerPrimary} onClick={onLoadMore}>
          {c.more}
        </button>
      )}
    </section>
  );
}
