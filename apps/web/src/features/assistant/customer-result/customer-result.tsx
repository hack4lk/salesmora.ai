"use client";
import { useEffect, useRef, useState } from "react";
import {
  CustomerDraftCard,
  CustomerExportDraftCard,
  RecordResultsCard,
  FormFeedback,
} from "@salesmora/ui";
import {
  customerDraftSchema,
  type CustomerChatResult,
  type CustomerChatDraft,
} from "@salesmora/contracts";
import { customerResultData as c } from "./customer-result.data";
export function ConnectedCustomerResult({
  result,
  workspaceId,
  disabled,
  onRefresh,
  onNavigate,
}: {
  result: CustomerChatResult;
  workspaceId: string;
  disabled: boolean;
  onRefresh: (deleted?: boolean) => Promise<void>;
  onNavigate: (href: string) => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (result.draft?.action !== "export" || result.draft.state !== "pending")
      return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [result.draft?.id, result.draft?.action, result.draft?.state]);
  const [error, setError] = useState(""),
    lock = useRef(false);
  async function decide(
    draft: CustomerChatDraft,
    decision: "confirm" | "cancel",
    consent?: { typedCustomerNumber: string; unlinkOpenLeads: boolean },
  ) {
    if (disabled || lock.current) throw Error(c.failed);
    lock.current = true;
    setError("");
    try {
      const response = await fetch("/api/chat/customers/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          draftId: draft.id,
          inputHash: draft.inputHash,
          decision,
          ...(consent
            ? {
                typedConfirmation: consent.typedCustomerNumber,
                unlinkOpenLeads: consent.unlinkOpenLeads,
              }
            : {}),
        }),
      });
      if (!response.ok) {
        await onRefresh();
        throw Error(c.failed);
      }
      if (draft.action === "export" && decision === "confirm") {
        const blob = await response.blob(),
          url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = c.downloadName;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else customerDraftSchema.parse((await response.json()).draft);
      await onRefresh(draft.action === "delete" && decision === "confirm");
    } catch {
      setError(c.failed);
      throw Error(c.failed);
    } finally {
      lock.current = false;
    }
  }
  async function navigate(id: string) {
    if (disabled || lock.current) return;
    lock.current = true;
    setError("");
    try {
      const kind = ["linked_leads", "lead_candidates"].includes(result.kind)
        ? "lead"
        : "customer";
      const response = await fetch("/api/chat/customers/navigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          turnId: result.turnId,
          recordId: id,
          kind,
        }),
      });
      if (!response.ok) throw Error();
      const body = await response.json();
      if (
        typeof body.href !== "string" ||
        !/^\/(customers|leads)\/[0-9a-f-]{36}\?workspace=[0-9a-f-]{36}$/.test(
          body.href,
        )
      )
        throw Error();
      onNavigate(body.href);
    } catch {
      setError(c.failed);
      await onRefresh();
    } finally {
      lock.current = false;
    }
  }
  const draft = result.draft;
  return (
    <div className="grid min-w-0 gap-4">
      {error && <FormFeedback kind="error" message={error} />}
      {draft ? (
        draft.action === "export" ? (
          <CustomerExportDraftCard
            count={draft.count ?? 0}
            scope={
              draft.impact ?? `${c.exportScope} · ${draft.customer.number}`
            }
            columns={draft.columns ?? []}
            state={
              draft.state === "confirmed"
                ? "confirmed"
                : draft.state !== "pending" ||
                    Date.parse(draft.expiresAt) <= now
                  ? "expired"
                  : "pending"
            }
            onDownload={disabled ? undefined : () => decide(draft, "confirm")}
          />
        ) : (
          <CustomerDraftCard
            draft={{ ...draft, action: draft.action }}
            disabled={disabled}
            onDecide={(_proposal, decision, consent) =>
              decide(draft, decision, consent)
            }
          />
        )
      ) : (
        <>
          {result.records.length > 0 && (
            <RecordResultsCard
              kind={
                ["linked_leads", "lead_candidates"].includes(result.kind)
                  ? "leads"
                  : "customers"
              }
              records={result.records}
              total={result.total}
              onOpen={(id) => void navigate(id)}
            />
          )}
          {(result.fields.length > 0 ||
            result.entries.length > 0 ||
            result.records.length === 0) && (
            <section
              aria-label={result.title}
              className="grid min-w-0 gap-3 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground"
            >
              <h3 className="m-0 text-lg font-semibold wrap-anywhere">
                {result.title}
              </h3>
              <dl className="m-0 grid min-w-0 gap-3">
                {result.fields.map((field, index) => (
                  <div key={index}>
                    <dt className="text-sm font-semibold">{field.label}</dt>
                    <dd className="m-0 whitespace-pre-wrap text-sm wrap-anywhere">
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {result.entries.length > 0 && (
                <>
                  <p className="m-0 text-sm">
                    {c.count(result.entries.length, result.total)}
                  </p>
                  <ul className="m-0 grid list-none gap-3 p-0">
                    {result.entries.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-lg border border-assistant-border p-3 text-sm"
                      >
                        <p className="m-0 whitespace-pre-wrap wrap-anywhere">
                          {entry.text}
                        </p>
                        <p className="mb-0 text-assistant-muted wrap-anywhere">
                          {entry.actor} ·{" "}
                          <time dateTime={entry.createdAt}>
                            {new Date(entry.createdAt).toLocaleString()}
                          </time>
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
