export const copy = {
  title: 'Delete draft work order',
  confirm: 'Delete work order',
  type: 'Type the work order number',
  description: (number: string, title: string) => `Permanently delete ${number} · ${title}? This cannot be undone.`,
  impact: 'Only drafts can be deleted. Its tasks, materials and notes are removed; a minimal deletion record is kept for audit. Issued work orders are canceled or archived instead.',
};
