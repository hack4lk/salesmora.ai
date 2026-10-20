export const copy = {
  units: { each: 'each', ft: 'ft', lb: 'lb', box: 'box', gal: 'gal', hr: 'hr', other: 'other' } as Record<string, string>,
  cost: 'Cost', price: 'Price', none: '—', duplicateOf: (name: string) => `Matches “${name}”`,
};
