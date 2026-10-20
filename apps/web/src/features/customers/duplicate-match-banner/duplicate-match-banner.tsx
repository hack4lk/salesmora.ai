"use client";
import { useId } from "react";
import { customerButton } from "../customer-ui";
import { duplicateMatchBannerData as c } from "./duplicate-match-banner.data";
export type CustomerDuplicateMatch = {
  id: string;
  name: string;
  number: string;
  reason: "email" | "phone" | "name";
};
export function DuplicateMatchBanner({
  matches,
  disabled,
  onUseExisting,
  onCreateAnyway,
}: {
  matches: readonly CustomerDuplicateMatch[];
  disabled?: boolean;
  onUseExisting: (id: string) => void;
  onCreateAnyway: () => void;
}) {
  const id = useId();
  if (!matches.length) return null;
  return (
    <section
      aria-labelledby={id}
      className="grid min-w-0 gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950"
    >
      <h3 id={id} className="m-0 text-base font-semibold">
        {c.title}
      </h3>
      <p className="m-0 text-sm">{c.hint}</p>
      <ul className="m-0 grid list-none gap-4 p-0">
        {matches.map((match) => (
          <li key={match.id} className="grid min-w-0 gap-2">
            <strong className="wrap-anywhere">
              {match.name} · {match.number}
            </strong>
            <span className="text-sm">{c.reasons[match.reason]}</span>
            <button
              type="button"
              disabled={disabled}
              className={customerButton}
              onClick={() => onUseExisting(match.id)}
              aria-label={c.useRecord(match.number)}
            >
              {c.use}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={disabled}
        className={customerButton}
        onClick={onCreateAnyway}
      >
        {c.anyway}
      </button>
    </section>
  );
}
