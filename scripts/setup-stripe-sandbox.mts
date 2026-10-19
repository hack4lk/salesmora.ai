/** Explicit sandbox-only catalog provisioning; never creates customers, subscriptions or charges. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getWorkspacePlan, workspacePlanCatalogVersion } from '../packages/domain/src/billing/plans';

const envFile = fileURLToPath(new URL('../.env.local', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);
const apply = process.argv.includes('--apply');
const plans = ['standard', 'premium'] as const;
if (!apply) {
  console.log(JSON.stringify({ mode: 'preview', catalog: workspacePlanCatalogVersion, plans: plans.map(id => ({ plan: id, monthlyUSD: getWorkspacePlan(id).monthlyPriceCents / 100 })) }));
} else {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^(sk|rk)_test_/.test(key)) throw new Error('A Stripe sandbox secret key is required; live keys are rejected.');
  async function request(path: string, body?: URLSearchParams, idempotency?: string) {
    const response = await fetch(`https://api.stripe.com/v1/${path}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${key}`, ...(body ? {'Content-Type':'application/x-www-form-urlencoded'} : {}), ...(idempotency ? {'Idempotency-Key':idempotency} : {}) }, body, signal: AbortSignal.timeout(20_000) });
    // Never print raw provider payloads or request headers.
    const result = await response.json();
    if (!response.ok) { if (response.status === 404) return null; throw new Error(`Stripe request failed (${response.status}). Check sandbox access and retry.`); }
    return result;
  }
  const balance = await request('balance');
  if (!balance || balance.livemode !== false) throw new Error('Sandbox verification failed.');
  const saved: Record<string,string> = {};
  for (const id of plans) {
    const definition = getWorkspacePlan(id);
    const productId = `salesmora_${id}_sandbox`;
    let product = await request(`products/${productId}`);
    if (!product) product = await request('products', new URLSearchParams({ id: productId, name: `SalesMora ${id === 'standard' ? 'Standard' : 'Premium'}`, 'metadata[app]': 'salesmora', 'metadata[plan]': id }), `salesmora-product-${id}-sandbox-v1`);
    if (!product || product.livemode !== false || product.active !== true || product.metadata?.app !== 'salesmora' || product.metadata?.plan !== id) throw new Error('Existing sandbox product does not match the expected catalog.');
    const lookup = `salesmora_${id}_monthly_${workspacePlanCatalogVersion}`;
    const query = new URLSearchParams({ 'lookup_keys[]': lookup, limit: '2' });
    const prices = await request(`prices?${query}`);
    if (!prices || !Array.isArray(prices.data) || prices.data.length > 1) throw new Error('Sandbox price lookup failed.');
    let price = prices.data[0];
    if (!price) price = await request('prices', new URLSearchParams({ product: productId, currency: 'usd', unit_amount: String(definition.monthlyPriceCents), 'recurring[interval]': 'month', lookup_key: lookup, 'metadata[app]':'salesmora', 'metadata[plan]':id, 'metadata[catalog]':workspacePlanCatalogVersion }), `salesmora-price-${lookup}`);
    if (!price || price.livemode !== false || price.active !== true || price.product !== productId || price.currency !== 'usd' || price.unit_amount !== definition.monthlyPriceCents || price.recurring?.interval !== 'month' || price.recurring?.interval_count !== 1 || price.recurring?.usage_type !== 'licensed' || price.metadata?.catalog !== workspacePlanCatalogVersion || price.metadata?.plan !== id || price.metadata?.app !== 'salesmora') throw new Error('Sandbox price does not match the approved draft catalog.');
    const envName = `STRIPE_${id.toUpperCase()}_MONTHLY_PRICE_ID`;
    if (process.env[envName] && process.env[envName] !== price.id) throw new Error('Configured sandbox price differs; review before replacing it.');
    saved[envName] = price.id;
    console.log(JSON.stringify({ plan:id, productId:product.id, priceId:price.id, monthlyUSD:price.unit_amount / 100, livemode:false }));
  }
  let contents = existsSync(envFile) ? readFileSync(envFile,'utf8') : '';
  for (const [name,value] of Object.entries(saved)) {
    const pattern = new RegExp(`^${name}=.*$`, 'm');
    contents = pattern.test(contents) ? contents.replace(pattern,`${name}=${value}`) : `${contents.trimEnd()}\n${name}=${value}\n`;
  }
  writeFileSync(envFile,contents,{mode:0o600});
  console.log('Sandbox price IDs saved to ignored .env.local. No subscriptions or charges created.');
}
