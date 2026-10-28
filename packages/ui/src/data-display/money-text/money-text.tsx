import { moneyTextData as copy } from './money-text.data';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Formatting only. Money is integer cents; anything else is unavailable and shows a placeholder, never $0.00. */
export function formatMoney(cents: number | null | undefined): string {
  return typeof cents === 'number' && Number.isSafeInteger(cents) ? usd.format(cents / 100) : copy.placeholder;
}

export type MoneyTextProps = { cents: number | null | undefined; className?: string };

export function MoneyText({ cents, className = '' }: MoneyTextProps) {
  return <span className={`tabular-nums ${className}`}>{formatMoney(cents)}</span>;
}
