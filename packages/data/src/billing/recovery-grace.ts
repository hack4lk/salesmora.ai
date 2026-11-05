const DAY_MS = 24 * 60 * 60 * 1000;

function validDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw Error('Invalid recovery invoice date.');
  return date;
}

export function initialRecoveryGraceUntil(invoiceCreatedAt: Date | string) {
  return new Date(validDate(invoiceCreatedAt).getTime() + 7 * DAY_MS);
}

export function maximumRecoveryGraceUntil(invoiceCreatedAt: Date | string) {
  return new Date(validDate(invoiceCreatedAt).getTime() + 14 * DAY_MS);
}

export function nextRecoveryGraceUntil(
  invoiceCreatedAt: Date | string,
  currentExtensionUntil: Date | string | null,
  additionalDays: number,
) {
  if (!Number.isSafeInteger(additionalDays) || additionalDays < 1 || additionalDays > 7) {
    throw Error('Grace extension must be between one and seven days.');
  }
  const base = initialRecoveryGraceUntil(invoiceCreatedAt);
  const current = currentExtensionUntil === null
    ? base
    : new Date(Math.max(base.getTime(), validDate(currentExtensionUntil).getTime()));
  const next = new Date(current.getTime() + additionalDays * DAY_MS);
  if (next > maximumRecoveryGraceUntil(invoiceCreatedAt)) {
    throw Error('Grace extension exceeds the 14-day recovery limit.');
  }
  return next;
}
