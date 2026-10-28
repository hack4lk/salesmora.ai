import { EstimateBusinessProfileForm, type EstimateBusinessProfileFormProps } from "../../estimates/estimate-business-profile-form/estimate-business-profile-form";
import { estimateSettingsPageData as c } from "./estimate-settings-page.data";

export type EstimateSettingsPageProps = {
  workspaceName: string;
  settingsHref?: string;
  businessProfile: EstimateBusinessProfileFormProps;
};

export function EstimateSettingsPage({ workspaceName, settingsHref, businessProfile }: EstimateSettingsPageProps) {
  return <div className="grid min-w-0 gap-6 text-ink">
    <header>
      {settingsHref ? <a href={settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{c.back}</a>
        : <p className="m-0 text-sm text-muted">{c.navigationUnavailable}</p>}
      <p className="mb-0 mt-4 text-xs font-bold uppercase tracking-widest text-muted">{c.eyebrow}</p>
      <h1 className="mb-0 mt-3 text-heading font-semibold sm:text-heading-lg">{c.title}</h1>
      {businessProfile.canRead && <p className="mb-0 mt-2 text-sm font-semibold text-muted wrap-anywhere">{workspaceName}</p>}
      <p className="mb-0 mt-4 text-base leading-relaxed text-muted">{c.description}</p>
    </header>
    <EstimateBusinessProfileForm {...businessProfile} />
  </div>;
}
