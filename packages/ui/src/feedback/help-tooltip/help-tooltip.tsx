'use client';

import { useId, useState } from 'react';
import Popover from '@mui/material/Popover';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

export type HelpTooltipProps = {
  /** Describe the topic, for example “About choosing a Gmail example”. */
  label: string;
  paragraphs: readonly string[];
};

/** Opens contextual help on click, tap, or keyboard activation. */
export function HelpTooltip({ label, paragraphs }: HelpTooltipProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const close = () => setAnchor(null);

  return <>
    <button type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={!!anchor}
      aria-controls={anchor ? id : undefined} onClick={event => setAnchor(event.currentTarget)}
      className="inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-primary-dark hover:bg-canvas focus-visible:focus-ring">
      <InfoOutlined aria-hidden="true" fontSize="small" />
    </button>
    <Popover open={!!anchor} anchorEl={anchor} onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{ paper: {
        id, role: 'dialog', 'aria-modal': true, 'aria-labelledby': `${id}-title`,
        className: 'w-96 rounded-xl border border-line bg-paper p-4 text-ink shadow-lg',
      } }}>
      <div className="grid gap-3 wrap-anywhere">
        <div className="flex items-center justify-between gap-3">
          <p id={`${id}-title`} className="m-0 min-w-0 font-semibold">{label}</p>
          <button type="button" onClick={close}
            className="min-h-11 shrink-0 cursor-pointer rounded-lg px-2 text-sm font-semibold text-primary-dark hover:bg-canvas focus-visible:focus-ring">
            Close
          </button>
        </div>
        {paragraphs.map((paragraph, index) => <p key={index} className="m-0 text-sm leading-6">{paragraph}</p>)}
      </div>
    </Popover>
  </>;
}
