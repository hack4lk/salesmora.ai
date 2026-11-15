import type { LeadSource } from '../lead-source-report/lead-source-report.validation';
export const workspaceLeadFixtures: { id: string; label: string; stage: string; owner: string; source: LeadSource; created: string;
  age: number; activity: string; inactive: boolean; job: string | null }[] = [
  { id: 'l0', label: 'Older inquiry', stage: 'new', owner: 'member-a', source: 'other', created: '2026-09-20', age: 46, activity: 'Nov 5, 2026 at 10:00', inactive: false, job: null },
  { id: 'l1', label: 'Website inquiry', stage: 'contacted', owner: 'member-a', source: 'website', created: '2026-10-01', age: 35, activity: 'Oct 29, 2026 at 10:00', inactive: false, job: 'Job A / created Nov 2 / canceled Nov 3' },
  { id: 'l2', label: 'Referral inquiry', stage: 'won', owner: 'member-b', source: 'referral', created: '2026-10-15', age: 21, activity: 'Oct 30, 2026', inactive: false, job: null },
  { id: 'l3', label: 'Archived phone inquiry', stage: 'lost', owner: 'member-b', source: 'phone', created: '2026-10-20', age: 16, activity: 'Oct 31, 2026', inactive: false, job: 'Job B / created Oct 25' },
  { id: 'l4', label: 'Estimate inquiry', stage: 'estimate-sent', owner: 'unassigned', source: 'gmail', created: '2026-10-31', age: 5, activity: 'Oct 28, 2026 at 09:59', inactive: true, job: null },
];
