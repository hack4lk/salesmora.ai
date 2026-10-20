export const copy = {
  archive: { title: 'Archive material', confirm: 'Archive', description: (name: string) => `“${name}” leaves the catalog and can no longer be picked on new work orders.`, impact: 'Work orders that already use it keep their saved details. You can restore it later if its SKU is still free.' },
  restore: { title: 'Restore material', confirm: 'Restore', description: (name: string) => `“${name}” returns to the catalog.`, impact: 'Restoring is blocked if another active item now uses the same SKU.' },
};
