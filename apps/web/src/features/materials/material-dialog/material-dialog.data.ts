import type { MaterialUnit } from '@salesmora/contracts';

export const copy = {
  titles: { create: 'Add material', propose: 'Propose a material', edit: 'Edit material', approve: 'Review proposal' },
  descriptions: {
    create: 'Add an item to the catalog so it can be picked on work orders.',
    propose: 'An owner or admin reviews proposed items before they appear in the catalog.',
    edit: 'Changes apply to the catalog. Work orders that already use this item keep their own saved details.',
    approve: 'Adjust anything that needs fixing, then approve to add it to the catalog.',
  },
  confirm: { create: 'Add to catalog', propose: 'Submit proposal', edit: 'Save changes', approve: 'Approve and add' },
  line: {
    titles: { create: 'Add a new material', propose: 'Propose a new material' },
    descriptions: {
      create: 'This adds the item to the catalog and to this work order.',
      propose: 'This adds the item to this work order as a custom item and sends it to an owner or admin for the catalog.',
    },
    confirm: { create: 'Add to catalog and work order', propose: 'Add to work order and propose' },
    quantity: 'Quantity for this work order', quantityError: 'Enter a quantity above zero.', note: 'Note for this work order',
  },
  fields: { name: 'Name', sku: 'SKU or part number', unit: 'Unit', category: 'Category', supplier: 'Supplier', cost: 'Cost per unit ($)', price: 'Price per unit ($)', markup: 'Markup %', notes: 'Notes', imageUrl: 'Image link', sourceUrl: 'Supplier page link' },
  units: { each: 'Each', ft: 'Foot', lb: 'Pound', box: 'Box', gal: 'Gallon', hr: 'Hour', other: 'Other' } satisfies Record<MaterialUnit, string>,
  margin: (percent: number) => `Margin ${percent}%`,
  applyMarkup: 'Set price from cost',
  duplicateName: (name: string) => `The catalog already has an item named “${name}”. You can still save, but check it is not a duplicate.`,
  noPriceAccess: 'Pricing is hidden for your role. The catalog keeps cost and price blank.',
  loseOnClose: 'Your entries stay until you close this dialog.',
};
