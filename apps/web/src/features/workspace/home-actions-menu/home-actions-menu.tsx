'use client';

import { useId, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MoreHorizOutlined } from '@salesmora/ui';
import { homeActionsMenuData as copy } from './home-actions-menu.data';

export type HomeAction = {
  id: keyof typeof copy.actions;
} & (
  | { href: string; onSelect?: never }
  | { href?: never; onSelect: () => void }
);

export interface HomeActionsMenuProps {
  /** Only currently authorized actions; link destinations must include the workspace. */
  actions: readonly HomeAction[];
}

export function HomeActionsMenu({ actions }: HomeActionsMenuProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (actions.length === 0) return null;
  return (
    <>
      <button
        id={`${id}-trigger`}
        type="button"
        aria-label={copy.label}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        aria-controls={anchor ? `${id}-menu` : undefined}
        onClick={event => setAnchor(event.currentTarget)}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper text-primary hover:bg-canvas focus-visible:focus-ring"
      >
        <MoreHorizOutlined aria-hidden="true" />
      </button>
      <Menu
        id={`${id}-menu`}
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ list: { 'aria-labelledby': `${id}-trigger` } }}
      >
        {actions.map(action => action.href !== undefined ? (
          <MenuItem
            key={action.id}
            component="a"
            href={action.href}
            onClick={() => setAnchor(null)}
            className="min-h-11 whitespace-normal text-ink focus-visible:focus-ring"
          >
            {copy.actions[action.id]}
          </MenuItem>
        ) : (
          <MenuItem
            key={action.id}
            onClick={() => { setAnchor(null); action.onSelect(); }}
            className="min-h-11 whitespace-normal text-ink focus-visible:focus-ring"
          >
            {copy.actions[action.id]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
