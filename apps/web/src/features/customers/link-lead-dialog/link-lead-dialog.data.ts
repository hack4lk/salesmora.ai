export const linkLeadDialogData = {
  link: "Link lead",
  unlink: "Unlink lead",
  search: "Search leads",
  choose: "Choose one lead",
  empty: "No matching leads.",
  other: "another customer",
  description: (name: string) => `Choose an existing lead to link to ${name}.`,
  unlinkHint: (number: string, name: string) =>
    `Unlink ${number} from ${name}? The lead will be retained.`,
  current: (name: string) => `Currently linked to ${name}`,
  replace: (name: string) =>
    `I understand that this will replace the link to ${name}.`,
};
