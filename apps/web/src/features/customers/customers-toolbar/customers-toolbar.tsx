"use client";
import { useId } from "react";
import { FilterBar } from "@salesmora/ui";
import type { CustomerMember } from "../customer-preview.types";
import { customerInput } from "../customer-ui";
import { customersToolbarData as c } from "./customers-toolbar.data";
export type CustomerFilters = {
  search: string;
  relationship: "all" | "lead" | "job" | "past";
  owner: string;
  type: "all" | "person" | "business";
  sort: "name" | "name-desc" | "activity" | "newest";
  archived: boolean;
};
export const defaultCustomerFilters: CustomerFilters = {
  search: "",
  relationship: "all",
  owner: "all",
  type: "all",
  sort: "name",
  archived: false,
};
export type CustomersToolbarProps = {
  value: CustomerFilters;
  members: readonly CustomerMember[];
  count: number;
  disabled?: boolean;
  canArchive?: boolean;
  jobsAvailable?: boolean;
  onChange: (value: CustomerFilters) => void;
};
export function CustomersToolbar({
  value,
  members,
  count,
  disabled,
  canArchive,
  jobsAvailable,
  onChange,
}: CustomersToolbarProps) {
  const id = useId();
  const change = (patch: Partial<CustomerFilters>) => {
    if (!disabled) onChange({ ...value, ...patch });
  };
  const active = [
    value.search && { id: "search", label: c.searchFilter(value.search) },
    value.relationship !== "all" && {
      id: "relationship",
      label: c.relationships[value.relationship],
    },
    value.owner !== "all" && {
      id: "owner",
      label: members.find((m) => m.id === value.owner)?.name ?? c.unassigned,
    },
    value.type !== "all" && { id: "type", label: c.types[value.type] },
    canArchive && value.archived && { id: "archived", label: c.archived },
  ].filter((item): item is { id: string; label: string } => !!item);
  return (
    <div className="grid min-w-0 gap-4">
      <FilterBar
        title={c.title}
        activeFilters={active}
        disabled={disabled}
        onRemove={(key) =>
          change({
            [key]: defaultCustomerFilters[key as keyof CustomerFilters],
          })
        }
        onClearAll={() =>
          onChange({ ...defaultCustomerFilters, sort: value.sort })
        }
      >
        <div className="grid min-w-0 flex-1 basis-full gap-4 sm:grid-cols-2 lg:basis-0 lg:grid-cols-5">
          <label
            htmlFor={`${id}-search`}
            className="grid min-w-0 gap-2 text-sm font-semibold text-ink"
          >
            {c.search}
            <input
              id={`${id}-search`}
              type="search"
              maxLength={200}
              value={value.search}
              disabled={disabled}
              className={customerInput}
              placeholder={c.placeholder}
              onChange={(e) => change({ search: e.target.value })}
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
            {c.relationship}
            <select
              className={customerInput}
              value={value.relationship}
              disabled={disabled}
              onChange={(e) =>
                change({
                  relationship: e.target
                    .value as CustomerFilters["relationship"],
                })
              }
            >
              {Object.entries(c.relationships)
                .filter(
                  ([key]) => jobsAvailable || (key !== "job" && key !== "past"),
                )
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
            {c.owner}
            <select
              className={customerInput}
              value={value.owner}
              disabled={disabled}
              onChange={(e) => change({ owner: e.target.value })}
            >
              <option value="all">{c.allOwners}</option>
              <option value="unassigned">{c.unassigned}</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
            {c.type}
            <select
              className={customerInput}
              value={value.type}
              disabled={disabled}
              onChange={(e) =>
                change({ type: e.target.value as CustomerFilters["type"] })
              }
            >
              {Object.entries(c.types).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
            {c.sort}
            <select
              className={customerInput}
              value={value.sort}
              disabled={disabled}
              onChange={(e) =>
                change({ sort: e.target.value as CustomerFilters["sort"] })
              }
            >
              {Object.entries(c.sorts).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {canArchive && (
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
            <input
              role="switch"
              type="checkbox"
              checked={value.archived}
              disabled={disabled}
              onChange={(e) => change({ archived: e.target.checked })}
              className="size-5 cursor-pointer accent-primary focus-visible:focus-ring"
            />
            {c.archived}
          </label>
        )}
      </FilterBar>
      <p role="status" aria-live="polite" className="m-0 text-sm text-muted">
        {c.count(count)}
      </p>
    </div>
  );
}
