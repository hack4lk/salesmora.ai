import { DefaultLeadAssignment, type DefaultLeadAssignmentProps } from '../default-lead-assignment/default-lead-assignment';
import { leadSettingsPageData as copy } from './lead-settings-page.data';
export type LeadSettingsPageProps = { assignment: DefaultLeadAssignmentProps };
export function LeadSettingsPage({ assignment }: LeadSettingsPageProps) {
  return <div className="grid min-w-0 gap-6">
    <header><h1 className="m-0 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1></header>
    <DefaultLeadAssignment {...assignment} />
  </div>;
}
