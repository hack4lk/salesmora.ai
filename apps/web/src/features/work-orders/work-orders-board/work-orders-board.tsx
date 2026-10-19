"use client";
import { useId, useRef, useState } from "react";
import { workOrderStatuses, type WorkOrderStatus } from "@salesmora/contracts";
import { DragIndicatorOutlined } from "@salesmora/ui";
import type {
  WorkOrderListAction,
  WorkOrderView,
} from "../work-order-preview.types";
import { allowedTransitions } from "../work-order-transitions";
import { WorkOrderCard } from "../work-order-card/work-order-card";
import { workOrderStatusBadgeData } from "../work-order-status-badge/work-order-status-badge.data";
import { copy } from "./work-orders-board.data";

export type WorkOrdersBoardProps = {
  rows: WorkOrderView[];
  pendingId?: string;
  onOpen: (w: WorkOrderView) => void;
  onAction: (w: WorkOrderView, a: WorkOrderListAction) => void;
  onRequestMove?: (w: WorkOrderView, to: WorkOrderStatus) => void;
};
export function WorkOrdersBoard({
  rows,
  pendingId,
  onOpen,
  onAction,
  onRequestMove,
}: WorkOrdersBoardProps) {
  const id = useId(),
    dragged = useRef<WorkOrderView | null>(null),
    [dragging, setDragging] = useState<string | null>(null),
    [over, setOver] = useState<WorkOrderStatus | null>(null);
  const canMove = (w: WorkOrderView) =>
    !!onRequestMove && !pendingId && allowedTransitions(w).length > 0;
  const accepts = (w: WorkOrderView | null, status: WorkOrderStatus) =>
    !!w && canMove(w) && allowedTransitions(w).includes(status);
  const end = () => {
    dragged.current = null;
    setDragging(null);
    setOver(null);
  };
  return (
    <div className="min-w-0">
      <p id={id} className="mt-0 text-sm leading-6 text-muted">
        {rows.some(canMove) ? (
          <>
            <span className="hidden sm:inline">{copy.instructions}</span>
            <span className="sm:hidden">{copy.mobileInstructions}</span>
          </>
        ) : (
          copy.readOnly
        )}
      </p>
      {pendingId && (
        <p role="status" className="mt-0 text-sm text-muted">
          {copy.pending}
        </p>
      )}
      <div
        role="region"
        aria-label={copy.label}
        aria-describedby={id}
        tabIndex={0}
        className="w-full min-w-0 max-w-full contain-content overflow-x-auto rounded-2xl pb-4 focus-visible:focus-ring"
      >
        <div className="flex items-start gap-4">
          {workOrderStatuses.map((status) => {
            const items = rows.filter((w) => w.status === status),
              drop = over === status && accepts(dragged.current, status),
              blocked =
                !!dragging &&
                !accepts(dragged.current, status) &&
                dragged.current?.status !== status;
            return (
              <section
                key={status}
                data-work-order-status={status}
                aria-labelledby={`${id}-${status}`}
                className={`w-72 shrink-0 rounded-2xl border bg-canvas p-3 sm:w-80 ${drop ? "border-primary ring-2 ring-primary" : "border-line"} ${blocked ? "opacity-60" : ""}`}
                onDragOver={(e) => {
                  if (accepts(dragged.current, status)) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setOver(status);
                  }
                }}
                onDragLeave={() => setOver((o) => (o === status ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  const w = dragged.current;
                  end();
                  if (w && accepts(w, status)) onRequestMove?.(w, status);
                }}
              >
                <header className="mb-4">
                  <h2
                    id={`${id}-${status}`}
                    className="m-0 text-base font-semibold text-ink"
                  >
                    {workOrderStatusBadgeData[status].label}
                  </h2>
                  <p className="mb-0 mt-1 text-xs text-muted">
                    {copy.count(items.length)}
                  </p>
                </header>
                <div className="grid gap-3">
                  {items.map((w) => (
                    <WorkOrderCard
                      key={w.id}
                      workOrder={w}
                      hideStatus
                      dragging={dragging === w.id}
                      disabled={!!pendingId}
                      onOpen={() => onOpen(w)}
                      onAction={(a) => onAction(w, a)}
                      onDragStart={
                        canMove(w)
                          ? (e) => {
                              dragged.current = w;
                              setDragging(w.id);
                              e.dataTransfer.setData("text/plain", w.id);
                              e.dataTransfer.effectAllowed = "move";
                            }
                          : undefined
                      }
                      onDragEnd={end}
                      movementControl={
                        canMove(w) ? (
                          <button
                            type="button"
                            aria-label={copy.move(w.number)}
                            onClick={() => onAction(w, "status")}
                            className="inline-flex min-h-11 cursor-grab items-center justify-center rounded-xl px-2 text-sm font-semibold text-primary focus-visible:focus-ring"
                          >
                            <span className="sm:sr-only">
                              {copy.move(w.number)}
                            </span>
                            <DragIndicatorOutlined
                              aria-hidden="true"
                              className="hidden sm:block"
                            />
                          </button>
                        ) : undefined
                      }
                    />
                  ))}
                  {!items.length && (
                    <p className="py-8 text-sm text-muted">{copy.empty}</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
