export function validReportBreakdown(total: number, groups: readonly { id: string; count: number }[]): boolean {
  if (!Number.isSafeInteger(total) || total < 0) return false;
  const ids = new Set<string>();
  let sum = 0;
  for (const group of groups) {
    if (!group.id.trim() || ids.has(group.id) || !Number.isSafeInteger(group.count) || group.count < 0) return false;
    ids.add(group.id);
    sum += group.count;
    if (!Number.isSafeInteger(sum) || sum > total) return false;
  }
  return sum === total;
}
