export const staffReasonMaxLength = 500;

/** Internal note required on every staff change to a customer's account (U8). Never shown to customers. */
export function normalizeStaffReason(reason: unknown): string {
  const value = typeof reason === 'string' ? reason.trim() : '';
  if (!value) throw new RangeError('A reason is required.');
  if (value.length > staffReasonMaxLength) throw new RangeError(`The reason must be ${staffReasonMaxLength} characters or fewer.`);
  return value;
}
