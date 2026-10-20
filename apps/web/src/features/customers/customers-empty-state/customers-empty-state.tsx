import { customerButton, customerPrimary, customerPanel } from "../customer-ui";
import { customersEmptyStateData as c } from "./customers-empty-state.data";
export function CustomersEmptyState({
  filtered = false,
  onAdd,
  onClear,
}: {
  filtered?: boolean;
  onAdd?: () => void;
  onClear?: () => void;
}) {
  return (
    <section className={`${customerPanel} grid gap-4 py-12 text-center`}>
      <h2 className="m-0 text-xl font-semibold">
        {filtered ? c.filteredTitle : c.title}
      </h2>
      <p className="m-0 text-muted">{filtered ? c.filteredHint : c.hint}</p>
      <div>
        {filtered && onClear ? (
          <button type="button" className={customerButton} onClick={onClear}>
            {c.clear}
          </button>
        ) : (
          !filtered &&
          onAdd && (
            <button type="button" className={customerPrimary} onClick={onAdd}>
              {c.add}
            </button>
          )
        )}
      </div>
    </section>
  );
}
