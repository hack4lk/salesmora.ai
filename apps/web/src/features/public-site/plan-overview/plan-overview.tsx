import { useId } from "react";
import { workspacePlanIds, type WorkspacePlanId } from "@salesmora/contracts";
import { getWorkspacePlan } from "@salesmora/domain";
import actions from "../site-actions.module.css";
import { planOverviewData as copy } from "./plan-overview.data";
import styles from "./plan-overview.module.css";

const icons = {
  free: (
    <path d="M5 19c0-7 4-12 14-14 1 9-3 15-10 15-2 0-4-1-4-1Zm0 0c3-4 6-7 10-9" />
  ),
  standard: <path d="M3 11 12 4l9 7M5 10v10h14V10M9 20v-6h6v6" />,
  premium: (
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
  ),
};

export interface PlanOverviewProps {
  createAccountHref: string;
}

function planHref(href: string, id: WorkspacePlanId) {
  const hashIndex = href.indexOf("#");
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
  const pathAndQuery = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const queryIndex = pathAndQuery.indexOf("?");
  const path =
    queryIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);
  const query = new URLSearchParams(
    queryIndex === -1 ? "" : pathAndQuery.slice(queryIndex + 1),
  );
  query.set("plan", id);
  return `${path}?${query}${hash}`;
}

type PlanCardProps = { id: WorkspacePlanId } & (
  | { variant: "overview"; createAccountHref: string }
  | {
      variant: "selectable";
      selected: boolean;
      radioName: string;
      onSelect: () => void;
    }
);

export function PlanCard(props: PlanCardProps) {
  const cardId = useId();
  const priceId = `${cardId}-price`;
  const benefitsId = `${cardId}-benefits`;
  const { id } = props;
  const { limits, monthlyPriceCents } = getWorkspacePlan(id);
  const highlighted =
    props.variant === "overview" ? id === "standard" : props.selected;
  const className = `${styles.card} ${highlighted ? styles.featured : ""} ${id === "standard" ? styles.standard : ""} ${id === "premium" ? styles.premium : ""} ${props.variant === "selectable" ? styles.selectable : ""}`;
  const content = (
    <>
      <div className={styles.planHeading}>
        <span className={styles.icon}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {icons[id]}
          </svg>
        </span>
        <div>
          {props.variant === "overview" ? (
            <h3>{copy.names[id]}</h3>
          ) : (
            <h2>{copy.names[id]}</h2>
          )}
          <p>{copy.audiences[id]}</p>
        </div>
        {props.variant === "selectable" && (
          <input
            type="radio"
            name={props.radioName}
            aria-label={copy.names[id]}
            aria-describedby={`${priceId} ${benefitsId}`}
            checked={props.selected}
            onChange={props.onSelect}
          />
        )}
      </div>
      <p id={priceId} className={styles.price}>
        <strong>{copy.price(monthlyPriceCents)}</strong>{" "}
        <span>{copy.monthly}</span>
      </p>
      <ul className={styles.features} id={benefitsId}>
        <li>{copy.users(limits.teammates)}</li>
        <li>{copy.leads(limits.newLeadsPerMonth)}</li>
        <li>{copy.tokens(limits.aiTokensPerMonth)}</li>
        <li>
          {copy.workflows(copy.workflowLimits[id])}{" "}
          <small>{copy.limitPlanned}</small>
        </li>
        <li>
          {copy.capture(limits.publishedCaptureSources)}{" "}
          <small>{copy.planned}</small>
        </li>
        <li>
          {copy.storage(limits.storageBytes)} <small>{copy.planned}</small>
        </li>
      </ul>
      {props.variant === "overview" && (
        <a
          href={props.createAccountHref}
          className={`${actions.button} ${id === "standard" ? actions.primary : actions.secondary} ${styles.action}`}
        >
          {copy.action}
        </a>
      )}
    </>
  );

  return props.variant === "overview" ? (
    <article className={className}>{content}</article>
  ) : (
    <label className={className}>{content}</label>
  );
}

export function PlanOverview({ createAccountHref }: PlanOverviewProps) {
  return (
    <section
      id="plans"
      aria-labelledby="plans-heading"
      className={styles.section}
    >
      <div className={styles.wrap}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="plans-heading">{copy.title}</h2>
          <p className={styles.description}>{copy.description}</p>
        </div>
        <div className={styles.grid}>
          {workspacePlanIds.map((id) => (
            <PlanCard
              key={id}
              id={id}
              variant="overview"
              createAccountHref={planHref(createAccountHref, id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
