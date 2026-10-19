import { settingsOverviewData as copy } from './settings-overview.data';

export interface SettingsOverviewProps {
  workspaceName: string;
  profile: { businessName: string; businessType: string; postalCode: string; serviceRange: string; services: readonly string[] } | null;
  permissionsHref?: string;
  aiUsageHref?: string;
  workOrdersHref?: string;
  billingHref?: string;
  accountHref?: string;
}

export function SettingsOverview({ workspaceName, profile, workOrdersHref, permissionsHref, aiUsageHref, billingHref, accountHref }: SettingsOverviewProps) {
  const details = profile ? [
    [copy.fields.businessName, profile.businessName],
    [copy.fields.businessType, copy.businessTypes.find(type => type.value === profile.businessType)?.label ?? profile.businessType],
    [copy.fields.postalCode, profile.postalCode || copy.notSet],
    [copy.fields.serviceRange, copy.ranges[profile.serviceRange] ?? (profile.serviceRange || copy.notSet)],
    [copy.fields.services, profile.services.map(service => copy.serviceCatalog.find(option => option.value === service)?.label ?? service).join(', ') || copy.notSet],
  ] : [];
  return <div className="grid min-w-0 gap-6">
    <header><p className="m-0 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p><h1 className="mb-0 mt-3 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-2 text-sm font-semibold text-muted wrap-anywhere">{workspaceName}</p><p className="mb-0 mt-4 text-base leading-relaxed text-muted">{copy.description}</p></header>
    {profile && <section aria-labelledby="business-profile-title" className="min-w-0 rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <h2 id="business-profile-title" className="m-0 text-xl font-semibold text-ink">{copy.businessTitle}</h2><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.businessDescription}</p>
      <dl className="m-0 grid gap-6 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-muted">{label}</dt><dd className="mb-0 ml-0 mt-2 font-semibold text-ink wrap-anywhere">{value}</dd></div>)}</dl>
      <p className="mb-0 mt-6 border-t border-line pt-4 text-sm leading-6 text-muted">{copy.readOnly}</p>
    </section>}
    {accountHref && <section aria-labelledby="account-settings-title" className="rounded-2xl border border-line bg-paper p-6 sm:p-8"><h2 id="account-settings-title" className="m-0 text-xl font-semibold text-ink">{copy.accountTitle}</h2><p className="mb-6 mt-3 text-sm leading-6 text-muted">{copy.accountDescription}</p><a href={accountHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{copy.viewAccount}</a></section>}
    {billingHref && <section aria-labelledby="billing-settings-title" className="rounded-2xl border border-line bg-paper p-6 sm:p-8"><h2 id="billing-settings-title" className="m-0 text-xl font-semibold text-ink">{copy.billingTitle}</h2><p className="mb-6 mt-3 text-sm leading-6 text-muted">{copy.billingDescription}</p><a href={billingHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{copy.viewBilling}</a></section>}
    {aiUsageHref && <section aria-labelledby="ai-usage-settings-title" className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="ai-usage-settings-title" className="m-0 text-xl font-semibold text-ink">{copy.aiUsageTitle}</h2><span className="rounded-full bg-canvas px-3 py-2 text-xs font-semibold text-primary">{copy.ownerOnly}</span></div>
      <p className="mb-6 mt-3 text-sm leading-6 text-muted">{copy.aiUsageDescription}</p><a href={aiUsageHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{copy.viewAIUsage}</a>
    </section>}
    {workOrdersHref && <section aria-labelledby="work-orders-settings-title" className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <h2 id="work-orders-settings-title" className="m-0 text-xl font-semibold text-ink">{copy.workOrdersTitle}</h2>
      <p className="mb-6 mt-3 text-sm leading-6 text-muted">{copy.workOrdersDescription}</p><a href={workOrdersHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{copy.viewWorkOrders}</a>
    </section>}
    {permissionsHref && <section aria-labelledby="permissions-settings-title" className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="permissions-settings-title" className="m-0 text-xl font-semibold text-ink">{copy.permissionsTitle}</h2><span className="rounded-full bg-canvas px-3 py-2 text-xs font-semibold text-primary">{copy.ownerOnly}</span></div>
      <p className="mb-6 mt-3 text-sm leading-6 text-muted">{copy.permissionsDescription}</p><a href={permissionsHref} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-paper hover:bg-primary-dark focus-visible:focus-ring">{copy.managePermissions}</a>
    </section>}
  </div>;
}
