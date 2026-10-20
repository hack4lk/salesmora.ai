import { useId } from "react";
import type { CustomerRecord, CustomerMember } from "../customer-preview.types";
import { customerButton, customerDate, customerPanel } from "../customer-ui";
import { customerContactCardData as c } from "./customer-contact-card.data";
export function CustomerContactCard({
  customer,
  members,
}: {
  customer: CustomerRecord;
  members: readonly CustomerMember[];
}) {
  const id = useId();
  const fields = [
    [c.number, customer.number],
    [c.email, customer.email],
    [c.phone, customer.phone],
    [c.company, customer.type === "business" ? customer.companyName : ""],
    [c.location, customer.location],
    [
      c.owner,
      members.find((m) => m.id === customer.ownerId)?.name ?? c.unassigned,
    ],
    [c.since, customerDate(customer.createdAt)],
    [c.notes, customer.internalNotes],
  ];
  return (
    <section aria-labelledby={id} className={customerPanel}>
      <h2 id={id} className="m-0 mb-5 text-lg font-semibold">
        {c.title}
      </h2>
      <dl className="m-0 grid min-w-0 gap-5 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="m-0 mt-1 whitespace-pre-wrap text-base wrap-anywhere">
              {value || c.missing}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
/** Intentionally separate minimal DTO. Related-only rendering cannot receive private fields. */
export function RelatedCustomerContact({
  customer,
  onOpenProfile,
}: {
  onOpenProfile?: () => void;
  customer: {
    differs?: boolean;
    name: string;
    number: string;
    email: string;
    phone: string;
  };
}) {
  return (
    <section aria-label={c.related} className={customerPanel}>
      <h2 className="m-0 text-lg font-semibold wrap-anywhere">
        {customer.name}
      </h2>
      <p className="text-sm text-muted">{customer.number}</p>
      <dl className="m-0 grid gap-4">
        {[
          [c.email, customer.email],
          [c.phone, customer.phone],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="m-0 wrap-anywhere">{value || c.missing}</dd>
          </div>
        ))}
      </dl>
      <p className="mb-0 text-sm text-muted">{c.relatedHint}</p>
      {customer.differs && (
        <p className="mb-0 text-sm text-muted">{c.differs}</p>
      )}
      {onOpenProfile && (
        <button
          type="button"
          className={customerButton}
          onClick={onOpenProfile}
        >
          {c.open}
        </button>
      )}
    </section>
  );
}
