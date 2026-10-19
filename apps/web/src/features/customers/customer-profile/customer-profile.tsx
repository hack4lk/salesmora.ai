"use client";
import { useState } from "react";
import { Pagination, FormFeedback, StatusBadge } from "@salesmora/ui";
import type {
  CustomerRecord,
  CustomerCapabilities,
  CustomerMember,
  CustomerEvent,
  CustomerNote,
  LinkedCustomerRecord,
  CustomerViewState,
} from "../customer-preview.types";
import { CustomerContactCard } from "../customer-contact-card/customer-contact-card";
import { CustomerNotes } from "../customer-notes/customer-notes";
import { LinkedRecordList } from "../linked-record-list/linked-record-list";
import { CustomerTimeline } from "../customer-timeline/customer-timeline";
import {
  CustomerRowMenu,
  type CustomerRowAction,
} from "../customer-row-menu/customer-row-menu";
import {
  customerButton,
  customerPanel,
  customerInitials,
} from "../customer-ui";
import { customerProfileData as c } from "./customer-profile.data";
export type CustomerProfileProps = {
  pending?: boolean;
  customer?: CustomerRecord;
  members: readonly CustomerMember[];
  capabilities: CustomerCapabilities;
  leads: readonly LinkedCustomerRecord[];
  events: readonly CustomerEvent[];
  notes: readonly CustomerNote[];
  leadsTotal?: number;
  leadsPage?: number;
  activityPage?: number;
  notesPage?: number;
  onLeadsPageChange?: (page: number) => void;
  onActivityPageChange?: (page: number) => void;
  onNotesPageChange?: (page: number) => void;
  activityTotal?: number;
  notesTotal?: number;
  onLoadMoreLeads?: () => void;
  onLoadMoreActivity?: () => void;
  onLoadMoreNotes?: () => void;
  state?: CustomerViewState;
  initialTab?: keyof typeof c.tabs;
  onBack: () => void;
  onAction: (action: CustomerRowAction) => void;
  onExport?: () => void;
  onLink: () => void;
  onUnlink: (record: LinkedCustomerRecord) => void;
  onOpenRecord: (id: string) => void;
  onAddNote: (body: string) => Promise<void>;
  onRetry?: () => void;
};
export function CustomerProfile({
  pending = false,
  customer,
  members,
  capabilities,
  leads,
  events,
  notes,
  leadsPage = 1,
  activityPage = 1,
  notesPage = 1,
  onLeadsPageChange,
  onActivityPageChange,
  onNotesPageChange,
  leadsTotal = leads.length,
  activityTotal = events.length,
  notesTotal = notes.length,
  onLoadMoreLeads,
  onLoadMoreActivity,
  onLoadMoreNotes,
  state = "ready",
  initialTab = "overview",
  onBack,
  onAction,
  onExport,
  onLink,
  onUnlink,
  onOpenRecord,
  onAddNote,
  onRetry,
}: CustomerProfileProps) {
  const [tab, setTab] = useState(initialTab);
  if (!capabilities.read || state !== "ready" || !customer)
    return (
      <section className={`${customerPanel} grid gap-5`}>
        {state === "loading" && capabilities.read ? (
          <p role="status">{c.loading}</p>
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
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            className={customerButton}
            onClick={onBack}
          >
            {c.back}
          </button>
          {state === "error" && capabilities.read && onRetry && (
            <button
              type="button"
              disabled={pending}
              className={customerButton}
              onClick={onRetry}
            >
              {c.retry}
            </button>
          )}
        </div>
      </section>
    );
  return (
    <div className="grid min-w-0 gap-6 text-ink">
      <div>
        <button
          type="button"
          disabled={pending}
          className={customerButton}
          onClick={onBack}
        >
          {c.back}
        </button>
      </div>
      <header
        className={`${customerPanel} flex flex-wrap items-start justify-between gap-5`}
      >
        <div className="flex min-w-0 items-start gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary-dark"
          >
            {customerInitials(customer.name)}
          </span>
          <div className="min-w-0">
            <p className="mb-2 mt-0 text-sm text-muted">{customer.number}</p>
            <h1 className="m-0 text-heading font-semibold wrap-anywhere">
              {customer.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge label={c.types[customer.type]} tone="info" />
              {customer.archived && <StatusBadge label={c.archived} />}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {capabilities.update && !customer.archived && (
            <button
              type="button"
              disabled={pending}
              className={customerButton}
              onClick={() => onAction("edit")}
            >
              {c.edit}
            </button>
          )}
          {capabilities.export && onExport && (
            <button
              type="button"
              disabled={pending}
              className={customerButton}
              onClick={onExport}
            >
              {c.export}
            </button>
          )}
          <CustomerRowMenu
            name={customer.name}
            archived={customer.archived}
            capabilities={capabilities}
            disabled={pending}
            onAction={onAction}
          />
        </div>
      </header>
      <nav aria-label={c.navigation} className="flex flex-wrap gap-2">
        {Object.entries(c.tabs).map(([key, label]) => (
          <button
            key={key}
            type="button"
            disabled={pending}
            aria-pressed={tab === key}
            onClick={() => setTab(key as keyof typeof c.tabs)}
            className={`${customerButton} ${tab === key ? "border-primary bg-primary/10 text-primary-dark" : ""}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "overview" && (
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-2">
          <CustomerContactCard customer={customer} members={members} />
          <section className={customerPanel}>
            <LinkedRecordList
              records={leads.slice(0, 3)}
              total={leadsTotal}
              onOpen={onOpenRecord}
              onViewAll={() => setTab("leads")}
            />
            {capabilities.link && !customer.archived && (
              <button
                type="button"
                disabled={pending}
                className={`${customerButton} mt-5`}
                onClick={onLink}
              >
                {c.link}
              </button>
            )}
          </section>
        </div>
      )}
      {tab === "leads" && (
        <section className={customerPanel}>
          <LinkedRecordList
            records={leads}
            total={leadsTotal}
            onViewAll={onLeadsPageChange ? undefined : onLoadMoreLeads}
            onOpen={onOpenRecord}
            onUnlink={
              capabilities.link && !customer.archived ? onUnlink : undefined
            }
          />
          {leadsTotal > 20 && onLeadsPageChange && (
            <div className="mt-5">
              <Pagination
                total={leadsTotal}
                page={leadsPage}
                pageSize={20}
                pageSizeOptions={[20]}
                onPageChange={onLeadsPageChange}
                onPageSizeChange={() => {}}
              />
            </div>
          )}
          {capabilities.link && !customer.archived && (
            <button
              type="button"
              disabled={pending}
              className={`${customerButton} mt-5`}
              onClick={onLink}
            >
              {c.link}
            </button>
          )}
        </section>
      )}
      {tab === "activity" && (
        <section className={customerPanel}>
          <CustomerTimeline
            events={events}
            total={activityTotal}
            onLoadMore={onActivityPageChange ? undefined : onLoadMoreActivity}
          />
          {activityTotal > 20 && onActivityPageChange && (
            <div className="mt-5">
              <Pagination
                total={activityTotal}
                page={activityPage}
                pageSize={20}
                pageSizeOptions={[20]}
                onPageChange={onActivityPageChange}
                onPageSizeChange={() => {}}
              />
            </div>
          )}
        </section>
      )}
      {tab === "notes" && (
        <div className="grid gap-4">
          <CustomerNotes
            notes={notes}
            total={notesTotal}
            onLoadMore={onNotesPageChange ? undefined : onLoadMoreNotes}
            canAdd={capabilities.note && !customer.archived}
            onAdd={onAddNote}
          />
          {notesTotal > 20 && onNotesPageChange && (
            <Pagination
              total={notesTotal}
              page={notesPage}
              pageSize={20}
              pageSizeOptions={[20]}
              onPageChange={onNotesPageChange}
              onPageSizeChange={() => {}}
            />
          )}
        </div>
      )}
    </div>
  );
}
