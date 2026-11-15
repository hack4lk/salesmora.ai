"use client";

import { useId } from "react";
import { FormFeedback, HelpTooltip, SeafoamButton } from "@salesmora/ui";
import { reportAreaCatalogData as copy } from "./report-area-catalog.data";

export type ReportAreaCatalogItem = {
  id: string;
  label: string;
  description: string;
  modeLabel: string;
  /** Counts are current-user/workspace configuration counts, never result counts. */
  access:
    | { allowed: true; templateCount: number }
    | { allowed: false; reason: string };
};
export type ReportAreaCatalogProps = {
  areas: readonly ReportAreaCatalogItem[];
  canRead: boolean;
  state?: "ready" | "loading" | "error";
  pending?: boolean;
  onOpen: (areaId: string) => void;
  onRetry: () => void;
};

/** The host supplies current capabilities and owns navigation; cards never infer grants. */
export function ReportAreaCatalog({
  areas,
  canRead,
  state = "ready",
  pending = false,
  onOpen,
  onRetry,
}: ReportAreaCatalogProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const overview = areas.find(
    (area) => area.id === "overview" && area.access.allowed,
  );
  const open = (area: ReportAreaCatalogItem) => {
    if (!pending && state === "ready" && area.access.allowed) onOpen(area.id);
  };
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-busy={state === "loading" || pending}
      className="grid w-full min-w-0 gap-6 text-ink"
    >
      <header className="grid gap-2">
        <h2 id={`${id}-title`} className="m-0 text-2xl font-semibold">
          {copy.title}
        </h2>
        <p className="m-0 text-sm text-muted">{copy.description}</p>
      </header>
      {state === "loading" && (
        <p role="status" className="m-0 text-sm text-muted">
          {copy.loading}
        </p>
      )}
      {state === "error" && (
        <div className="grid justify-items-start gap-3">
          <FormFeedback kind="error" message={copy.failed} />
          <SeafoamButton
            label={copy.retry}
            disabled={pending}
            onClick={onRetry}
          />
        </div>
      )}
      {state === "ready" && (
        <>
          {overview && (
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-6">
              <div className="min-w-0 flex-1 basis-64">
                <p className="m-0 text-xs font-semibold text-muted">
                  {copy.start}
                </p>
                <div className="my-0 flex min-w-0 items-center gap-1">
                  <h3 className="m-0 min-w-0 text-xl font-semibold">
                    {copy.overviewTitle}
                  </h3>
                  <HelpTooltip
                    label={copy.overviewHelp}
                    paragraphs={[copy.overviewDescription]}
                  />
                </div>
              </div>
              <SeafoamButton
                size={14}
                label={copy.overviewAction}
                disabled={pending}
                onClick={() => open(overview)}
              />
            </div>
          )}
          {pending && (
            <p role="status" className="m-0 text-sm text-muted">
              {copy.pending}
            </p>
          )}
          {areas.length === 0 ? (
            <p className="m-0 text-sm text-muted">{copy.empty}</p>
          ) : (
            <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {areas.map((area, index) => (
                <article
                  key={area.id}
                  aria-labelledby={`${id}-area-${index}`}
                  className="flex min-w-0 flex-col items-start gap-0 rounded-2xl border border-line bg-paper p-4 sm:p-6"
                >
                  <p className="m-0 text-xs font-semibold text-muted wrap-anywhere">
                    {area.modeLabel}
                  </p>
                  <div className="flex w-full min-w-0 items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-1">
                      <h3
                        id={`${id}-area-${index}`}
                        className="m-0 min-w-0 text-lg font-semibold wrap-anywhere"
                      >
                        {area.label}
                      </h3>
                      <HelpTooltip
                        label={copy.areaHelp(area.label)}
                        paragraphs={[area.description]}
                      />
                    </div>
                    <SeafoamButton
                      size={14}
                      className="ml-auto shrink-0"
                      label={copy.templates}
                      aria-label={copy.action(area.label)}
                      disabled={pending || !area.access.allowed}
                      onClick={() => open(area)}
                    />
                  </div>
                  <p className="m-0 text-sm text-muted wrap-anywhere">
                    {area.access.allowed
                      ? copy.count(area.access.templateCount)
                      : area.access.reason}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
