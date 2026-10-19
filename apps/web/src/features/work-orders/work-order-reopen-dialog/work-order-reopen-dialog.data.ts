export const reasonLimit = 500;
export const copy = {
  title: (number: string) => `Reopen ${number}`,
  description: 'Reopening removes the completion record. A completed order returns to in progress and a canceled one returns to draft.',
  reason: 'Reason for reopening',
  count: (n: number, max: number) => `${n} of ${max} characters`,
  confirm: 'Reopen work order',
} as const;
