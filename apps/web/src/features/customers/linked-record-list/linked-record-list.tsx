"use client";
import { useId } from "react";
import { StatusBadge } from "@salesmora/ui";
import type { LinkedCustomerRecord } from "../customer-preview.types";
import { customerButton } from "../customer-ui";
import { linkedRecordListData as c } from "./linked-record-list.data";
export function LinkedRecordList({
  records,
  title = c.title,
  total = records.length,
  onOpen,
  onViewAll,
  onUnlink,
  busy = false,
}: {
  records: readonly LinkedCustomerRecord[];
  title?: string;
  total?: number;
  onOpen: (id: string) => void;
  onViewAll?: () => void;
  onUnlink?: (record: LinkedCustomerRecord) => void;
  busy?: boolean;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="grid min-w-0 gap-4">
      <h2 id={id} className="m-0 text-lg font-semibold text-ink">
        {title}
      </h2>
      {records.length ? (
        <ul className="m-0 grid list-none gap-3 p-0">
          {records.map((record) => (
            <li
              key={record.id}
              className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-line p-3"
            >
              <button
                type="button"
                disabled={busy}
                onClick={() => onOpen(record.id)}
                className="grid min-h-11 min-w-0 flex-1 cursor-pointer gap-1 rounded-lg text-left text-ink focus-visible:focus-ring disabled:cursor-not-allowed"
              >
                <strong className="wrap-anywhere">{record.name}</strong>
                <span className="text-sm text-muted wrap-anywhere">
                  {record.number}
                </span>
              </button>
              <StatusBadge label={record.status} tone="info" />
              {onUnlink && record.canUnlink !== false && (
                <button
                  type="button"
                  className={customerButton}
                  disabled={busy}
                  onClick={() => onUnlink(record)}
                  aria-label={c.unlinkRecord(record.number)}
                >
                  {c.unlink}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm text-muted">{c.empty}</p>
      )}
      {total > records.length && onViewAll && (
        <button type="button" className={customerButton} onClick={onViewAll}>
          {c.more(total - records.length)}
        </button>
      )}
    </section>
  );
}
