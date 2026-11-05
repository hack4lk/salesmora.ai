import { DefaultLeadAssignment, type DefaultLeadAssignmentProps } from '../default-lead-assignment/default-lead-assignment';
import { leadSettingsPageData as copy } from './lead-settings-page.data';
export type LeadSettingsPageProps = { settingsHref: string; assignment: DefaultLeadAssignmentProps };
export function LeadSettingsPage({ settingsHref, assignment }: LeadSettingsPageProps) {
  return <div className="grid min-w-0 gap-6">
    <header><a href={settingsHref} className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary focus-visible:focus-ring">{copy.back}</a>
      <p className="mb-0 mt-4 text-xs font-bold tracking-widest text-muted uppercase">{copy.eyebrow}</p><h1 className="mb-0 mt-3 text-heading font-semibold text-ink sm:text-heading-lg">{copy.title}</h1><p className="mb-0 mt-4 text-base leading-6 text-muted">{copy.description}</p></header>
    <DefaultLeadAssignment {...assignment} />
  </div>;
}
