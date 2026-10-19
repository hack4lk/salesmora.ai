import { describe, expect, it } from 'vitest';
import { loadCorpus } from '@salesmora/data/knowledge-ingestion';
import { publicationMode, publicationPlan } from './publication-plan';
import { stagingTarget } from './staging-target';

const env = { NODE_ENV: 'production', RAILWAY_PROJECT_ID: 'e0865ab2-d136-4e6c-a1bd-e96af3e52e74', RAILWAY_ENVIRONMENT_ID: '41e4f7c2-f517-49ed-9c8e-6b654b926982', RAILWAY_SERVICE_ID: '6a92c5f4-6cad-4a68-9059-f3dc1297c4b0', RAILWAY_ENVIRONMENT_NAME: 'staging', DATABASE_URL: 'postgresql://fictional:fictional@postgres.railway.internal:5432/salesmora_staging' };
describe('staging publication boundary', () => {
  it('accepts only the approved target and refuses production, local, test and other services', () => {
    expect(stagingTarget(env)).toBe(env.DATABASE_URL);
    for (const overrides of [
      { NODE_ENV: 'development' }, { RAILWAY_PROJECT_ID: 'other' }, { RAILWAY_ENVIRONMENT_ID: 'production' },
      { RAILWAY_SERVICE_ID: 'web' }, { RAILWAY_ENVIRONMENT_NAME: 'production' },
      { DATABASE_URL: 'postgres://localhost:55432/salesmora' },
      { DATABASE_URL: 'postgres://postgres.railway.internal/salesmora_test' },
      { DATABASE_URL: 'postgres://other.railway.internal/salesmora_staging' },
      { DATABASE_URL: 'fictional-secret-not-a-url' }, { CHAT_TEST_PROVIDER: 'true' }, { TEST_DATABASE_URL: 'fictional' },
    ]) expect(() => stagingTarget({ ...env, ...overrides })).toThrow();
    expect(() => stagingTarget({ ...env, DATABASE_URL: 'fictional-secret-not-a-url' })).toThrow('Publisher requires the private staging database.');
  });
  it('requires a new explicit digest after any corpus version changes', async () => {
    const corpus = await loadCorpus();
    const plan = publicationPlan(corpus);
    expect(publicationMode([], plan.digest)).toBe('preview');
    expect(publicationMode(['--publish', plan.digest], plan.digest)).toBe('publish');
    const changed = publicationPlan(corpus.map((article, index) => index ? article : { ...article, version: 'new-version' }));
    expect(() => publicationMode(['--publish', plan.digest], changed.digest)).toThrow();
    for (const args of [['--publish'], ['--test'], ['--publish', plan.digest, '--force']]) expect(() => publicationMode(args, plan.digest)).toThrow();
    expect(plan.tokenUpperBound).toBeLessThan(100_000);
  });
  it('refuses empty, duplicate and oversized corpora before publication', async () => {
    const corpus = await loadCorpus();
    expect(() => publicationPlan([])).toThrow();
    expect(() => publicationPlan([corpus[0], corpus[0]])).toThrow();
    expect(() => publicationPlan([{ ...corpus[0], sections: [{ anchor: 'large', heading: 'Large', text: 'x'.repeat(8001) }] }])).toThrow();
    const oversized = corpus.map(article => ({ ...article, sections: Array.from({ length: 8 }, (_, index) => ({ anchor: String(index), heading: 'Heading', text: 'x'.repeat(4000) })) }));
    expect(() => publicationPlan(oversized)).toThrow();
  });
});
