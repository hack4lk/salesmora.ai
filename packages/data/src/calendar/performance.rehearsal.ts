/** Local 10k-Job read benchmark. Fixture-only writes; never run against app/staging data. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { permissionIds } from '@salesmora/contracts';
import { addCalendarDays } from '@salesmora/domain';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy } from '../authorization/store';
import { readCalendar } from './read';
process.loadEnvFile(fileURLToPath(new URL('../../../../.env.local',import.meta.url)));
const connection = process.env.TEST_DATABASE_URL;
if (!connection || connection === process.env.DATABASE_URL || !new URL(connection).pathname.endsWith('_test') || !['localhost','127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Isolated local test database required.');
const db = createDatabase(connection),workspaceId = randomUUID(),owner = randomUUID(),field = randomUUID(),customerId = randomUUID();
const tables = ['jobs','calendarVisits','calendarVisitRecords'];
const expectedUnscheduled = {owner:0,field:0};
const measurements:Record<string,{samples:number;p50Ms:number;p95Ms:number;maxMs:number}> = {};
const explain:unknown[] = [];
const analyze = async () => { for (const table of tables) await db.raw('ANALYZE ??',[table]); };
try {
  await db.transaction(async trx => {
    const now = new Date();
    await trx('users').insert([owner,field].map((id,i) => ({id,name:i ? 'Calendar benchmark Field' : 'Calendar benchmark Owner',email:`${id}@example.test`,createdAt:now,updatedAt:now,termsVersion:'fixture',termsAcceptedAt:now})));
    await trx('workspaces').insert({id:workspaceId,ownerId:owner,businessName:'Calendar performance fixture',businessType:'plumbing',postalCode:'',serviceRange:'',timezone:'America/New_York'});
    await trx('workspaceMemberships').insert([{workspaceId,userId:owner,role:'owner'},{workspaceId,userId:field,role:'field'}]);
    await initializeWorkspacePolicy(trx,{workspaceId,userId:owner});
    await trx('customers').insert({id:customerId,workspaceId,name:'Benchmark customer',type:'person',companyName:'',email:'',phone:'',location:'',internalNotes:''});
    for (let offset=0;offset<10000;offset+=500) {
      const rows = Array.from({length:500},(_,n) => {
        const i=offset+n,id=randomUUID(),visitId=randomUUID(),scheduledDate=i<250 ? null : addCalendarDays('2026-11-02',(i%52)*7+i%7);
        return {id,visitId,scheduledDate,jobNumber:i+1,primaryOwnerId:(Math.floor(i/52)+i)%2 ? field : owner};
      });
      for (const row of rows) if (!row.scheduledDate) expectedUnscheduled[row.primaryOwnerId===field ? 'field' : 'owner']++;
      await trx('jobs').insert(rows.map(r => ({id:r.id,scheduledDate:r.scheduledDate,jobNumber:r.jobNumber,primaryOwnerId:r.primaryOwnerId,workspaceId,customerId,customerName:'Benchmark customer',title:'Benchmark visit',service:'repairs',location:'',description:'',status:r.scheduledDate ? 'scheduled' : 'needs-scheduling',createdBy:owner,arrivalWindow:r.scheduledDate ? '09:00-11:00' : null})));
      await trx('calendarVisits').insert(rows.map(r => ({id:r.visitId,workspaceId,scheduledDate:r.scheduledDate,arrivalWindow:r.scheduledDate ? '09:00-11:00' : null})));
      await trx('calendarVisitRecords').insert(rows.map(r => ({id:randomUUID(),workspaceId,visitId:r.visitId,jobId:r.id})));
    }
  });
  await analyze();
  for (const [role,userId] of [['owner',owner],['field',field]]) {
    const samples:number[] = [];
    let captured:{sql:string;bindings:unknown[]}[] = [];
    const capture = (query:{sql:string;bindings?:unknown[]}) => { if (query.sql.includes('"visible"')) captured.push({sql:query.sql,bindings:query.bindings ?? []}); };
    for (let n=0;n<55;n++) {
      if (n===5) db.on('query',capture);
      const started=performance.now(),result=await readCalendar(db,{workspaceId,userId},permissionIds,{workspaceId,date:'2026-11-02'});
      const elapsed=performance.now()-started;
      if(n===5) db.removeListener('query',capture);
      assert.equal(result.scope,role==='field' ? 'own' : 'workspace');
      assert.equal(result.unscheduledTotal,role==='field' ? expectedUnscheduled.field : 250);
      assert(result.entries.length>0);
      if(role==='field') assert(result.entries.every(v=>v.crew.every(p=>p.id===field)));
      if(n>=5) samples.push(elapsed);
    }
    samples.sort((a,b)=>a-b);
    const rounded=(n:number)=>Math.round(n*100)/100;
    measurements[role]={samples:samples.length,p50Ms:rounded(samples[24]),p95Ms:rounded(samples[47]),maxMs:rounded(samples.at(-1)!)};
    console.log(JSON.stringify({role,...measurements[role]}));
    const client=await db.client.acquireConnection();
    try {
      for (const query of captured) {
        const result=await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query.sql}`,query.bindings);
        const plan=result.rows[0]['QUERY PLAN'][0],indexes=new Set<string>();
        function visit(node:Record<string,unknown>) { if(typeof node['Index Name']==='string') indexes.add(node['Index Name']);for(const child of (node.Plans ?? []) as Record<string,unknown>[])visit(child); }
        visit(plan.Plan);explain.push({role,node:plan.Plan['Node Type'],executionMs:plan['Execution Time'],indexes:[...indexes].sort()});
      }
    } finally { await db.client.releaseConnection(client); }
    captured=[];
  }
  console.log(JSON.stringify({jobs:10000,unscheduled:250,warmups:5,measurements,explain,targetP95Ms:300,passed:Object.values(measurements).every(v=>v.p95Ms<300)},null,2));
  assert(Object.values(measurements).every(v=>v.p95Ms<300),'Calendar read P95 must be below 300ms at 10k Jobs.');
} finally {
  await db('workspaces').where({id:workspaceId}).delete();
  await db('users').whereIn('id',[owner,field]).delete();
  await analyze();await db.destroy();
}
