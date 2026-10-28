'use client';

import { useId, useState } from 'react';
import { jobButton, jobInput, jobLabel, jobPrimary } from '../../jobs/job-ui';
import { GANTT_PRESET_DAYS, getPresetRange, getRangeError, type GanttRange } from '../gantt-timeline';
import { ganttDateRangeData as copy } from './gantt-date-range.data';

export type GanttDateRangeProps = {
  /** YYYY-MM-DD in the workspace timezone; presets start on this day. */
  today: string;
  /** Inclusive start and end of the range shown on the chart. */
  value: GanttRange;
  /** Called only with valid ranges. */
  onChange: (range: GanttRange) => void;
};

const presetClass = 'flex-1 sm:flex-none';

/** Chooses the visible date range from presets or custom start and end dates. */
export function GanttDateRange({ today, value, onChange }: GanttDateRangeProps) {
  const id = useId();
  const [draft, setDraft] = useState<GanttRange>(value);
  const [syncedValue, setSyncedValue] = useState<GanttRange>(value);
  const error = getRangeError(draft.startDate, draft.endDate);

  // Adopt a new value from the parent without discarding an in-progress invalid draft on unrelated renders
  if (syncedValue.startDate !== value.startDate || syncedValue.endDate !== value.endDate) {
    setSyncedValue(value);
    setDraft(value);
  }

  const update = (next: GanttRange) => {
    setDraft(next);
    if (!getRangeError(next.startDate, next.endDate)) onChange(next);
  };

  return (
    <fieldset className="m-0 grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-5">
      <legend className="px-1 text-sm font-semibold text-ink">{copy.legend}</legend>
      <div className="flex flex-wrap items-end gap-3">
        <div role="group" aria-label={copy.presets} className="flex min-w-0 flex-wrap gap-2">
          {GANTT_PRESET_DAYS.map((days) => {
            const preset = getPresetRange(today, days);
            const active = preset.startDate === value.startDate && preset.endDate === value.endDate;
            return (
              <button
                key={days}
                type="button"
                aria-pressed={active}
                className={`${active ? jobPrimary : jobButton} ${presetClass}`}
                onClick={() => update(preset)}
              >
                {copy.preset(days)}
              </button>
            );
          })}
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={jobLabel}>
            {copy.from}
            <input
              type="date"
              className={jobInput}
              value={draft.startDate}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => update({ ...draft, startDate: event.target.value })}
            />
          </label>
          <label className={jobLabel}>
            {copy.to}
            <input
              type="date"
              className={jobInput}
              value={draft.endDate}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => update({ ...draft, endDate: event.target.value })}
            />
          </label>
        </div>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="m-0 text-sm font-semibold text-error">{copy.errors[error]}</p>}
    </fieldset>
  );
}
