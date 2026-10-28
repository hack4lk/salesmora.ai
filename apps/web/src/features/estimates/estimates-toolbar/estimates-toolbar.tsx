"use client";
import { useId } from "react";
import { FilterBar } from "@salesmora/ui";
import type { EstimateMember, EstimateStatus } from "../estimate-preview.types";
import { estimateInput } from "../estimate-ui";
import { estimatesToolbarData as c } from "./estimates-toolbar.data";

export type EstimateFilters = {
  search: string;
  status: "all" | EstimateStatus;
  owner: "all" | string;
  related: "all" | "lead" | "job";
  includeHidden: boolean;
};

export const defaultEstimateFilters: EstimateFilters = {
  search: "",
  status: "all",
  owner: "all",
  related: "all",
  includeHidden: false,
};

export type EstimatesToolbarProps = {
  value: EstimateFilters;
  members: readonly EstimateMember[];
  shownCount?: number;
  totalCount?: number;
  currentMemberId?: string;
  disabled?: boolean;
  onChange: (value: EstimateFilters) => void;
};

export function EstimatesToolbar({
  value,
  members,
  shownCount,
  totalCount,
  currentMemberId,
  disabled,
  onChange,
}: EstimatesToolbarProps) {
  const id = useId();
  const change = (patch: Partial<EstimateFilters>) => {
    if (!disabled) onChange({ ...value, ...patch });
  };
  const active = [
    value.search && { id: "search", label: c.searchFilter(value.search) },
    value.status !== "all" && {
      id: "status",
      label: c.statusFilter(c.statuses[value.status]),
    },
    value.owner !== "all" && {
      id: "owner",
      label: c.ownerFilter(
        value.owner === "me"
          ? c.me
          : value.owner === "unassigned"
            ? c.unassigned
            : members.find((member) => member.id === value.owner)?.name ?? value.owner,
      ),
    },
    value.related !== "all" && {
      id: "related",
      label: c.relatedFilter(c.relatedOptions[value.related]),
    },
    value.includeHidden && { id: "includeHidden", label: c.includeHidden },
  ].filter((item): item is { id: string; label: string } => !!item);
  return (
    <div className="grid min-w-0 gap-4">
      <FilterBar
        title={c.title}
        activeFilters={active}
        disabled={disabled}
        onRemove={(key) =>
          change({
            [key]: defaultEstimateFilters[key as keyof EstimateFilters],
          })
        }
        onClearAll={() => {
          if (!disabled) onChange(defaultEstimateFilters);
        }}
      >
        <div className="grid min-w-0 flex-1 basis-full gap-4 sm:grid-cols-2 lg:basis-0 lg:grid-cols-4">
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
              className={estimateInput}
              placeholder={c.placeholder}
              onChange={(event) => change({ search: event.target.value })}
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
            {c.status}
            <select
              className={estimateInput}
              value={value.status}
              disabled={disabled}
              onChange={(event) =>
                change({ status: event.target.value as EstimateFilters["status"] })
              }
            >
              <option value="all">{c.allStatuses}</option>
              {Object.entries(c.statuses).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
            {c.owner}
            <select
              className={estimateInput}
              value={value.owner}
              disabled={disabled}
              onChange={(event) => change({ owner: event.target.value })}
            >
              <option value="all">{c.allOwners}</option>
              {currentMemberId && <option value="me">{c.me}</option>}
              <option value="unassigned">{c.unassigned}</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
            {c.related}
            <select
              className={estimateInput}
              value={value.related}
              disabled={disabled}
              onChange={(event) =>
                change({ related: event.target.value as EstimateFilters["related"] })
              }
            >
              <option value="all">{c.allRelated}</option>
              {Object.entries(c.relatedOptions)
                .filter(([key]) => key !== "all")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
          <input
            role="switch"
            type="checkbox"
            checked={value.includeHidden}
            disabled={disabled}
            onChange={(event) => change({ includeHidden: event.target.checked })}
            className="size-5 cursor-pointer accent-primary focus-visible:focus-ring"
          />
          {c.includeHidden}
        </label>
      </FilterBar>
      <p role="status" aria-live="polite" className="m-0 text-sm text-muted">
        {shownCount !== undefined && totalCount !== undefined
          ? c.count(shownCount, totalCount)
          : c.countUnavailable}
      </p>
    </div>
  );
}
