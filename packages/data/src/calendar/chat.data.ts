export const calendarChatData = {
  choosePerson: 'Choose one exact full teammate name, me, or up to ten authorized people using all. The requested person was unavailable or ambiguous. Do not guess a match.',
  ownOnly: 'Only your own authorized schedule can be checked. Ask to check me instead.',
  types: { all: 'Jobs and Work Orders', job: 'Jobs', work_order: 'Work Orders' },
  people: { me: 'My assigned visits', all: 'All people', unassigned: 'Unassigned visits', member: 'Selected teammate' },
  statuses: { all: 'All active statuses', 'job:needs-scheduling': 'Job: Needs Scheduling', 'job:scheduled': 'Job: Scheduled', 'job:in-progress': 'Job: In Progress', 'job:waiting': 'Job: Waiting', 'work_order:draft': 'Work Order: Draft', 'work_order:issued': 'Work Order: Issued', 'work_order:in-progress': 'Work Order: In Progress' },
  customer: (query: string) => `Customer: ${query}`,
} as const;
