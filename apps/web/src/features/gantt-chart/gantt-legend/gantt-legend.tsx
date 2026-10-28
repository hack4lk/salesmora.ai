'use client';

import { ganttLegendData as copy } from './gantt-legend.data';

/**
 * Legend displaying the color and meaning for job and work order statuses.
 */
export function GanttLegend() {
  return (
    <ul
      aria-label={copy.label}
      className="m-0 grid list-none grid-cols-2 gap-4 rounded-lg border border-line bg-paper p-4 text-ink sm:flex sm:flex-wrap sm:gap-6"
    >
      {copy.items.map((item) => (
        <li key={item.id} className="flex items-center gap-2.5">
          <span aria-hidden="true" className={`size-5 rounded-sm ${item.swatchClass}`} />
          <span className="text-sm font-medium">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
