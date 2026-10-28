"use client";
import { useId, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { MoreHorizOutlined } from "@salesmora/ui";
import type {
  EstimateCapabilities,
  EstimateStatus,
} from "../estimate-preview.types";
import { getEstimateRowActions, type EstimateRowAction } from "../estimate-actions";
import { estimateRowMenuData as c } from "./estimate-row-menu.data";

export type { EstimateRowAction } from "../estimate-actions";

export type EstimateMenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  title?: string;
  destructive?: boolean;
  onSelect: () => void;
};

export function EstimateRowMenu({
  name,
  status,
  archived = false,
  capabilities,
  disabled = false,
  onAction,
}: {
  name: string;
  status: EstimateStatus;
  archived?: boolean;
  capabilities: EstimateCapabilities;
  disabled?: boolean;
  onAction: (action: EstimateRowAction) => void;
}) {
  if (!capabilities.read) return null;
  const actions = getEstimateRowActions({ status, archived, capabilities });
  return <EstimateActionsMenu name={name} disabled={disabled} items={actions.map(action => ({
    id: action,
    label: c.actions[action],
    destructive: action === "delete-draft",
    onSelect: () => onAction(action),
  }))} />;
}

export function EstimateActionsMenu({
  name,
  items,
  disabled = false,
}: {
  name: string;
  items: readonly EstimateMenuItem[];
  disabled?: boolean;
}) {
  const id = useId(),
    [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!items.length) return null;
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={c.label(name)}
        aria-haspopup="menu"
        aria-expanded={!!anchor}
        aria-controls={anchor ? id : undefined}
        onClick={(event) => {
          event.stopPropagation();
          setAnchor(event.currentTarget);
        }}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper text-muted hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreHorizOutlined aria-hidden="true" />
      </button>
      <Menu
        id={id}
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {items.map((item) => (
          <MenuItem
            key={item.id}
            disabled={disabled || item.disabled}
            title={item.title}
            onClick={() => {
              setAnchor(null);
              item.onSelect();
            }}
            className={`min-h-11 whitespace-normal focus-visible:focus-ring ${item.destructive ? "text-red-800" : "text-ink"}`}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
