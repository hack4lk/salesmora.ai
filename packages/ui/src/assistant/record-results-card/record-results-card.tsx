"use client";
import { useId } from "react";
import { recordResultsCardData as c } from "./record-results-card.data";
export type AssistantRecordResult = {
  id: string;
  number: string;
  name: string;
  detail: string;
};
export function RecordResultsCard({
  kind,
  records,
  total,
  onOpen,
  onOpenList,
}: {
  kind: "customers" | "leads";
  records: readonly AssistantRecordResult[];
  total: number;
  onOpen: (id: string) => void;
  onOpenList?: () => void;
}) {
  const id = useId(),
    shown = records.slice(0, 10);
  return (
    <section
      aria-labelledby={id}
      className="grid min-w-0 gap-4 rounded-xl border border-assistant-border bg-assistant-surface p-5 text-assistant-foreground"
    >
      <h3 id={id} className="m-0 text-lg font-semibold">
        {c.titles[kind]}
      </h3>
      <p role="status" className="m-0 text-sm text-assistant-muted">
        {shown.length
          ? c.count(shown.length, Math.max(total, shown.length))
          : c.empty}
      </p>
      <ul className="m-0 grid list-none gap-3 p-0">
        {shown.map((record) => (
          <li key={record.id}>
            <button
              type="button"
              onClick={() => onOpen(record.id)}
              className="grid min-h-11 w-full min-w-0 cursor-pointer gap-2 rounded-xl border border-assistant-border bg-assistant-message p-4 text-left text-assistant-foreground focus-visible:focus-ring"
            >
              <strong className="text-sm wrap-anywhere">
                {record.number} · {record.name}
              </strong>
              <span className="text-sm text-assistant-muted wrap-anywhere">
                {record.detail}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {onOpenList && (
        <button
          type="button"
          onClick={onOpenList}
          className="min-h-11 cursor-pointer rounded-xl border border-assistant-border px-4 py-2 text-sm font-semibold focus-visible:focus-ring"
        >
          {c.open[kind]}
        </button>
      )}
    </section>
  );
}
