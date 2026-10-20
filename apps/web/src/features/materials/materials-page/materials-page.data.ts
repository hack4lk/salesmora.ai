export const copy = {
  caption: 'Materials catalog', columns: { name: 'Material', category: 'Category', supplier: 'Supplier', unit: 'Unit', cost: 'Cost', price: 'Price', margin: 'Margin', updated: 'Updated', proposedBy: 'Proposed by', reason: 'Reason', actions: 'Actions' },
  none: '—',
  empty: 'No materials yet. Add your first item to start building the catalog.',
  emptyPropose: 'The catalog is empty. Propose items and an owner or admin will review them.',
  emptyReadOnly: 'The catalog is empty.',
  noMatch: 'No materials match these filters.',
  emptyProposals: 'No proposals waiting for review.', emptyRejected: 'No rejected proposals.',
  error: 'Materials could not be loaded.',
  readOnly: 'You can browse the catalog. Ask an owner or admin to add or change items.',
  duplicateOf: (name: string) => `Matches “${name}”`,
  units: { each: 'each', ft: 'ft', lb: 'lb', box: 'box', gal: 'gal', hr: 'hr', other: 'other' } as Record<string, string>,
};
