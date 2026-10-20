export {jobButton as woButton,jobPrimary as woPrimary,jobPanel as woPanel,jobInput as woInput,jobLabel as woLabel,jobDate as woDate,jobInitials as woInitials} from '../jobs/job-ui';

/** Format timestamp in user's local timezone. */
export const woStamp = (iso: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(iso));
