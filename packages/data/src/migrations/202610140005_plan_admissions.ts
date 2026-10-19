import type {Knex} from 'knex';
export async function up(db:Knex){
  await db.schema.createTable('workspaceLeadAdmissions',t=>{
    // No lead FK: deleting a lead must not replenish the creation allowance.
    t.uuid('leadId').primary();t.uuid('workspaceId').notNullable().references('id').inTable('workspaces').onDelete('CASCADE');
    t.timestamp('createdAt',{useTz:true}).notNullable().defaultTo(db.fn.now());t.index(['workspaceId','createdAt']);
  });
  await db.raw('INSERT INTO "workspaceLeadAdmissions" ("leadId","workspaceId","createdAt") SELECT id,"workspaceId","createdAt" FROM leads');
}
export async function down(){throw Error('Lead admission accounting is forward-only');}
