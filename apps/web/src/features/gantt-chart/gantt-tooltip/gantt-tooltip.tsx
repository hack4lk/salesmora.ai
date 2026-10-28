'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type GanttTooltipTriggerProps = {
  ref: (element: HTMLElement | null) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  'aria-describedby': string | undefined;
};

export type GanttTooltipProps = {
  content: ReactNode;
  /** Receives the props to spread on the single element that triggers the tooltip. */
  children: (triggerProps: GanttTooltipTriggerProps) => ReactNode;
};

const VIEWPORT_GAP_PX = 8;

/**
 * Shows non-interactive details while its trigger is hovered or focused.
 * Rendered in a portal with fixed positioning so the scrolling chart cannot clip it.
 * Escape and any scroll dismiss it.
 */
export function GanttTooltip({ content, children }: GanttTooltipProps) {
  const id = useId();
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const show = () => setAnchor(trigger?.getBoundingClientRect() ?? null);
  const hide = () => { setAnchor(null); setPosition(null); };

  useLayoutEffect(() => {
    if (!anchor || !tooltipRef.current) return;
    const { width, height } = tooltipRef.current.getBoundingClientRect();
    const below = anchor.bottom + VIEWPORT_GAP_PX;
    const fitsBelow = below + height <= window.innerHeight - VIEWPORT_GAP_PX;
    setPosition({
      top: fitsBelow ? below : Math.max(VIEWPORT_GAP_PX, anchor.top - VIEWPORT_GAP_PX - height),
      left: Math.max(VIEWPORT_GAP_PX, Math.min(anchor.left, window.innerWidth - VIEWPORT_GAP_PX - width)),
    });
  }, [anchor]);

  useEffect(() => {
    if (!anchor) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') hide(); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', hide, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', hide, true);
    };
  }, [anchor]);

  return (
    <>
      {children({
        ref: setTrigger,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
        'aria-describedby': anchor ? id : undefined,
      })}
      {anchor && createPortal(
        // Top and left are measured from the trigger at runtime
        <div
          ref={tooltipRef}
          id={id}
          role="tooltip"
          className={`pointer-events-none fixed z-50 w-72 rounded-xl border border-line bg-paper p-4 text-ink shadow-lg ${position ? '' : 'invisible'}`}
          style={{ top: position?.top ?? 0, left: position?.left ?? 0 }}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
}
