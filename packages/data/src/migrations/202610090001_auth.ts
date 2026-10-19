import type { Knex } from 'knex';

export async function up(db: Knex) {
  await db.schema.createTable('users', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('email').notNullable().unique();
    table.boolean('emailVerified').notNullable().defaultTo(false);
    table.text('image');
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
    table.text('termsVersion').notNullable();
    table.timestamp('termsAcceptedAt', { useTz: true }).notNullable();
    table.text('onboardingStatus').notNullable().defaultTo('pending');
    table.check("\"onboardingStatus\" IN ('pending', 'complete')");
  });
  await db.raw('CREATE UNIQUE INDEX users_email_case_insensitive ON users (lower(email))');
  await db.schema.createTable('sessions', (table) => {
    table.text('id').primary();
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE').index();
    table.text('token').notNullable().unique();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
    table.text('ipAddress');
    table.text('userAgent');
  });
  await db.schema.createTable('accounts', (table) => {
    table.text('id').primary();
    table.text('userId').notNullable().references('id').inTable('users').onDelete('CASCADE').index();
    table.text('accountId').notNullable();
    table.text('providerId').notNullable();
    table.unique(['providerId', 'accountId']);
    for (const field of ['accessToken', 'refreshToken', 'idToken', 'scope', 'password']) table.text(field);
    table.timestamp('accessTokenExpiresAt', { useTz: true });
    table.timestamp('refreshTokenExpiresAt', { useTz: true });
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
  });
  await db.schema.createTable('verifications', (table) => {
    table.text('id').primary();
    table.text('identifier').notNullable().index();
    table.text('value').notNullable();
    table.timestamp('expiresAt', { useTz: true }).notNullable();
    table.timestamp('createdAt', { useTz: true }).notNullable();
    table.timestamp('updatedAt', { useTz: true }).notNullable();
  });
  await db.schema.createTable('rateLimits', (table) => {
    table.text('id').primary();
    table.text('key').notNullable().unique();
    table.integer('count').notNullable();
    table.bigInteger('lastRequest').notNullable();
  });
}

export async function down(db: Knex) {
  for (const table of ['rateLimits', 'verifications', 'accounts', 'sessions', 'users']) await db.schema.dropTable(table);
}
