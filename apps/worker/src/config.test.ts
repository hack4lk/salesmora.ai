import { describe, expect, it } from 'vitest';
import { productionConfiguration } from './config';
const env = { DATABASE_URL: 'postgresql://fictional:fictional@db.internal/salesmora', REDIS_URL: 'rediss://worker:fictional%21@redis.example.test:6380/2', WORKER_QUEUE_NAME: 'salesmora-staging-help' };
describe('production worker configuration', () => {
  it('uses explicit services, separate queue, Redis authentication and TLS', () => {
    expect(productionConfiguration(env)).toMatchObject({ databaseURL: env.DATABASE_URL, queueName: env.WORKER_QUEUE_NAME, tasks: 'all', connection: { host: 'redis.example.test', port: 6380, username: 'worker', password: 'fictional!', db: 2, tls: { servername: 'redis.example.test' } } });
  });
  it('supports private plaintext Redis and retention without embedding credentials', () => {
    expect(productionConfiguration({ ...env, REDIS_URL: 'redis://redis.internal:6379', WORKER_TASKS: 'retention' })).toMatchObject({ tasks: 'retention', connection: { host: 'redis.internal', db: 0 } });
  });
  it.each([
    { DATABASE_URL: '' }, { DATABASE_URL: 'https://db.example.test/db' }, { DATABASE_URL: 'postgres://db.internal/salesmora_test' },
    { REDIS_URL: '' }, { REDIS_URL: 'https://redis.internal' }, { REDIS_URL: 'redis://redis.internal/1?tls=false' },
    { REDIS_URL: 'redis://redis.internal/not-a-db' }, { WORKER_QUEUE_NAME: '' }, { WORKER_QUEUE_NAME: 'help-ingestion-test' },
    { WORKER_QUEUE_NAME: 'help-ingestion-development' }, { WORKER_QUEUE_NAME: 'queue:unsafe' }, { WORKER_TASKS: 'unknown' },
  ])('fails closed on invalid or implicit production settings %j', overrides => {
    expect(() => productionConfiguration({ ...env, ...overrides })).toThrow();
  });
  it('never accepts local test mode', () => expect(() => productionConfiguration(env, ['--test'])).toThrow('test mode'));
  it('does not reveal malformed secrets in configuration errors', () => {
    expect(() => productionConfiguration({ ...env, REDIS_URL: 'fictional-secret-not-a-url' })).toThrow('Invalid worker service configuration');
  });
});
