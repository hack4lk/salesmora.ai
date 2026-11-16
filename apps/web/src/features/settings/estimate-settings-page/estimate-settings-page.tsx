import { EstimateBusinessProfileForm, type EstimateBusinessProfileFormProps } from "../../estimates/estimate-business-profile-form/estimate-business-profile-form";
import { estimateSettingsPageData as c } from "./estimate-settings-page.data";

export type EstimateSettingsPageProps = {
  businessProfile: EstimateBusinessProfileFormProps;
};

export function EstimateSettingsPage({ businessProfile }: EstimateSettingsPageProps) {
  return <div className="grid min-w-0 gap-6 text-ink">
    <header>
      <h1 className="m-0 text-heading font-semibold sm:text-heading-lg">{c.title}</h1>
    </header>
    <EstimateBusinessProfileForm {...businessProfile} />
  </div>;
}
