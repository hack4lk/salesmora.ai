export const customerDeleteDialogData = {
  title: "Delete customer permanently",
  confirm: "Delete customer",
  type: "Type the customer number",
  description: (name: string) =>
    `Permanently delete ${name}? This cannot be undone.`,
  impact:
    "The customer’s contact details and team notes will be removed. Leads are never deleted by this action.",
  blocked: (n: number) =>
    `Deletion is blocked by ${n} active jobs. Complete or reassign them first.`,
  unlink: (n: number) =>
    `I understand that ${n} open leads will be unlinked and retained.`,
};
