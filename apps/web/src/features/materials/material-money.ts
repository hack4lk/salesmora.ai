const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const formatMoney = (cents: number | null) => (cents === null ? '—' : usd.format(cents / 100));
