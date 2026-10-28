import { estimateButton, estimatePanel, estimatePrimary } from "../estimate-ui";
import { estimatesEmptyStateData as c } from "./estimates-empty-state.data";

export function EstimatesEmptyState({
  filtered = false,
  onAdd,
  onClear,
}: {
  filtered?: boolean;
  onAdd?: () => void;
  onClear?: () => void;
}) {
  return (
    <section className={`${estimatePanel} grid gap-4 py-12 text-center`}>
      <h2 className="m-0 text-xl font-semibold">
        {filtered ? c.filteredTitle : c.title}
      </h2>
      <p className="m-0 text-muted">{filtered ? c.filteredHint : c.hint}</p>
      <div>
        {filtered && onClear ? (
          <button type="button" className={estimateButton} onClick={onClear}>
            {c.clear}
          </button>
        ) : (
          !filtered &&
          onAdd && (
            <button type="button" className={estimatePrimary} onClick={onAdd}>
              {c.add}
            </button>
          )
        )}
      </div>
    </section>
  );
}

