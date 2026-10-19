"use client";
import { useId, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { MoreHorizOutlined } from "@salesmora/ui";
import type { CustomerCapabilities } from "../customer-preview.types";
import { customerButton } from "../customer-ui";
import { customerRowMenuData as c } from "./customer-row-menu.data";
export type CustomerRowAction =
  "view" | "edit" | "archive" | "restore" | "delete";
export function CustomerRowMenu({
  name,
  disabled = false,
  archived = false,
  capabilities,
  onAction,
}: {
  disabled?: boolean;
  name: string;
  archived?: boolean;
  capabilities: CustomerCapabilities;
  onAction: (action: CustomerRowAction) => void;
}) {
  const id = useId(),
    [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!capabilities.read) return null;
  const actions: CustomerRowAction[] = [
    "view",
    ...(capabilities.update && !archived ? ["edit" as const] : []),
    ...(capabilities.archive
      ? [archived ? ("restore" as const) : ("archive" as const)]
      : []),
    ...(capabilities.delete ? ["delete" as const] : []),
  ];
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={c.label(name)}
        aria-haspopup="menu"
        aria-expanded={!!anchor}
        aria-controls={anchor ? id : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
        className={customerButton}
      >
        <MoreHorizOutlined aria-hidden="true" />
      </button>
      <Menu
        id={id}
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
      >
        {actions.map((action) => (
          <MenuItem
            key={action}
            disabled={disabled}
            onClick={() => {
              setAnchor(null);
              onAction(action);
            }}
            className={`min-h-11 whitespace-normal focus-visible:focus-ring ${action === "delete" ? "text-red-800" : "text-ink"}`}
          >
            {c.actions[action]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
