import { test,expect,request as requests,type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase,createJob,mutateJob,readWorkOrderCreationVisit,createWorkOrder,mutateWorkOrder,operateCalendarScheduleProposal,readCalendarScheduleProposal,CalendarProposalConflictError } from '@salesmora/data';
import { permissionIds,chatStreamEventSchema,calendarProposalViewSchema,type CalendarProposalTicket } from '@salesmora/contracts';
test.setTimeout(120000);
const connection=process.env.TEST_DATABASE_URL;
if (!connection || !new URL(connection).pathname.endsWith('_test') || connection === process.env.DATABASE_URL || !['localhost','127.0.0.1'].includes(new URL(connection).hostname)) throw Error('Isolated local test database required.');
const db=createDatabase(connection),origin='http://127.0.0.1:3002',headers={ Origin:origin },prefix=randomUUID();
const clients:Record<string,APIRequestContext>={},users:Record<string,string>={};
let workspaceId:string,customerId:string,ownJob:string,orderId:string,ref:string;
const identity=()=>({ userId:users.owner,workspaceId });
const args=()=>({ operation:'schedule',recordRef:ref,scheduledDate:'2026-11-02',arrivalWindow:'12:00-14:00' });
const binding=(ticket:CalendarProposalTicket)=>({ proposalId:ticket.proposalId,inputHash:ticket.inputHash,visitId:ticket.visitId,revision:ticket.revision });
async function turn(role='owner',extra:Record<string,unknown>={}) {
 const response=await clients[role].post('/api/chat/turns',{ headers,data:{ workspaceId,clientTurnId:randomUUID(),surfaceKey:'home',message:`fixture:calendar-propose:${JSON.stringify(args())}`,...extra } });
 expect(response.status()).toBe(200);
 return (await response.text()).split('\n\n').filter(f=>f.startsWith('data:')).map(f=>chatStreamEventSchema.parse(JSON.parse(f.slice(5))));
}
async function propose(role='owner',extra:Record<string,unknown>={}) {
 const events=await turn(role,extra),event=events.find(e=>e.type==='calendar.proposal');
 if (event?.type!=='calendar.proposal') throw Error(JSON.stringify(events));
 expect(events[1]).toMatchObject({ type:'status',status:'thinking' });expect(events.at(-1)?.type).toBe('turn.completed');
 return { events,ticket:event.result };
}
async function get(ticket:CalendarProposalTicket,role='owner') { return clients[role].get(`/api/chat/calendar/proposals?${new URLSearchParams({ workspaceId,...binding(ticket) })}`); }
async function decide(ticket:CalendarProposalTicket,decision='confirm',role='owner',extra:Record<string,unknown>={}) { return clients[role].post('/api/chat/calendar/proposals',{ headers,data:{ workspaceId,...binding(ticket),decision,...extra } }); }
test.beforeAll(async () => {
  test.setTimeout(120000);
  await db('rateLimits').where('key','like','%/sign-up/email%').delete();
  for (const role of ['owner','field','other']) {
    clients[role] = await requests.newContext({ baseURL: origin }); const email = `${prefix}-${role}@example.test`;
    expect((await clients[role].post('/api/auth/sign-up/email', { headers, data: { name: `Calendar ${role}`, email, password: 'Fictional-calendar-chat-42!', termsAccepted: true } })).status()).toBe(200);
    users[role] = (await db('users').where({ email }).first()).id;
  }
  const response = await clients.owner.post('/api/workspaces', { headers, data: { business: { businessName: 'Calendar chat fixture', businessType: 'plumbing' }, services: { services: ['repairs'], postalCode: '', serviceRange: '' }, team: { invitations: [] } } });
  expect(response.status()).toBe(201); workspaceId = (await response.json()).workspaceId;
  await db('workspaceMemberships').insert({ workspaceId, userId: users.field, role: 'field' });
  await db('workspaces').where({ id: workspaceId }).update({ timezone: 'America/New_York' });
  customerId = randomUUID();
  await db('customers').insert({ id: customerId, workspaceId, name: 'Calendar Customer', type: 'person', companyName: '', email: 'PRIVATE_CONTACT@example.test', phone: '', location: '', internalNotes: 'PRIVATE_CUSTOMER' });
});
// Independent journeys should not consume each other's ten-turn/minute allowance.
// This only ages completed fixtures in this suite's isolated local workspace.
test.beforeEach(async () => {
  await db('chatTurns').where({ workspaceId }).whereNotIn('state',['accepted','running']).update({ createdAt:new Date(Date.now() - 120000) });
});
test.beforeEach(async()=>{
 ownJob=(await createJob(db,identity(),permissionIds,{ workspaceId,submissionId:randomUUID(),customerId,title:'Calendar proposal Job',primaryOwnerId:users.field,scheduledDate:'2026-10-20',arrivalWindow:'09:00-11:00' })).jobId;
 const job=await db('jobs').where({id:ownJob}).first();ref=`J-${String(job.jobNumber).padStart(4,'0')}`;
 const visit=await readWorkOrderCreationVisit(db,identity(),permissionIds,ownJob);if (!visit) throw Error();
 const order=await createWorkOrder(db,identity(),permissionIds,{ workspaceId,jobId:ownJob,submissionId:randomUUID(),title:'Calendar proposal Work Order',assigneeId:users.field,visit:{kind:'job',visitId:visit.id,revision:visit.revision} });
 orderId=order.workOrderId;
 await mutateWorkOrder(db,identity(),permissionIds,{workspaceId,workOrderId:orderId,expectedVersion:order.version,submissionId:randomUUID(),action:'status',to:'issued',confirmed:true});
});
test.afterEach(async()=>{await db('workOrders').where({workspaceId}).delete();await db('jobs').where({workspaceId}).delete();});
test.afterAll(async()=>{
 if(workspaceId){await db('workOrders').where({workspaceId}).delete();await db('jobs').where({workspaceId}).delete();await db('workspaceSubscriptions').where({workspaceId}).delete();await db('workspaces').where({id:workspaceId}).delete();}
 await db('users').whereIn('id',Object.values(users)).delete();await Promise.all(Object.values(clients).map(c=>c.dispose()));await db.destroy();
});

test('prepares a full shared review; only explicit confirmation saves both records and exact retry is idempotent',async()=>{
 const {ticket,events}=await propose();const source=events[0];if(source.type!=='turn.accepted')throw Error();
 expect(JSON.stringify(events.find(e=>e.type==='calendar.proposal'))).not.toContain('PRIVATE_');
 expect((await db('jobs').where({id:ownJob}).first()).scheduledDate.toISOString().slice(0,10)).toBe('2026-10-20');
 const response=await get(ticket);expect(response.status()).toBe(200);const view=calendarProposalViewSchema.parse((await response.json()).view);
 expect(view.draft.records.map(r=>r.type).sort()).toEqual(['job','work_order']);expect(view.draft.crew.map(p=>p.id)).toEqual([users.field]);
 expect(JSON.stringify(view)).not.toContain('PRIVATE_');
 const yes=await turn('owner',{threadId:source.threadId,message:'fixture:calendar-history'});expect(yes.at(-1)?.type).toBe('turn.completed');
 expect((await db('chatCalendarProposals').where({id:ticket.proposalId}).first()).state).toBe('pending');
 expect((await get(ticket,'field')).status()).toBe(403);expect((await get(ticket,'other')).status()).toBe(403);
 expect((await decide(ticket,'confirm','owner',{scheduledDate:'2026-12-01'})).status()).toBe(422);
 expect((await decide(ticket,'confirm','owner',{inputHash:'f'.repeat(64)})).status()).toBe(409);
 expect((await clients.owner.post('/api/chat/calendar/proposals',{headers:{Origin:'https://example.test'},data:{workspaceId,...binding(ticket),decision:'confirm'}})).status()).toBe(403);
 const saved=await decide(ticket);expect(saved.status()).toBe(200);expect((await saved.json()).view.draft.state).toBe('confirmed');
 expect((await decide(ticket)).status()).toBe(200);expect((await decide(ticket,'cancel')).status()).toBe(409);
 for(const [table,id] of [['jobs',ownJob],['workOrders',orderId]]){const row=await db(table).where({id}).first();expect(row.scheduledDate.toISOString().slice(0,10)).toBe('2026-11-02');expect(row.arrivalWindow).toBe('12:00-14:00');}
 expect(await db('calendarOperations').where({workspaceId,submissionId:ticket.proposalId})).toHaveLength(1);
 expect(await db('jobActivity').where({workspaceId,jobId:ownJob,source:'assistant-confirmed'})).toHaveLength(1);
 expect(await db('workOrderActivity').where({workspaceId,workOrderId:orderId,source:'assistant-confirmed'})).toHaveLength(1);
 const history=await(await clients.owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${source.threadId}`)).json();
 expect(history.turns.find((t:{id:string})=>t.id===source.turnId).calendarProposal.state).toBe('confirmed');
});
test('Field must have primary responsibility and scheduling permission on every active record',async()=>{
 const allowed=await propose('field');expect((await decide(allowed.ticket,'cancel','field')).status()).toBe(200);
 const job=await db('jobs').where({id:ownJob}).first();
 await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'assign',primaryOwnerId:users.owner,teamUserIds:[]});
 const reassigned=await db('jobs').where({id:ownJob}).first();
 await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:reassigned.version,submissionId:randomUUID(),action:'assign',primaryOwnerId:users.owner,teamUserIds:[users.field]});
 const denied=await turn('field');expect(denied.some(e=>e.type==='calendar.proposal')).toBe(false);
 expect((await db('jobs').where({id:ownJob}).first()).scheduledDate.toISOString().slice(0,10)).toBe('2026-10-20');
});
test('a changed record invalidates the proposal and inherited answer evidence',async()=>{
 const {ticket,events}=await propose();if(events[0].type!=='turn.accepted')throw Error();const threadId=events[0].threadId;
 const inherited=await turn('owner',{threadId,message:'fixture:calendar-history'});expect(inherited.at(-1)?.type).toBe('turn.completed');
 const job=await db('jobs').where({id:ownJob}).first();
 await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'edit',title:'Changed after proposal',service:job.service,location:job.location,description:job.description});
 expect((await get(ticket)).status()).toBe(409);expect((await decide(ticket)).status()).toBe(409);
 const history=await(await clients.owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${threadId}`)).json();
 expect(history.turns.every((t:{calendarProposal?:unknown})=>!t.calendarProposal)).toBe(true);
 const dependent=await db('chatTurns').where({id:inherited[0].turnId}).first();expect(dependent.calendarProposalEvidence).toContain(ticket.proposalId);
 expect((await db('jobs').where({id:ownJob}).first()).scheduledDate.toISOString().slice(0,10)).toBe('2026-10-20');
});
test('a replacement proposal supersedes the old one without saving',async()=>{
 const first=await propose();if(first.events[0].type!=='turn.accepted')throw Error();
 const second=await propose('owner',{threadId:first.events[0].threadId});
 expect((await decide(first.ticket)).status()).toBe(409);expect((await decide(second.ticket,'cancel')).status()).toBe(200);expect((await decide(second.ticket,'cancel')).status()).toBe(200);
 expect(await db('calendarOperations').where({workspaceId,submissionId:second.ticket.proposalId})).toHaveLength(0);
});
test('permission revocation blocks a pending decision and replacement membership cannot revive it',async()=>{
 const {ticket}=await propose('field');const grants=await db('workspaceRolePolicies').where({workspaceId,role:'field',permission:'jobs.schedule.update'});
 try {await db('workspaceRolePolicies').where({workspaceId,role:'field',permission:'jobs.schedule.update'}).delete();expect((await decide(ticket,'confirm','field')).status()).toBe(403);}
 finally{if(grants.length)await db('workspaceRolePolicies').insert(grants);}
 const membership=await db('workspaceMemberships').where({workspaceId,userId:users.field}).first();
 await db('workspaceMemberships').where({workspaceId,userId:users.field}).delete();await db('workspaceMemberships').insert(membership);
 expect((await get(ticket,'field')).status()).toBe(403);
});
test('expiry is enforced in the server operation even when the browser still has the binding',async()=>{
 const {ticket}=await propose();const row=await db('chatCalendarProposals').where({id:ticket.proposalId}).first(),originalNow=Date.now;
 try {
  Date.now=()=>Date.parse(row.payload.draft.expiresAt)+1;
  expect((await readCalendarScheduleProposal(db,identity(),permissionIds,binding(ticket))).draft.state).toBe('expired');
  await expect(operateCalendarScheduleProposal(db,identity(),permissionIds,binding(ticket),'confirm')).rejects.toBeInstanceOf(CalendarProposalConflictError);
 } finally{Date.now=originalNow;}
 expect(await db('calendarOperations').where({workspaceId,submissionId:ticket.proposalId})).toHaveLength(0);
});
test('an outer rollback removes the shared mutation, operation receipt and confirmation audit together',async()=>{
 const {ticket}=await propose();
 await expect(db.transaction(async trx=>{await operateCalendarScheduleProposal(trx,identity(),permissionIds,binding(ticket),'confirm');throw Error('fixture rollback');})).rejects.toThrow('fixture rollback');
 expect((await db('chatCalendarProposals').where({id:ticket.proposalId}).first()).state).toBe('pending');
 expect(await db('calendarOperations').where({workspaceId,submissionId:ticket.proposalId})).toHaveLength(0);
 expect(await db('chatCalendarProposalAudit').where({workspaceId,proposalId:ticket.proposalId,action:'confirmed'})).toHaveLength(0);
 for(const [table,id] of [['jobs',ownJob],['workOrders',orderId]])expect((await db(table).where({id}).first()).scheduledDate.toISOString().slice(0,10)).toBe('2026-10-20');
});
test('advisories use complete active visits beyond card limits and do not block the review',async()=>{
 for(let i=0;i<27;i++)await createJob(db,identity(),permissionIds,{workspaceId,submissionId:randomUUID(),customerId,title:`Other visit ${i}`,primaryOwnerId:users.field,scheduledDate:'2026-11-02',arrivalWindow:i===0?'12:00-14:00':null});
 const {ticket}=await propose();const response=await get(ticket);expect(response.status()).toBe(200);const view=calendarProposalViewSchema.parse((await response.json()).view);
 expect(view.draft.warnings.some(w=>w.includes('28 visits'))).toBe(true);expect(view.draft.warnings.some(w=>w.includes('overlapping'))).toBe(true);expect(view.draft.warnings.some(w=>w.includes('no arrival window'))).toBe(true);
 expect((await decide(ticket,'cancel')).status()).toBe(200);
});
test('a proposal is unusable before turn completion and revocation during streaming withholds it',async()=>{
 const clientTurnId=randomUUID();const pending=clients.field.post('/api/chat/turns',{headers,data:{workspaceId,clientTurnId,surfaceKey:'home',message:`fixture:calendar-propose-slow:${JSON.stringify(args())}`}});
 let stored:{id:string;payload:{draft:{inputHash:string;visitId:string;revision:string}}}|undefined;
 await expect.poll(async()=>{stored=await db('chatCalendarProposals as p').join('chatTurns as t','t.id','p.turnId').where({'t.workspaceId':workspaceId,'t.clientTurnId':clientTurnId}).select('p.id','p.payload').first();return !!stored;}).toBe(true);
 const draft=stored!.payload.draft,ticket={proposalId:stored!.id,inputHash:draft.inputHash,visitId:draft.visitId,revision:draft.revision,state:'pending' as const};
 expect((await get(ticket,'field')).status()).toBe(403);
 const grants=await db('workspaceRolePolicies').where({workspaceId,role:'field',permission:'jobs.schedule.update'});
 try {
  await db('workspaceRolePolicies').where({workspaceId,role:'field',permission:'jobs.schedule.update'}).delete();const body=await(await pending).text();expect(body).not.toContain('calendar.proposal');expect((await decide(ticket,'confirm','field')).status()).toBe(403);
 }finally{if(grants.length)await db('workspaceRolePolicies').insert(grants);}
});
test('the live assistant confirms through the approved card and refreshes the Calendar',async({browser})=>{
 const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();
 try{
  await page.goto(`/calendar?workspace=${workspaceId}&date=2026-11-02`);await page.getByRole('button',{name:/SalesMora assistant/i}).click();const dialog=page.getByRole('dialog');
  await dialog.getByRole('textbox').fill(`fixture:calendar-propose:${JSON.stringify(args())}`);await dialog.getByRole('button',{name:'Ask assistant',exact:true}).click();
  const card=dialog.getByRole('region',{name:'Review visit schedule'});await expect(card.getByRole('button',{name:'Confirm schedule'})).toBeEnabled({timeout:30000});
  await expect(card.getByText('Calendar proposal Work Order')).toBeVisible();
  const refreshed=page.waitForResponse(r=>r.url().includes('/api/calendar?')&&r.request().method()==='GET');await card.getByRole('button',{name:'Confirm schedule'}).click();
  await expect(card.getByRole('status')).toHaveText(/Schedule saved/,{timeout:30000});const result=await(await refreshed).json();expect(result.entries.some((v:{records:{id:string}[]})=>v.records.some(r=>r.id===ownJob))).toBe(true);
  await page.reload();await page.getByRole('button',{name:/SalesMora assistant/i}).click();await expect(page.getByRole('region',{name:'Review visit schedule'}).getByRole('status')).toHaveText(/Schedule saved/,{timeout:30000});
 }finally{await context.close();}
});

test('rescheduling keeps an unspecified arrival window and only unsets it on an explicit request',async()=>{
 const kept=await propose('owner',{message:`fixture:calendar-propose:${JSON.stringify({...args(),arrivalWindow:null,windowMode:'keep'})}`});
 expect((await(await get(kept.ticket)).json()).view.draft.to.arrivalWindow).toBe('09:00-11:00');await decide(kept.ticket,'cancel');
 const unset=await propose('owner',{message:`fixture:calendar-propose:${JSON.stringify({...args(),arrivalWindow:null,windowMode:'unset'})}`});
 expect((await(await get(unset.ticket)).json()).view.draft.to.arrivalWindow).toBeNull();await decide(unset.ticket,'cancel');
});

test('already-set answers retain Calendar evidence even though no proposal is created',async()=>{
 const events=await turn('field',{message:`fixture:calendar-propose:${JSON.stringify({...args(),scheduledDate:'2026-10-20',arrivalWindow:null,windowMode:'keep'})}`});
 expect(events.at(-1)?.type).toBe('turn.completed');expect(events.some(e=>e.type==='calendar.proposal')).toBe(false);
 const source=events[0];if(source.type!=='turn.accepted')throw Error();
 const row=await db('chatTurns').where({id:source.turnId}).first();expect(row.calendarStamp).toMatch(/^[a-f0-9]{64}$/);
 const job=await db('jobs').where({id:ownJob}).first();await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'assign',primaryOwnerId:users.owner,teamUserIds:[]});
 const history=await(await clients.field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${source.threadId}`)).json();
 expect(JSON.stringify(history.messages.filter((m:{role:string})=>m.role==='assistant'))).not.toContain('already has');
});

test('a proposal on Work Order details resolves the current record and refreshes that detail after saving',async({browser})=>{
 const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();
 try{
  await page.goto(`/work-orders/${orderId}?workspace=${workspaceId}`);await page.getByRole('button',{name:/SalesMora assistant/i}).click();const dialog=page.getByRole('dialog');
  await dialog.getByRole('textbox').fill(`fixture:calendar-propose:${JSON.stringify({...args(),recordRef:null})}`);await dialog.getByRole('button',{name:'Ask assistant',exact:true}).click();
  const card=dialog.getByRole('region',{name:'Review visit schedule'});await expect(card.getByRole('button',{name:'Confirm schedule'})).toBeEnabled({timeout:30000});
  const refreshed=page.waitForResponse(r=>r.url().includes(`/api/work-orders/${orderId}?`)&&r.request().method()==='GET');await card.getByRole('button',{name:'Confirm schedule'}).click();
  await expect(card.getByRole('status')).toHaveText(/Schedule saved/,{timeout:30000});expect((await(await refreshed).json()).workOrder.scheduledDate).toBe('2026-11-02');
 }finally{await context.close();}
});

const clearArgs=()=>({operation:'clear',recordRef:ref,scheduledDate:null,arrivalWindow:null,windowMode:'unset'});
const proposeClear=(role='owner',extra:Record<string,unknown>={})=>propose(role,{message:`fixture:calendar-propose:${JSON.stringify(clearArgs())}`,...extra});
test('clear reviews the complete visit, needs browser confirmation, clears atomically and replays one saved receipt',async()=>{
 const before=await db('jobs').where({id:ownJob}).first();
 const {ticket,events}=await proposeClear();const source=events[0];if(source.type!=='turn.accepted')throw Error();
 const view=calendarProposalViewSchema.parse((await(await get(ticket)).json()).view);
 expect(view.draft.intent).toBe('clear');expect(view.draft.to).toEqual({scheduledDate:null,arrivalWindow:null});expect(view.draft.warnings).toEqual([]);expect(view.draft.records).toHaveLength(2);
 expect((await db('jobs').where({id:ownJob}).first()).scheduledDate).not.toBeNull();
 await turn('owner',{threadId:source.threadId,message:'fixture:calendar-history'});
 expect((await db('chatCalendarProposals').where({id:ticket.proposalId}).first()).state).toBe('pending');
 expect((await decide(ticket,'confirm','owner',{intent:'clear',schedule:{scheduledDate:null,arrivalWindow:null}})).status()).toBe(422);
 expect((await get(ticket,'field')).status()).toBe(403);
 const result=await decide(ticket);expect(result.status()).toBe(200);const saved=calendarProposalViewSchema.parse((await result.json()).view);
 expect(saved.draft.state).toBe('confirmed');expect(saved.draft.records.find(r=>r.type==='job')?.status).toBe('needs-scheduling');
 for(const [table,id] of [['jobs',ownJob],['workOrders',orderId]]){const row=await db(table).where({id}).first();expect(row.scheduledDate).toBeNull();expect(row.arrivalWindow).toBeNull();}
 const after=await db('jobs').where({id:ownJob}).first();expect(after.primaryOwnerId).toBe(before.primaryOwnerId);expect(after.completionDeadline).toEqual(before.completionDeadline);
 expect((await db('workOrders').where({id:orderId}).first()).status).toBe('issued');
 expect((await decide(ticket)).status()).toBe(200);expect((await decide(ticket,'cancel')).status()).toBe(409);
 expect(await db('calendarOperations').where({workspaceId,submissionId:ticket.proposalId})).toHaveLength(1);
 expect(await db('jobActivity').where({workspaceId,jobId:ownJob,source:'assistant-confirmed'})).toHaveLength(1);
 expect(await db('workOrderActivity').where({workspaceId,workOrderId:orderId,source:'assistant-confirmed'})).toHaveLength(1);
 const replay=await get(ticket);expect(replay.status()).toBe(200);expect((await replay.json()).view.draft.intent).toBe('clear');
 const history=await(await clients.owner.get(`/api/chat/threads?workspace=${workspaceId}&thread=${source.threadId}`)).json();expect(history.turns.find((t:{id:string})=>t.id===source.turnId).calendarProposal.state).toBe('confirmed');
});
test('Field clear requires full primary responsibility and current permission on all records',async()=>{
 const {ticket}=await proposeClear('field');const grants=await db('workspaceRolePolicies').where({workspaceId,role:'field',permission:'workorders.schedule.update'});
 try{await db('workspaceRolePolicies').where({workspaceId,role:'field',permission:'workorders.schedule.update'}).delete();expect((await decide(ticket,'confirm','field')).status()).toBe(403);}
 finally{if(grants.length)await db('workspaceRolePolicies').insert(grants);}
 const job=await db('jobs').where({id:ownJob}).first();await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'assign',primaryOwnerId:users.owner,teamUserIds:[]});
 const denied=await turn('field',{message:`fixture:calendar-propose:${JSON.stringify(clearArgs())}`});expect(denied.some(e=>e.type==='calendar.proposal')).toBe(false);
 expect((await db('jobs').where({id:ownJob}).first()).scheduledDate).not.toBeNull();
});
test('clear honors expiry, cancellation, stale versions and transaction rollback',async()=>{
 const canceled=await proposeClear();expect((await decide(canceled.ticket,'cancel')).status()).toBe(200);expect((await decide(canceled.ticket)).status()).toBe(409);
 const {ticket}=await proposeClear();
 await expect(db.transaction(async trx=>{await operateCalendarScheduleProposal(trx,identity(),permissionIds,binding(ticket),'confirm');throw Error('clear rollback');})).rejects.toThrow('clear rollback');
 expect((await db('chatCalendarProposals').where({id:ticket.proposalId}).first()).state).toBe('pending');expect(await db('calendarOperations').where({workspaceId,submissionId:ticket.proposalId})).toHaveLength(0);
 expect(await db('chatCalendarProposalAudit').where({workspaceId,proposalId:ticket.proposalId,action:'confirmed'})).toHaveLength(0);
 for(const [table,id] of [['jobs',ownJob],['workOrders',orderId]])expect((await db(table).where({id}).first()).scheduledDate).not.toBeNull();
 const row=await db('chatCalendarProposals').where({id:ticket.proposalId}).first(),originalNow=Date.now;
 try{Date.now=()=>Date.parse(row.payload.draft.expiresAt)+1;await expect(operateCalendarScheduleProposal(db,identity(),permissionIds,binding(ticket),'confirm')).rejects.toBeInstanceOf(CalendarProposalConflictError);}finally{Date.now=originalNow;}
 const job=await db('jobs').where({id:ownJob}).first();await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'edit',title:'Edited before clear confirmation',service:job.service,location:job.location,description:job.description});
 expect((await get(ticket)).status()).toBe(409);expect((await decide(ticket)).status()).toBe(409);
});
test('clearing active records preserves a closed Work Order schedule and history',async()=>{
 const order=await db('workOrders').where({id:orderId}).first();await mutateWorkOrder(db,identity(),permissionIds,{workspaceId,workOrderId:orderId,expectedVersion:order.version,submissionId:randomUUID(),action:'status',to:'canceled',reason:'Visit no longer required',confirmed:true});
 const closed=await db('workOrders').where({id:orderId}).first(),{ticket}=await proposeClear();
 const view=calendarProposalViewSchema.parse((await(await get(ticket)).json()).view);expect(view.draft.records.map(r=>r.id)).toEqual([ownJob]);
 expect((await decide(ticket)).status()).toBe(200);const after=await db('workOrders').where({id:orderId}).first();
 expect(after.scheduledDate).toEqual(closed.scheduledDate);expect(after.arrivalWindow).toBe(closed.arrivalWindow);expect(after.version).toBe(closed.version);expect(after.status).toBe('canceled');
 expect((await db('jobs').where({id:ownJob}).first()).scheduledDate).toBeNull();
});
test('already-unscheduled answers retain evidence and do not create another proposal',async()=>{
 const {ticket}=await proposeClear('field');expect((await decide(ticket,'confirm','field')).status()).toBe(200);
 const events=await turn('field',{message:`fixture:calendar-propose:${JSON.stringify(clearArgs())}`});expect(events.at(-1)?.type).toBe('turn.completed');expect(events.some(e=>e.type==='calendar.proposal')).toBe(false);
 const source=events[0];if(source.type!=='turn.accepted')throw Error();const row=await db('chatTurns').where({id:source.turnId}).first();expect(row.calendarStamp).toMatch(/^[a-f0-9]{64}$/);
 const job=await db('jobs').where({id:ownJob}).first();await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'assign',primaryOwnerId:users.owner,teamUserIds:[]});
 const history=await(await clients.field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${source.threadId}`)).json();expect(JSON.stringify(history.messages.filter((m:{role:string})=>m.role==='assistant'))).not.toContain('already unscheduled');
});
test('live clear confirmation removes the visit from Calendar and retains the saved receipt on reload',async({browser})=>{
 const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();
 try{
  await page.goto(`/calendar?workspace=${workspaceId}&date=2026-10-20`);await page.getByRole('button',{name:/SalesMora assistant/i}).click();const dialog=page.getByRole('dialog');
  await dialog.getByRole('textbox').fill(`fixture:calendar-propose:${JSON.stringify(clearArgs())}`);await dialog.getByRole('button',{name:'Ask assistant',exact:true}).click();
  const card=dialog.getByRole('region',{name:'Review clearing this visit'});await expect(card.getByRole('button',{name:'Confirm clear schedule'})).toBeEnabled({timeout:30000});await expect(card.getByText('Calendar proposal Work Order')).toBeVisible();
  const refreshed=page.waitForResponse(r=>r.url().includes('/api/calendar?')&&r.request().method()==='GET');await card.getByRole('button',{name:'Confirm clear schedule'}).click();
  await expect(card.getByRole('status')).toHaveText(/Schedule cleared/,{timeout:30000});const result=await(await refreshed).json();expect(result.entries.some((v:{records:{id:string}[]})=>v.records.some(r=>r.id===ownJob))).toBe(false);
  await expect(card.getByText('Needs Scheduling',{exact:true})).toBeVisible();
  await page.reload();await page.getByRole('button',{name:/SalesMora assistant/i}).click();await expect(page.getByRole('region',{name:'Review clearing this visit'}).getByRole('status')).toHaveText(/Schedule cleared/,{timeout:30000});
 }finally{await context.close();}
});

async function focusedVisit(role='owner') {
 const response=await clients[role].get(`/api/calendar?workspace=${workspaceId}&date=2026-10-20`);expect(response.status()).toBe(200);
 const visit=(await response.json()).entries.find((v:{records:{id:string}[]})=>v.records.some(r=>r.id===ownJob||r.id===orderId));if(!visit)throw Error('Missing fixture visit');return {id:visit.id as string,revision:visit.revision as string};
}
test('focused context projects current scoped visit data, resolves null proposals, and clearing context removes the implicit target',async()=>{
 const calendarVisit=await focusedVisit();
 const events=await turn('owner',{surfaceKey:'calendar',calendarVisit,message:'fixture:calendar-focus'});expect(events.at(-1)?.type).toBe('turn.completed');
 const text=JSON.stringify(events);expect(text).toContain('Calendar proposal Job');expect(text).toContain('Calendar proposal Work Order');expect(text).not.toContain('PRIVATE_');
 const source=events[0];if(source.type!=='turn.accepted')throw Error();
 const row=await db('chatTurns').where({id:source.turnId}).first();expect(row.calendarStamp).toMatch(/^[a-f0-9]{64}$/);expect(row.pageContext.calendarVisit).toEqual(calendarVisit);
 const prepared=await propose('owner',{threadId:source.threadId,surfaceKey:'calendar',calendarVisit,message:`fixture:calendar-propose:${JSON.stringify({...args(),recordRef:null})}`});expect((await get(prepared.ticket)).status()).toBe(200);await decide(prepared.ticket,'cancel');
 const noSelection=await turn('owner',{threadId:source.threadId,surfaceKey:'calendar',message:`fixture:calendar-propose:${JSON.stringify({...args(),recordRef:null})}`});expect(noSelection.some(e=>e.type==='calendar.proposal')).toBe(false);
 const explicit=await propose('owner',{surfaceKey:'calendar',calendarVisit,message:`fixture:calendar-propose:${JSON.stringify(clearArgs())}`});expect((await decide(explicit.ticket,'cancel')).status()).toBe(200);
});
test('focused selections reject wrong surfaces, forged fields, stale revisions and inaccessible visits',async()=>{
 const calendarVisit=await focusedVisit();
 const response=(role:string,patch:Record<string,unknown>)=>clients[role].post('/api/chat/turns',{headers,data:{workspaceId,clientTurnId:randomUUID(),surfaceKey:'calendar',calendarVisit,message:'fixture:calendar-focus',...patch}});
 expect((await response('owner',{surfaceKey:'home'})).status()).toBe(422);
 expect((await response('owner',{calendarVisit:{...calendarVisit,canSchedule:true}})).status()).toBe(422);
 expect((await response('owner',{calendarVisit:{...calendarVisit,revision:'f'.repeat(64)}})).status()).toBe(409);
 expect((await response('other',{})).status()).toBe(403);
 const job=await db('jobs').where({id:ownJob}).first();await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'edit',title:'Changed after selection',service:job.service,location:job.location,description:job.description});
 expect((await response('owner',{})).status()).toBe(409);
});
test('focused Field reads remain own-scoped and do not grant scheduling rights on hidden shared records',async()=>{
 const order=await db('workOrders').where({id:orderId}).first();
 const job=await db('jobs').where({id:ownJob}).first();await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'assign',primaryOwnerId:users.owner,teamUserIds:[]});
 const calendarVisit=await focusedVisit('field');
 const events=await turn('field',{surfaceKey:'calendar',calendarVisit,message:'fixture:calendar-focus'});expect(events.at(-1)?.type).toBe('turn.completed');const text=JSON.stringify(events);expect(text).toContain('Calendar proposal Work Order');expect(text).not.toContain('Calendar proposal Job');expect(text).not.toContain('Calendar owner');
 const denied=await turn('field',{surfaceKey:'calendar',calendarVisit,message:`fixture:calendar-propose:${JSON.stringify({...clearArgs(),recordRef:null})}`});expect(denied.some(e=>e.type==='calendar.proposal')).toBe(false);expect((await db('workOrders').where({id:orderId}).first()).version).toBe(order.version);
});
test('focused context evidence invalidates inherited answers and blocks release after mid-stream reassignment',async()=>{
 const calendarVisit=await focusedVisit('field');
 const first=await turn('field',{surfaceKey:'calendar',calendarVisit,message:'fixture:calendar-focus'});const source=first[0];if(source.type!=='turn.accepted')throw Error();
 const clientTurnId=randomUUID();const pending=clients.field.post('/api/chat/turns',{headers,data:{workspaceId,clientTurnId,surfaceKey:'calendar',calendarVisit,message:'fixture:calendar-focus-slow'}});
 await expect.poll(async()=>{const row=await db('chatTurns').where({workspaceId,clientTurnId}).first();return row?.state;}).toBe('running');
 const job=await db('jobs').where({id:ownJob}).first();await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'assign',primaryOwnerId:users.owner,teamUserIds:[]});
 const body=await(await pending).text();expect(body).not.toContain('Calendar proposal Job');expect(body).not.toContain('turn.completed');
 const history=await(await clients.field.get(`/api/chat/threads?workspace=${workspaceId}&thread=${source.threadId}`)).json();expect(JSON.stringify(history.messages.filter((m:{role:string})=>m.role==='assistant'))).not.toContain('Calendar proposal Job');
});
test('Calendar peek hands off to global chat with a removable selection and sends no implicit target after clearing',async({browser})=>{
 const context=await browser.newContext({storageState:await clients.owner.storageState()}),page=await context.newPage();
 try{
  const turnsBefore=Number((await db('chatTurns').where({workspaceId}).count<{count:string}[]>('* as count'))[0].count);
  const calendarVisit=await focusedVisit();await page.goto(`/calendar?workspace=${workspaceId}&date=2026-10-20&visit=${calendarVisit.id}`);
  await page.getByRole('button',{name:'Ask assistant about this visit'}).click();const dialog=page.getByRole('dialog',{name:'What would you like to get done?'});await expect(dialog).toBeVisible();await expect(page.getByRole('dialog')).toHaveCount(1);
  const chip=dialog.getByRole('button',{name:/Clear assistant context: Using Visit/});await expect(chip).toBeVisible();expect(Number((await db('chatTurns').where({workspaceId}).count<{count:string}[]>('* as count'))[0].count)).toBe(turnsBefore);
  await dialog.getByRole('textbox').fill('fixture:calendar-focus');const sent=page.waitForRequest(r=>r.url().endsWith('/api/chat/turns')&&r.method()==='POST');await dialog.getByRole('button',{name:'Ask assistant',exact:true}).click();expect((await sent).postDataJSON().calendarVisit).toEqual(calendarVisit);
  await expect(chip).toBeEnabled({timeout:30000});
  const job=await db('jobs').where({id:ownJob}).first();await mutateJob(db,identity(),permissionIds,{workspaceId,jobId:ownJob,expectedVersion:job.version,submissionId:randomUUID(),action:'edit',title:'Changed while assistant was open',service:job.service,location:job.location,description:job.description});
  await dialog.getByRole('textbox').fill('fixture:calendar-focus');await dialog.getByRole('button',{name:'Ask assistant',exact:true}).click();
  await expect(dialog.getByText('This visit changed or is no longer available. Clear the context or select the visit again before continuing.')).toBeVisible();
  await expect(chip).toBeEnabled();await chip.click();await expect(dialog.getByRole('textbox')).toBeFocused();
  await dialog.getByRole('textbox').fill(`fixture:calendar-propose:${JSON.stringify({...args(),recordRef:null})}`);const cleared=page.waitForRequest(r=>r.url().endsWith('/api/chat/turns')&&r.method()==='POST');await dialog.getByRole('button',{name:'Ask assistant',exact:true}).click();const clearedRequest=(await cleared).postDataJSON();expect(clearedRequest).not.toHaveProperty('calendarVisit');
  await expect(dialog.getByRole('button',{name:'Ask assistant',exact:true})).toBeDisabled();await expect.poll(async()=>(await db('chatTurns').where({workspaceId,clientTurnId:clearedRequest.clientTurnId}).first())?.state).toBe('completed');
  const clearedTurn=await db('chatTurns').where({workspaceId,clientTurnId:clearedRequest.clientTurnId}).first();expect(await db('chatCalendarProposals').where({turnId:clearedTurn.id})).toHaveLength(0);
 }finally{await context.close();}
});
