export const customerArchiveDialogData = {
  archive: "Archive customer",
  restore: "Restore customer",
  hint: (name: string) =>
    `Archive ${name}? They will be hidden from the default customer list.`,
  restoreHint: (name: string) => `Restore ${name} to the active customer list?`,
  leads: (n: number) => `${n} open linked leads will remain unchanged.`,
  jobs: (n: number) => `${n} active linked jobs will remain unchanged.`,
  safe: "Contact details and linked records are retained. Archiving is reversible.",
};
