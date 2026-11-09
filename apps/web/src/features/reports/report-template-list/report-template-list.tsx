"use client";

import { useId, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  FormFeedback,
  HelpTooltip,
  MoreHorizOutlined,
  SeafoamButton,
  SeafoamOutlineButton,
  StatusBadge,
} from "@salesmora/ui";
import { reportTemplateListData as copy } from "./report-template-list.data";

export type ReportTemplateAction = keyof typeof copy.actions;
export type ReportTemplateListItem = {
  id: string;
  name: string;
  viewLabel: string;
  /** Host-formatted configuration labels; never saved result data. */
  periodLabel: string;
  assignmentLabel: string;
  groupLabel: string;
  /** Current capabilities supplied by the host, never inferred from role or saved configuration. */
  allowedActions: readonly ReportTemplateAction[];
};
export type ReportTemplateListProps = {
  templates: readonly ReportTemplateListItem[];
  canRead: boolean;
  canCreate: boolean;
  state?: "ready" | "loading" | "error";
  pendingIds?: readonly string[];
  onCreate: () => void;
  /** Requests a run or editor/confirmation flow. Does not mutate or authorize anything itself. */
  onAction: (
    template: ReportTemplateListItem,
    action: ReportTemplateAction,
  ) => void;
  onRetry: () => void;
};
const button =
  "min-h-11 max-w-full cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold wrap-anywhere focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";
const secondary = `${button} border-line bg-paper text-primary hover:bg-canvas`;
const menuActions = ["edit", "rename", "delete"] as const;

function TemplateMenu({
  template,
  pending,
  onAction,
}: {
  template: ReportTemplateListItem;
  pending: boolean;
  onAction: ReportTemplateListProps["onAction"];
}) {
  const id = useId(),
    [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const allowed = menuActions.filter((action) =>
    template.allowedActions.includes(action),
  );
  if (!allowed.length) return null;
  const open = !!anchor && !pending;
  return (
    <>
      <button
        id={`${id}-trigger`}
        type="button"
        disabled={pending}
        aria-label={copy.menu(template.name)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl text-muted hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreHorizOutlined aria-hidden="true" />
      </button>
      <Menu
        id={id}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        slotProps={{ list: { "aria-labelledby": `${id}-trigger` } }}
      >
        {allowed.map((action) => (
          <MenuItem
            key={action}
            className="min-h-11"
            onClick={() => {
              setAnchor(null);
              if (!pending && template.allowedActions.includes(action))
                onAction(template, action);
            }}
          >
            {copy.actions[action]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/** One report area's personal templates. The host owns user/workspace isolation and run-time authorization. */
export function ReportTemplateList({
  templates,
  canRead,
  canCreate,
  state = "ready",
  pendingIds = [],
  onCreate,
  onAction,
  onRetry,
}: ReportTemplateListProps) {
  const id = useId();
  if (!canRead) return <FormFeedback kind="error" message={copy.denied} />;
  const ready = state === "ready";
  return (
    <section
      aria-labelledby={`${id}-title`}
      aria-busy={state === "loading"}
      className="grid min-w-0 gap-5 rounded-2xl border border-line bg-paper p-4 text-ink sm:p-6"
    >
      <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-1">
          <h2 id={`${id}-title`} className="m-0 text-xl font-semibold">
            {copy.title}
          </h2>
          <HelpTooltip label={copy.help} paragraphs={[copy.description]} />
        </div>
        {canCreate && ready && templates.length > 0 && (
          <SeafoamButton size={14} label={copy.create} onClick={onCreate} />
        )}
      </header>
      {state === "loading" && (
        <p role="status" className="m-0 py-6 text-sm text-muted">
          {copy.loading}
        </p>
      )}
      {state === "error" && (
        <div className="grid justify-items-start gap-4">
          <FormFeedback kind="error" message={copy.failed} />
          <button type="button" className={secondary} onClick={onRetry}>
            {copy.retry}
          </button>
        </div>
      )}
      {ready &&
        (templates.length === 0 ? (
          <div className="grid justify-items-center gap-3 py-6 text-center">
            <h3 className="m-0 text-lg font-semibold">{copy.emptyTitle}</h3>
            <p className="m-0 max-w-md text-sm leading-6 text-muted">
              {canCreate ? copy.empty : copy.emptyReadOnly}
            </p>
            {canCreate && (
              <SeafoamButton
                label={copy.create}
                className="mt-2"
                onClick={onCreate}
              />
            )}
          </div>
        ) : (
          <ul className="m-0 grid min-w-0 list-none gap-4 p-0" role="list">
            {templates.map((template) => {
              const pending = pendingIds.includes(template.id);
              return (
                <li key={template.id} className="min-w-0">
                  <article
                    aria-labelledby={`${id}-${template.id}`}
                    aria-busy={pending}
                    className="grid min-w-0 gap-4 rounded-xl border border-line p-4 sm:p-5"
                  >
                    <div className="flex min-w-0 flex-wrap items-start gap-3">
                      <div className="grid min-w-0 flex-1 gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3
                            id={`${id}-${template.id}`}
                            className="m-0 min-w-0 text-lg font-semibold wrap-anywhere"
                          >
                            {template.name}
                          </h3>
                          <StatusBadge label={copy.personal} tone="neutral" />
                          <HelpTooltip
                            label={copy.templateHelp(template.name)}
                            paragraphs={[copy.description]}
                          />
                        </div>
                        <p className="m-0 text-sm text-muted wrap-anywhere">
                          {template.viewLabel}
                        </p>
                      </div>
                      <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-1">
                        {template.allowedActions.includes("run") && (
                          <SeafoamOutlineButton
                            label={copy.actions.run}
                            disabled={pending}
                            aria-label={copy.actionLabel(
                              copy.actions.run,
                              template.name,
                            )}
                            onClick={() => {
                              if (
                                !pending &&
                                template.allowedActions.includes("run")
                              )
                                onAction(template, "run");
                            }}
                          />
                        )}
                        <TemplateMenu
                          template={template}
                          pending={pending}
                          onAction={onAction}
                        />
                      </div>
                    </div>
                    <dl className="m-0 grid min-w-0 gap-3 sm:grid-cols-3">
                      {[
                        [copy.period, template.periodLabel],
                        [copy.assignment, template.assignmentLabel],
                        [copy.group, template.groupLabel],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="grid min-w-0 content-start gap-1"
                        >
                          <dt className="text-xs text-muted">{label}</dt>
                          <dd className="m-0 text-sm font-semibold wrap-anywhere">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {pending && (
                      <p role="status" className="m-0 text-sm text-muted">
                        {copy.pending}
                      </p>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        ))}
    </section>
  );
}
