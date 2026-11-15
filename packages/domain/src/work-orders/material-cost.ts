import { parseEstimateDecimal, roundEstimateHalfUp } from '../estimates/decimal';

/** Recorded unit costs, not actual spend; undefined indicates invalid or unsafe arithmetic. */
export function recordedMaterialLineCostCents(quantity: string, unitCostCents: number | null): number | null | undefined {
  const thousandths = parseEstimateDecimal(quantity, 3, 6);
  if (thousandths === null || thousandths <= 0n) return undefined;
  if (unitCostCents === null) return null;
  if (!Number.isSafeInteger(unitCostCents) || unitCostCents < 0 || unitCostCents > 2_147_483_647) return undefined;
  const lineCost = roundEstimateHalfUp(thousandths * BigInt(unitCostCents), 1000n);
  return lineCost <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(lineCost) : undefined;
}
