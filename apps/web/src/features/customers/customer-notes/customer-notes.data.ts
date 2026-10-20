export const customerNotesData = {
  more: "Load older team notes",
  title: "Notes for the team",
  hint: "Team notes are append-only and separate from the internal contact notes.",
  label: "Team note",
  add: "Add note",
  saving: "Saving…",
  saved: "Note added.",
  empty: "No team notes yet.",
  error: "The note could not be saved. Your draft is preserved.",
  validation: "Enter a note between 1 and 4,000 characters.",
  count: (n: number) => `${n.toLocaleString("en-US")} / 4,000 characters`,
};
