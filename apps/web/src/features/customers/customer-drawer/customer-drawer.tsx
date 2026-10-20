"use client";
import { SideDrawer, FormFeedback, StatusBadge } from "@salesmora/ui";
import type {
  CustomerRecord,
  CustomerCapabilities,
  CustomerMember,
  CustomerEvent,
  LinkedCustomerRecord,
  CustomerViewState,
} from "../customer-preview.types";
import { CustomerContactCard } from "../customer-contact-card/customer-contact-card";
import { LinkedRecordList } from "../linked-record-list/linked-record-list";
import { CustomerTimeline } from "../customer-timeline/customer-timeline";
import { customerButton, customerPrimary } from "../customer-ui";
import { customerDrawerData as c } from "./customer-drawer.data";
export type CustomerDrawerProps = {
  open: boolean;
  customer?: CustomerRecord;
  members: readonly CustomerMember[];
  capabilities: CustomerCapabilities;
  leads: readonly LinkedCustomerRecord[];
  events: readonly CustomerEvent[];
  jobs?: readonly LinkedCustomerRecord[];
  state?: CustomerViewState;
  onClose: () => void;
  onEdit: () => void;
  onProfile: () => void;
  onOpenRecord: (id: string) => void;
  onRetry?: () => void;
};
export function CustomerDrawer({
  open,
  customer,
  members,
  capabilities,
  leads,
  events,
  jobs,
  state = "ready",
  onClose,
  onEdit,
  onProfile,
  onOpenRecord,
  onRetry,
}: CustomerDrawerProps) {
  const visible = capabilities.read && state === "ready" && customer;
  return (
    <SideDrawer
      open={open}
      title={visible ? customer.name : c.title}
      description={visible ? customer.number : undefined}
      onClose={onClose}
      footer={
        visible ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={customerButton}
              onClick={onProfile}
            >
              {c.profile}
            </button>
            {capabilities.update && !customer.archived && (
              <button
                type="button"
                className={customerPrimary}
                onClick={onEdit}
              >
                {c.edit}
              </button>
            )}
          </div>
        ) : undefined
      }
    >
      {visible ? (
        <div className="grid min-w-0 gap-6">
          {customer.archived && <StatusBadge label={c.archived} />}
          <CustomerContactCard customer={customer} members={members} />
          <LinkedRecordList records={leads} onOpen={onOpenRecord} />
          {jobs && (
            <>
              <p className="m-0 text-sm text-muted">{c.future}</p>
              <LinkedRecordList
                records={jobs}
                title={c.jobs}
                onOpen={onOpenRecord}
              />
            </>
          )}
          <CustomerTimeline events={events} />
        </div>
      ) : (
        <div className="grid gap-4">
          {state === "loading" && capabilities.read ? (
            <p role="status" className="text-muted">
              {c.loading}
            </p>
          ) : (
            <FormFeedback
              kind="error"
              message={
                !capabilities.read || state === "forbidden"
                  ? c.forbidden
                  : state === "error"
                    ? c.error
                    : c.missing
              }
            />
          )}{" "}
          {state === "error" && capabilities.read && onRetry && (
            <button type="button" className={customerButton} onClick={onRetry}>
              {c.retry}
            </button>
          )}
        </div>
      )}
    </SideDrawer>
  );
}
