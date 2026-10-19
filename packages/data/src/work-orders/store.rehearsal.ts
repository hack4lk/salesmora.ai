import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {permissionIds,permissionCatalog,workspaceRoles} from "@salesmora/contracts";
import {createDatabase} from "../database";
import {initializeWorkspacePolicy,AuthorizationAccessError} from "../authorization/store";
import {readWorkOrders,readWorkOrderRecord,readWorkOrderDetail,WorkOrderConflictError,WorkOrderValidationError} from "./store";
import {readNotifications,markNotificationRead} from "../notifications/store";
import {exportWorkOrders} from "./export";
import {createWorkOrder,mutateWorkOrder} from "./mutations";
import {WorkOrderLifecycleError} from "@salesmora/domain";
const env=fileURLToPath(new URL("../../../../.env.local",import.meta.url));
if(existsSync(env))process.loadEnvFile(env);
const connection=process.env.TEST_DATABASE_URL;
if(!connection||!new URL(connection).pathname.endsWith("_test")||connection===process.env.DATABASE_URL||!["localhost","127.0.0.1"].includes(new URL(connection).hostname))throw Error("Use the isolated local test database.");
const db=createDatabase(connection),workspaceId=randomUUID(),otherWorkspace=randomUUID(),customerId=randomUUID(),jobId=randomUUID(),otherJobId=randomUUID();
const users=Object.fromEntries(["owner","admin","office","field","stranger","other"].map(role=>[role,randomUUID()]));
const enabled=[...permissionIds];
const identity=(role="owner")=>({userId:users[role],workspaceId:role==="other"?otherWorkspace:workspaceId});
const ids={draft:randomUUID(),issued:randomUUID(),progress:randomUUID(),done:randomUUID(),archived:randomUUID(),otherJob:randomUUID()};
let passed=0;
async function check(label:string,work:()=>Promise<void>){await work();console.log("PASS "+label);passed++;}
const list=(role:string,extra:Record<string,unknown>={})=>readWorkOrders(db,identity(role),enabled,{workspaceId:role==="other"?otherWorkspace:workspaceId,...extra});
try{
  await db.transaction(async trx=>{
    const now=new Date();
    await trx("users").insert(Object.entries(users).map(([role,id])=>({id,name:`WO fixture ${role}`,email:`${id}@example.test`,createdAt:now,updatedAt:now,termsVersion:"fixture",termsAcceptedAt:now})));
    for(const [id,owner] of [[workspaceId,users.owner],[otherWorkspace,users.other]]){
      await trx("workspaces").insert({id,ownerId:owner,businessName:"Work orders fixture",businessType:"plumbing",postalCode:"",serviceRange:"",timezone:"America/New_York"});
      await trx("workspaceMemberships").insert({workspaceId:id,userId:owner,role:"owner"});
      await initializeWorkspacePolicy(trx,{workspaceId:id,userId:owner});
    }
    await trx("workspaceMemberships").insert(["admin","office","field","stranger"].map(role=>({workspaceId:workspaceId,userId:users[role],role:role==="stranger"?"field":role})));
    await trx("customers").insert({id:customerId,workspaceId,name:"Fictional WO Customer",type:"person",companyName:"",email:"",phone:"",location:"",internalNotes:""});
    for(const [id,title] of [[jobId,"Kitchen repair"],[otherJobId,"Roof patch"]])
      await trx("jobs").insert({id,workspaceId,customerId,customerName:"Fictional WO Customer",title,service:"",location:"12 Fiction Lane",description:"",primaryOwnerId:id===jobId?users.field:users.office});
    const base={workspaceId,jobId,instructions:"",accessNotes:"",safetyNotes:""};
    const issuedAt=new Date(),today=new Date().toISOString().slice(0,10),past="2020-01-01";
    await trx("workOrders").insert([
      {...base,id:ids.draft,title:"Draft plan",status:"draft",primaryAssigneeId:users.office},
      {...base,id:ids.issued,title:"Replace valve",status:"issued",issuedAt,scheduledDate:past,primaryAssigneeId:users.field},
      {...base,id:ids.progress,title:"Fit sink",status:"in-progress",issuedAt,startedAt:issuedAt,scheduledDate:today},
      {...base,id:ids.done,title:"Flush lines",status:"completed",issuedAt,completedAt:issuedAt},
      {...base,id:ids.archived,title:"Old work",status:"completed",issuedAt,completedAt:issuedAt,archivedAt:issuedAt},
      {...base,id:ids.otherJob,jobId:otherJobId,title:"Patch shingles",status:"issued",issuedAt},
    ]);
    await trx("workOrderTasks").insert([{id:randomUUID(),workspaceId,workOrderId:ids.progress,position:0,label:"Mount",required:true,done:true},{id:randomUUID(),workspaceId,workOrderId:ids.progress,position:1,label:"Seal",required:false,done:false}]);
    await trx("workOrderCrew").insert({workspaceId,workOrderId:ids.progress,userId:users.admin});
  });
  await check("stable per-workspace numbering and number-format DTO",async()=>{
    const all=await list("owner",{sort:"number"});
    assert.deepEqual(all.rows.map(r=>r.number),["WO-0001","WO-0002","WO-0003","WO-0004","WO-0006"]);
    assert.equal(all.total,5);assert.equal((await list("owner",{archived:true})).rows[0].number,"WO-0005");
  });
  await check("SQL role scope: office sees all, assigned field sees non-drafts on its job only, stranger and other workspace see none",async()=>{
    assert.equal((await list("office")).total,5);
    assert.deepEqual((await list("field",{sort:"number"})).rows.map(r=>r.title),["Replace valve","Fit sink","Flush lines"]);
    assert.equal((await list("stranger")).total,0);
    assert.equal((await list("other")).total,0);
    await assert.rejects(readWorkOrders(db,identity(),enabled,{workspaceId:otherWorkspace}),AuthorizationAccessError);
  });
  await check("record read honors scope and capabilities",async()=>{
    assert.equal((await readWorkOrderRecord(db,identity("field"),enabled,ids.issued)).capabilities.start,true);
    await assert.rejects(readWorkOrderRecord(db,identity("field"),enabled,ids.draft),AuthorizationAccessError);
    await assert.rejects(readWorkOrderRecord(db,identity("stranger"),enabled,ids.issued),AuthorizationAccessError);
    await assert.rejects(readWorkOrderRecord(db,identity("other"),enabled,ids.issued),AuthorizationAccessError);
    const draft=await readWorkOrderRecord(db,identity("office"),enabled,ids.draft);
    assert.equal(draft.capabilities.issue,true);assert.equal(draft.capabilities.complete,false);assert.equal(draft.assigneeName,"WO fixture office");
    assert.equal((await readWorkOrderRecord(db,identity("office"),enabled,ids.done)).capabilities.archive,false);
    assert.equal((await readWorkOrderRecord(db,identity("admin"),enabled,ids.done)).capabilities.archive,true);
  });
  await check("filters, search, mine, sorting and metrics",async()=>{
    assert.equal((await list("owner",{status:"issued"})).total,2);
    assert.deepEqual((await list("owner",{q:"wo-0002"})).rows.map(r=>r.title),["Replace valve"]);
    assert.deepEqual((await list("owner",{q:"roof"})).total,0);
    assert.equal((await list("owner",{jobNumber:"J-0002"})).total,1);
    assert.deepEqual((await list("field",{mine:true})).rows.map(r=>r.title),["Replace valve"]);
    assert.deepEqual((await list("admin",{mine:true})).rows.map(r=>r.title),["Fit sink"]);
    assert.equal((await list("owner",{scheduledFrom:"2019-01-01",scheduledTo:"2021-01-01"})).total,1);
    const {metrics}=await list("owner");
    assert.deepEqual(metrics,{issuedToday:4,inProgress:1,overdue:1,awaitingSignoff:1});
    const page=await list("owner",{pageSize:25,page:9});assert.equal(page.page,1);
  });
  await check("constraints: cancel reason, completion stamp, tenant-safe job link, 2000 character cap",async()=>{
    const row={workspaceId,jobId,title:"Bad",instructions:"",accessNotes:"",safetyNotes:""};
    await assert.rejects(db("workOrders").insert({...row,id:randomUUID(),status:"canceled",canceledAt:new Date(),issuedAt:new Date()}));
    await assert.rejects(db("workOrders").insert({...row,id:randomUUID(),status:"completed",issuedAt:new Date()}));
    await assert.rejects(db("workOrders").insert({...row,id:randomUUID(),workspaceId:otherWorkspace}));
    await assert.rejects(db("workOrders").insert({...row,id:randomUUID(),instructions:"x".repeat(2001)}));
    await assert.rejects(db("jobs").where({id:jobId}).delete());
  });
  let woId:string;
  const cur=async(role="owner",id=woId)=>readWorkOrderRecord(db,identity(role),enabled,id);
  const change=async(extra:Record<string,unknown>,role="owner",id=woId)=>{const row=await cur(role,id);return mutateWorkOrder(db,identity(role),enabled,{workspaceId,workOrderId:id,submissionId:randomUUID(),expectedVersion:row.version,...extra});};
  await check("creation: draft, numbering, idempotent retry, actor-bound receipts, scope and validation",async()=>{
    const input={workspaceId,submissionId:randomUUID(),jobId,title:"Install heater",assigneeId:users.field};
    const first=await createWorkOrder(db,identity("office"),enabled,input);woId=first.workOrderId;
    assert.deepEqual(await createWorkOrder(db,identity("office"),enabled,input),first);
    const row=await cur();assert.equal(row.number,"WO-0007");assert.equal(row.status,"draft");assert.equal(row.version,1);
    await assert.rejects(createWorkOrder(db,identity("office"),enabled,{...input,title:"Changed"}),WorkOrderConflictError);
    await assert.rejects(createWorkOrder(db,identity("field"),enabled,{...input,submissionId:randomUUID()}),AuthorizationAccessError);
    await assert.rejects(createWorkOrder(db,identity("office"),enabled,{...input,submissionId:randomUUID(),assigneeId:users.other}),WorkOrderValidationError);
    await assert.rejects(createWorkOrder(db,identity("office"),enabled,{...input,submissionId:randomUUID(),source:{kind:"estimate",estimateId:randomUUID()}}),WorkOrderValidationError);
    await assert.rejects(createWorkOrder(db,identity("other"),enabled,{...input,workspaceId:otherWorkspace,submissionId:randomUUID()}),AuthorizationAccessError);
  });
  await check("edit, tasks, materials with price/cost visibility, schedule, assign",async()=>{
    await change({action:"edit",instructions:"Shut off water first",safetyNotes:"Gas line"});
    await change({action:"schedule",scheduledDate:"2026-12-01",arrivalWindow:"08:00-10:00"});
    await change({action:"assign",assigneeId:users.field,crewIds:[users.admin]});
    await assert.rejects(change({action:"assign",assigneeId:users.field,crewIds:[users.field]}),WorkOrderValidationError);
    await change({action:"tasks",tasks:[{label:"Drain tank",required:true},{label:"Fit unit",required:false}]});
    await change({action:"materials",materials:[{catalogId:null,name:"Heater",quantity:1,unit:"each",status:"needed",note:"",customerPriceCents:90000,costCents:50000}]});
    const row=await cur();assert.equal(row.instructions,"Shut off water first");assert.equal(row.crewNames[0],"WO fixture admin");assert.equal(row.tasksTotal,2);
    const stale=await db("workOrders").where({id:woId}).first("version");
    await assert.rejects(mutateWorkOrder(db,identity(),enabled,{workspaceId,workOrderId:woId,submissionId:randomUUID(),expectedVersion:stale.version-1,action:"edit",title:"Stale"}),WorkOrderConflictError);
    await assert.rejects(change({action:"edit",title:"No rights"},"field"),AuthorizationAccessError);
  });
  await check("issue, Field progress starts work, price retention, changed-after-issue flag",async()=>{
    await assert.rejects(change({action:"status",to:"in-progress"}),WorkOrderLifecycleError);
    await assert.rejects(change({action:"status",to:"issued"},"field"),AuthorizationAccessError);
    await change({action:"status",to:"issued"},"office");
    assert.equal((await cur("field")).status,"issued");
    await change({action:"edit",instructions:"Updated after issue"});
    assert.equal((await db("workOrders").where({id:woId}).first("changedAfterIssueAt")).changedAfterIssueAt!==null,true);
    const task=await db("workOrderTasks").where({workOrderId:woId,position:0}).first("id");
    await assert.rejects(change({action:"edit",title:"Crew edit"},"field"),AuthorizationAccessError);
    await change({action:"task-toggle",taskId:task.id,done:true},"field");
    const started=await cur("field");assert.equal(started.status,"in-progress");assert.equal(started.tasksDone,1);
    await assert.rejects(change({action:"materials",materials:[]},"field"),AuthorizationAccessError);
    await change({action:"materials",materials:[{id:(await db("workOrderMaterials").where({workOrderId:woId}).first("id")).id,name:"Heater",quantity:2,unit:"each",status:"ordered",customerPriceCents:1,costCents:1}]},"office");
    const m=await db("workOrderMaterials").where({workOrderId:woId}).first();
    assert.equal(m.customerPriceCents,1);assert.equal(m.costCents,50000);
  });
  await check("completion rules, signature, freeze, reopen, archive and cancel reason",async()=>{
    const open=await db("workOrderTasks").where({workOrderId:woId}).update({required:true,done:false,doneBy:null,doneAt:null}).then(()=>0);void open;
    await assert.rejects(change({action:"complete",summary:"Finished"},"field"),WorkOrderLifecycleError);
    await assert.rejects(change({action:"complete",summary:"Finished",overrideReason:"Skip"},"field"),WorkOrderLifecycleError);
    await assert.rejects(change({action:"complete",summary:"Finished"},"owner"),WorkOrderLifecycleError);
    await change({action:"complete",summary:"Finished",overrideReason:"Customer waived",signerName:"Pat Doe",signatureImage:"data:image/png;base64,iVBORw0KGgo="},"office");
    const done=await cur();assert.equal(done.status,"completed");assert.notEqual(done.completedAt,null);
    const stored=await db("workOrderCompletions").where({workOrderId:woId}).first("summary","signatureImage","signerName");assert.equal(stored.summary,"Finished");assert.equal(stored.signerName,"Pat Doe");assert.ok(stored.signatureImage.startsWith("data:image/png;base64,"));
    await assert.rejects(change({action:"edit",title:"After close"}),WorkOrderLifecycleError);
    await assert.rejects(change({action:"archive",archived:true},"office"),AuthorizationAccessError);
    await change({action:"archive",archived:true},"admin");
    await assert.rejects(change({action:"reopen",reason:"Redo"},"office"),WorkOrderLifecycleError);
    await change({action:"archive",archived:false},"admin");
    await change({action:"reopen",reason:"Redo"},"office");
    assert.equal((await cur()).status,"in-progress");assert.equal(await db("workOrderCompletions").where({workOrderId:woId}).first(),undefined);
    await assert.rejects(change({action:"status",to:"canceled"},"office"),Error);
    await change({action:"status",to:"canceled",reason:"Customer moved"},"office");
    const canceled=await cur();assert.equal(canceled.cancellationReason,"Customer moved");
    await change({action:"reopen",reason:"Back on"},"office");
    const back=await cur();assert.equal(back.status,"draft");assert.equal(back.issuedAt,null);assert.equal(back.cancellationReason,null);
    const history=await db("workOrderActivity").where({workOrderId:woId}).orderBy("createdAt").select("type");
    assert.ok(history.length>=14);assert.equal(history[0].type,"created");
  });
  await check("duplicate copies content, resets tasks and materials, same job only",async()=>{
    await change({action:"status",to:"issued",confirmed:true},"office");
    const copy=await createWorkOrder(db,identity("office"),enabled,{workspaceId,submissionId:randomUUID(),jobId,title:"Copy",source:{kind:"duplicate",workOrderId:woId}});
    const row=await cur("office",copy.workOrderId);assert.equal(row.instructions,"Updated after issue");assert.equal(row.tasksTotal,2);assert.equal(row.tasksDone,0);assert.equal(row.status,"draft");
    assert.equal((await db("workOrderMaterials").where({workOrderId:copy.workOrderId}).first()).status,"needed");
    await assert.rejects(createWorkOrder(db,identity("office"),enabled,{workspaceId,submissionId:randomUUID(),jobId:otherJobId,title:"Cross",source:{kind:"duplicate",workOrderId:woId}}),WorkOrderValidationError);
  });
  await check("detail read returns children and hides prices and costs from roles without those permissions",async()=>{
    await db("workOrderCompletions").insert({id:randomUUID(),workspaceId,workOrderId:woId,summary:"Finished",followUp:"none",followUpNote:"",completedBy:users.office,completedByName:"WO fixture office",completedAt:new Date()});
    await db("workOrders").where({id:woId}).update({status:"in-progress",completedAt:null});
    const noted=await mutateWorkOrder(db,identity("field"),enabled,{workspaceId,workOrderId:woId,submissionId:randomUUID(),expectedVersion:1,action:"note",body:"Gate was locked"});
    assert.ok(noted.version>1);
    await assert.rejects(mutateWorkOrder(db,identity("field"),enabled,{workspaceId,workOrderId:ids.draft,submissionId:randomUUID(),expectedVersion:1,action:"note",body:"x"}),Error);
    const owner=await readWorkOrderDetail(db,identity("owner"),enabled,woId);
    assert.deepEqual(owner.notes.map(n=>n.body),["Gate was locked"]);assert.ok(owner.activity.every(a=>a.type!=="note"));
    assert.equal(owner.access.costs,true);assert.ok(owner.materials.some(m=>m.customerPriceCents!==null));assert.ok(owner.activity.length>0);assert.equal(owner.completion?.summary,"Finished");
    const office=await readWorkOrderDetail(db,identity("office"),enabled,woId);
    assert.equal(office.access.prices,true);assert.equal(office.access.costs,false);assert.ok(office.materials.every(m=>m.costCents===null));
    assert.equal(office.contact.address,"12 Fiction Lane");
    await assert.rejects(readWorkOrderDetail(db,identity("stranger"),enabled,woId),AuthorizationAccessError);
  });
  await check("chat CSV export: scoped, audited, count-checked, no sensitive columns",async()=>{
    const query={workspaceId,sort:"number"};
    const total=(await list("owner",query)).total;
    const columns=["number","title","status"];
    const csv=await exportWorkOrders(db,identity("owner"),enabled,{query,columns,expectedCount:total});
    assert.ok(csv.includes("Replace valve"));
    assert.equal((await db("workOrderExportAudit").where({workspaceId}).first()).rowCount,total);
    await assert.rejects(exportWorkOrders(db,identity("owner"),enabled,{query,columns,expectedCount:total+1}),WorkOrderConflictError);
    await assert.rejects(exportWorkOrders(db,identity("other"),enabled,{query,columns,expectedCount:total}),AuthorizationAccessError);
  });
  await check("notifications: issue, reschedule, post-issue change and cancel reach the right people only",async()=>{
    const made=await createWorkOrder(db,identity("office"),enabled,{workspaceId,submissionId:randomUUID(),jobId,title:"Notify me",assigneeId:users.field});
    const wid=made.workOrderId;
    const mine=async(role:string)=>(await readNotifications(db,identity(role),enabled)).items.filter(n=>n.kind==="work_order"&&n.workOrderId===wid);
    assert.equal((await mine("field")).length,0);
    await change({action:"status",to:"issued"},"office",wid);
    assert.deepEqual((await mine("field")).map(n=>n.kind==="work_order"&&n.event),["issued"]);
    assert.equal((await mine("office")).length,0);
    await change({action:"schedule",scheduledDate:"2030-01-02",arrivalWindow:"09:00-11:00"},"office",wid);
    await change({action:"edit",instructions:"Bring the long ladder"},"office",wid);
    const events=(await mine("field")).map(n=>n.kind==="work_order"&&n.event).sort();
    assert.deepEqual(events,["changed","issued","rescheduled"]);
    assert.ok(!JSON.stringify(await mine("field")).includes("long ladder"));
    assert.equal((await mine("stranger")).length,0);
    assert.equal((await mine("other")).length,0);
    const first=(await mine("field"))[0];
    await assert.rejects(markNotificationRead(db,identity("stranger"),enabled,first.id),AuthorizationAccessError);
    await markNotificationRead(db,identity("field"),enabled,first.id);
    assert.ok((await mine("field")).find(n=>n.id===first.id)?.read);
    await change({action:"status",to:"canceled",reason:"Customer canceled"},"office",wid);
    assert.ok((await mine("owner")).some(n=>n.kind==="work_order"&&n.event==="canceled"));
    assert.ok((await mine("field")).some(n=>n.kind==="work_order"&&n.event==="canceled"));
    assert.ok(!(await mine("office")).length);
  });
  await check("direct assignment grants a field user their own work orders without job membership",async()=>{
    assert.equal((await list("stranger")).total,0);
    await db("workOrderCrew").insert({workspaceId,workOrderId:ids.otherJob,userId:users.stranger});
    assert.deepEqual((await list("stranger")).rows.map(r=>r.id),[ids.otherJob]);
    await readWorkOrderRecord(db,identity("stranger"),enabled,ids.otherJob);
    await assert.rejects(readWorkOrderRecord(db,identity("stranger"),enabled,ids.issued),AuthorizationAccessError);
    await db("workOrderCrew").where({workOrderId:ids.otherJob,userId:users.stranger}).delete();
    await db("workOrders").where({id:ids.progress}).update({primaryAssigneeId:users.stranger});
    assert.deepEqual((await list("stranger")).rows.map(r=>r.id),[ids.progress]);
    await db("workOrders").where({id:ids.progress}).update({primaryAssigneeId:null});
    await db("workOrders").where({id:ids.draft}).update({primaryAssigneeId:users.stranger});
    assert.equal((await list("stranger")).total,0);
    await db("workOrders").where({id:ids.draft}).update({primaryAssigneeId:users.office});
  });
  await check("delete: drafts only, audited, permission-gated; sign-off setting, contact and business phone",async()=>{
    const make=async(title:string)=>(await createWorkOrder(db,identity("office"),enabled,{workspaceId,submissionId:randomUUID(),jobId,title,assigneeId:users.field})).workOrderId;
    const act=(id:string,payload:Record<string,unknown>,role="admin")=>readWorkOrderRecord(db,identity("owner"),enabled,id).then(r=>mutateWorkOrder(db,identity(role),enabled,{workspaceId,submissionId:randomUUID(),workOrderId:id,expectedVersion:r.version,...payload}));
    const draft=await make("Delete me");
    await assert.rejects(act(draft,{action:"delete"},"office"),AuthorizationAccessError);
    await assert.rejects(act(draft,{action:"delete"},"field"),AuthorizationAccessError);
    await assert.rejects(act(ids.issued,{action:"delete"}),WorkOrderLifecycleError);
    await act(draft,{action:"delete"});
    assert.equal(await db("workOrders").where({id:draft}).first(),undefined);
    assert.equal((await db("workOrderDeleteAudit").where({workspaceId,title:"Delete me"})).length,1);
    await assert.rejects(readWorkOrderRecord(db,identity("owner"),enabled,draft),AuthorizationAccessError);
    const wo=await make("Needs signature");
    await act(wo,{action:"status",to:"issued",confirmed:true});await act(wo,{action:"status",to:"in-progress",confirmed:true});
    await db("workspaces").where({id:workspaceId}).update({workOrderSignoffRequired:true,businessPhone:"(555) 010-2000"});
    await db("customers").where({id:customerId}).update({phone:"555-0100"});
    const detail=await readWorkOrderDetail(db,identity("owner"),enabled,wo);
    assert.equal(detail.access.signoffRequired,true);assert.equal(detail.businessPhone,"(555) 010-2000");assert.equal(detail.contact.phone,"555-0100");
    await assert.rejects(act(wo,{action:"complete",summary:"Done"}),WorkOrderLifecycleError);
    await act(wo,{action:"complete",summary:"Done",signerName:"Pat Doe",signatureImage:"data:image/png;base64,iVBORw0KGgo="});
    await db("workspaces").where({id:workspaceId}).update({workOrderSignoffRequired:false});
    const nosig=await make("No signature needed");
    await act(nosig,{action:"status",to:"issued",confirmed:true});await act(nosig,{action:"status",to:"in-progress",confirmed:true});
    await act(nosig,{action:"complete",summary:"Done"});
    const first=await readWorkOrders(db,identity("owner"),enabled,{workspaceId});assert.equal(first.canExport,true);
    assert.equal((await readWorkOrders(db,identity("office"),enabled,{workspaceId})).canExport,false);
  });
  console.log(`PASS ${passed} Work orders foundation database journeys`);
}finally{
  await db("workOrders").whereIn("workspaceId",[workspaceId,otherWorkspace]).delete();
  await db("jobs").whereIn("workspaceId",[workspaceId,otherWorkspace]).delete();
  await db("users").whereIn("id",Object.values(users)).delete();
  await db.destroy();
}
