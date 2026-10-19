import type { Knex } from 'knex';
export async function up(db: Knex) {
    await db.schema.createTable('billingPlanChanges', t => {
        t.uuid('id').primary();
        t.uuid('workspaceId').notNullable().references('workspaceId').inTable('workspaceSubscriptions').onDelete('RESTRICT');
        t.text('actorId').notNullable();
        t.text('targetPlan').notNullable();
        t.text('kind').notNullable();
        t.text('state').notNullable().defaultTo('quoted');
        t.jsonb('basis').notNullable();
        t.integer('amountDue').notNullable();
        t.integer('prorationAt').notNullable();
        t.text('scheduleId');
        t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(db.fn.now());
        t.index(['workspaceId', 'createdAt']);
        t.check("\"targetPlan\" IN ('free','standard','premium')");
    });
}
export async function down() { throw Error('Plan-change evidence is forward-only.'); }
