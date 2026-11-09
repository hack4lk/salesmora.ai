"use client";

import { useId } from "react";
import { SeafoamButton } from "@salesmora/ui";
import { reportResultStateData as copy } from "./report-result-state.data";

export type ReportResultState =
  | { kind: "loading" }
  | { kind: "error"; message?: string }
  | { kind: "empty" };
export type ReportResultStateProps = {
  state: ReportResultState;
  canRead: boolean;
  canEdit: boolean;
  pending?: boolean;
  onRetry: () => void;
  onEdit: () => void;
};

/** The host distinguishes authorized empty results from failures and replaces stale results with this state. */
export function ReportResultState({
  state,
  canRead,
  canEdit,
  pending = false,
  onRetry,
  onEdit,
}: ReportResultStateProps) {
  const id = useId();
  const title = !canRead
    ? copy.deniedTitle
    : state.kind === "loading"
      ? copy.loadingTitle
      : state.kind === "error"
        ? copy.errorTitle
        : copy.emptyTitle;
  const description = !canRead
    ? copy.denied
    : state.kind === "loading"
      ? copy.loading
      : state.kind === "error"
        ? copy.error
        : copy.empty;
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-busy={canRead && (state.kind === "loading" || pending)}
      className="grid w-full min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 text-ink sm:p-6"
    >
      <h2 id={`${id}-title`} className="m-0 text-xl font-semibold">
        {title}
      </h2>
      <p
        role={!canRead || state.kind === "error" ? "alert" : "status"}
        className="m-0 text-sm leading-6 text-muted"
      >
        {description}
      </p>
      {canRead && state.kind === "error" && state.message && (
        <p className="m-0 text-sm text-muted wrap-anywhere">{state.message}</p>
      )}
      {canRead && state.kind !== "loading" && (
        <>
          {pending && (
            <p role="status" className="m-0 text-sm text-muted">
              {copy.pending}
            </p>
          )}
          <div className="flex min-w-0 flex-wrap gap-3">
            {state.kind === "error" && (
              <SeafoamButton
                size={16}
                label={copy.retry}
                disabled={pending}
                onClick={() => {
                  if (!pending) onRetry();
                }}
              />
            )}
            {canEdit && (
              <SeafoamButton
                size={16}
                label={copy.edit}
                disabled={pending}
                onClick={() => {
                  if (!pending && canEdit) onEdit();
                }}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}
