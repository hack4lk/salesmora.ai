import type { MaterialStatus, MaterialView } from '@salesmora/contracts';

export type MaterialsPageFilters = { q: string; category: string; supplier: string; archived: boolean; status: MaterialStatus };
export type MaterialsPageSort = { column: 'name' | 'category' | 'price' | 'updatedAt'; direction: 'asc' | 'desc' };
export const defaultMaterialsFilters: MaterialsPageFilters = { q: '', category: 'all', supplier: 'all', archived: false, status: 'active' };
export const defaultMaterialsSort: MaterialsPageSort = { column: 'name', direction: 'asc' };
export type MaterialsRowHandlers = {
  onEdit: (row: MaterialView) => void; onArchive: (row: MaterialView) => void; onRestore: (row: MaterialView) => void;
  onApprove: (row: MaterialView) => void; onReject: (row: MaterialView) => void; onWithdraw: (row: MaterialView) => void;
};
