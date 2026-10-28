import { settingsOverviewData as copy } from './settings-overview.data';

export interface SettingsOverviewProps {
  workspaceName: string;
  profile: { businessName: string; businessType: string; postalCode: string; serviceRange: string; services: readonly string[] } | null;
  permissionsHref?: string;
  aiUsageHref?: string;
  workOrdersHref?: string;
  estimatesHref?: string;
  jobNotificationsHref?: string;
  billingHref?: string;
  accountHref?: string;
}

export function SettingsOverview({ workspaceName, profile, jobNotificationsHref, workOrdersHref, estimatesHref, permissionsHref, aiUsageHref, billingHref, accountHref }: SettingsOverviewProps) {
  const details = profile ? [
    [copy.fields.businessName, profile.businessName],
    [copy.fields.businessType, copy.businessTypes.find(type => type.value === profile.businessType)?.label ?? profile.businessType],
    [copy.fields.postalCode, profile.postalCode || copy.notSet],
    [copy.fields.serviceRange, copy.ranges[profile.serviceRange] ?? (profile.serviceRange || copy.notSet)],
    [copy.fields.services, profile.services.map(service => copy.serviceCatalog.find(option => option.value === service)?.label ?? service).join(', ') || copy.notSet],
  ] : [];
  const cards = [
    { id: 'account', href: accountHref, title: copy.accountTitle, description: copy.accountDescription, link: copy.viewAccount },
    { id: 'billing', href: billingHref, title: copy.billingTitle, description: copy.billingDescription, link: copy.viewBilling },
    { id: 'ai-usage', href: aiUsageHref, title: copy.aiUsageTitle, description: copy.aiUsageDescription, link: copy.viewAIUsage, ownerOnly: true },
    { id: 'job-notifications', href: jobNotificationsHref, title: copy.jobNotificationsTitle, description: copy.jobNotificationsDescription, link: copy.viewJobNotifications },
    { id: 'estimates', href: estimatesHref, title: copy.estimatesTitle, description: copy.estimatesDescription, link: copy.viewEstimates },
    { id: 'work-orders', href: workOrdersHref, title: copy.workOrdersTitle, description: copy.workOrdersDescription, link: copy.viewWorkOrders },
    { id: 'permissions', href: permissionsHref, title: copy.permissionsTitle, description: copy.permissionsDescription, link: copy.managePermissions, ownerOnly: true },
  ].filter(card => card.href);
  return <div className="grid min-w-0 gap-6">
    <header><p className="m-0 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p><h1 className="mb-0 mt-3 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-2 text-sm font-semibold text-muted wrap-anywhere">{workspaceName}</p><p className="mb-0 mt-4 text-base leading-relaxed text-muted">{copy.description}</p></header>
    {profile && <section aria-labelledby="business-profile-title" className="min-w-0 rounded-2xl border border-line bg-paper p-6 sm:p-8">
      <h2 id="business-profile-title" className="m-0 text-xl font-semibold text-ink">{copy.businessTitle}</h2><p className="mb-6 mt-2 text-sm leading-6 text-muted">{copy.businessDescription}</p>
      <dl className="m-0 grid gap-6 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-muted">{label}</dt><dd className="mb-0 ml-0 mt-2 font-semibold text-ink wrap-anywhere">{value}</dd></div>)}</dl>
      <p className="mb-0 mt-6 border-t border-line pt-4 text-sm leading-6 text-muted">{copy.readOnly}</p>
    </section>}
    {cards.length > 0 && <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(card => <section key={card.id} aria-labelledby={`${card.id}-settings-title`} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-paper p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id={`${card.id}-settings-title`} className="m-0 text-lg font-semibold text-ink">{card.title}</h2>
          {card.ownerOnly && <span className="shrink-0 rounded-full bg-canvas px-3 py-2 text-xs font-semibold text-primary">{copy.ownerOnly}</span>}
        </div>
        <p className="m-0 mb-2 flex-1 text-sm leading-6 text-muted">{card.description}</p>
        <a href={card.href} className="inline-flex min-h-11 max-w-full items-center justify-center self-start rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-paper wrap-anywhere hover:bg-primary-dark focus-visible:focus-ring">{card.link}</a>
      </section>)}
    </div>}
  </div>;
}
