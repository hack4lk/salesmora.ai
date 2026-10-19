export const noteLimit = 1000;
export const copy = {
  title: 'Crew notes',
  help: 'Saved notes cannot be edited or deleted. Add a new note to correct an earlier one. Notes do not change the status or notify anyone.',
  label: 'Note for the crew and office',
  placeholder: 'What did you find on site?',
  count: (n: number, max: number) => `${n} of ${max} characters`,
  add: 'Add note',
  saving: 'Saving note…',
  error: 'We could not save this note. Your text is still here.',
  empty: 'No crew notes yet.',
  draft: 'Notes can be added once the work order is issued.',
  closed: 'Notes are closed because this work order is canceled or archived.',
  readOnly: 'You do not have permission to add crew notes.',
  by: (name: string, when: string) => `${name} · ${when}`,
} as const;
