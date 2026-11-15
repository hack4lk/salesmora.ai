export type LeadAttentionView = 'inactive' | 'unowned' | 'combined';
export type LeadAttentionCounts = Readonly<Record<LeadAttentionView, number>>;

export function validLeadAttentionCounts({ inactive, unowned, combined }: LeadAttentionCounts): boolean {
  return [inactive, unowned, combined].every(count => Number.isSafeInteger(count) && count >= 0) &&
    combined >= Math.max(inactive, unowned) && combined - inactive <= unowned;
}
