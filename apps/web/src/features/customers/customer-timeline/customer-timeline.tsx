"use client";
import { useId } from "react";
import { FormFeedback } from "@salesmora/ui";
import type { CustomerEvent } from "../customer-preview.types";
import { customerDate, customerButton } from "../customer-ui";
import { customerTimelineData as c } from "./customer-timeline.data";
export function CustomerTimeline({
  events,
  total = events.length,
  loading = false,
  error,
  onLoadMore,
  onRetry,
}: {
  events: readonly CustomerEvent[];
  total?: number;
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  onRetry?: () => void;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      aria-busy={loading}
      className="grid min-w-0 gap-4"
    >
      <h2 id={id} className="m-0 text-lg font-semibold text-ink">
        {c.title}
      </h2>
      {error ? (
        <>
          <FormFeedback kind="error" message={error} />
          {onRetry && (
            <button type="button" onClick={onRetry} className={customerButton}>
              {c.retry}
            </button>
          )}
        </>
      ) : (
        <>
          {!events.length && !loading && (
            <p className="m-0 text-sm text-muted">{c.empty}</p>
          )}
          <ol className="m-0 grid list-none gap-4 p-0">
            {[...events]
              .sort(
                (a, b) =>
                  b.createdAt.localeCompare(a.createdAt) ||
                  a.id.localeCompare(b.id),
              )
              .map((event) => (
                <li
                  key={event.id}
                  className="grid min-w-0 gap-2 border-l-2 border-primary/30 pl-4"
                >
                  <p className="m-0 font-semibold text-ink wrap-anywhere">
                    {event.text}
                  </p>
                  <p className="m-0 text-sm text-muted wrap-anywhere">
                    {event.actor} · {c.sources[event.source]}
                  </p>
                  <time
                    className="text-xs text-muted"
                    dateTime={event.createdAt}
                  >
                    {customerDate(event.createdAt)}
                  </time>
                </li>
              ))}
          </ol>
          {events.length < total && onLoadMore && (
            <button
              type="button"
              disabled={loading}
              onClick={onLoadMore}
              className={customerButton}
            >
              {c.more}
            </button>
          )}
        </>
      )}
      {loading && (
        <p role="status" className="m-0 text-sm text-muted">
          {c.loading}
        </p>
      )}
    </section>
  );
}
