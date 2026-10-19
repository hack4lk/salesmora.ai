"use client";
import { useId } from "react";
import { homeOverviewData as copy } from "./home-overview.data";
export interface HomeOverviewProps {
  headingLevel?: 1 | 2;
  userName: string;
  workspaceName: string;
  role: keyof typeof copy.roles;
  /** Explicit entry context; joining a workspace does not imply it has no records. */
  entry: "created" | "joined";
  activity: { hasLeads: boolean; hasCampaigns: boolean; hasActivity: boolean };
  canCreateLead?: boolean;
  canCreateCampaign?: boolean;
  createLeadHref?: string;
  onCreateLead?: () => void;
  onCreateCampaign?: () => void;
}
/** Welcome content only. Record totals and data access are supplied by later features. */
export function HomeOverview({
  headingLevel = 2,
  userName,
  workspaceName,
  role,
  entry,
  activity,
  createLeadHref,
  canCreateLead = false,
  canCreateCampaign = false,
  onCreateLead,
  onCreateCampaign,
}: HomeOverviewProps) {
  const id = useId();
  const Greeting = headingLevel === 1 ? "h1" : "h2";
  const Introduction = headingLevel === 1 ? "h2" : "h3";
  const Callout = headingLevel === 1 ? "h3" : "h4";
  const welcome = !canCreateLead && !canCreateCampaign ? copy.assigned : copy[entry];
  const empty =
    !activity.hasLeads && !activity.hasCampaigns && !activity.hasActivity;
  const actions = [
    ...(canCreateLead ? [{ ...copy.leads, onCreate: onCreateLead, href: createLeadHref }] : []),
    ...(canCreateCampaign ? [{ ...copy.campaigns, onCreate: onCreateCampaign, href: undefined }] : []),
  ];
  return (
    <section aria-labelledby={`${id}-greeting`} className="grid min-w-0 gap-6">
      <header className="grid min-w-0 gap-4 sm:flex sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Greeting
            id={`${id}-greeting`}
            className="m-0 text-heading font-semibold text-ink sm:text-heading-lg wrap-anywhere"
          >
            {copy.greeting(userName)}
          </Greeting>
          <p className="mb-0 mt-3 text-sm leading-6 text-muted">
            {copy.workspace}
          </p>
          <p className="mb-0 mt-1 text-lg font-semibold leading-relaxed text-ink wrap-anywhere">
            {workspaceName}
          </p>
        </div>
        <span className="w-fit shrink-0 rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-primary">
          {copy.roles[role]}
        </span>
      </header>
      {!empty && canCreateLead && createLeadHref && <a href={createLeadHref} className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{copy.leads.action}</a>}
      {empty && (
        <div className="min-w-0 rounded-2xl border border-line bg-paper p-6 sm:p-8">
          <p className="m-0 text-xs font-bold tracking-widest text-success uppercase">
            {welcome.label}
          </p>
          <Introduction className="mb-0 mt-3 text-2xl font-semibold leading-normal text-ink">
            {welcome.title}
          </Introduction>
          <p className="mb-0 mt-3 max-w-2xl text-base leading-relaxed text-muted">
            {welcome.description}
          </p>
          <div
            className={`mt-6 grid gap-4 ${actions.length > 1 ? "sm:grid-cols-2" : ""}`}
          >
            {actions.map((item) => (
              <div
                key={item.title}
                className="min-w-0 rounded-xl border border-line bg-canvas p-4 sm:p-6"
              >
                <Callout className="m-0 text-base font-semibold leading-6 text-ink">
                  {item.title}
                </Callout>
                <p className="mb-0 mt-2 text-sm leading-6 text-muted">
                  {item.description}
                </p>
                {item.href ? <a href={item.href} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{item.action}</a> : <button
                  type="button"
                  disabled={!item.onCreate}
                  onClick={item.onCreate}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
                >
                  {item.action}
                  {!item.onCreate && (
                    <span className="text-xs font-normal">
                      {copy.unavailable}
                    </span>
                  )}
                </button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
