import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {permissionIds,type CreateJobInput} from "@salesmora/contracts";
import {createDatabase} from "../database";
import {initializeWorkspacePolicy,AuthorizationAccessError} from "../authorization/store";
import {createJob,readJobs,readJob,mutateJob,JobConflictError,JobValidationError} from "./store";
import {mutateCustomer,CustomerValidationError} from "../customers/store";
import {down} from "../migrations/202610190001_jobs_foundation";
const env=fileURLToPath(new URL("../../../../.env.local",import.meta.url));
if(existsSync(env))process.loadEnvFile(env);
const connection=process.env.TEST_DATABASE_URL;
if(!connection||!new URL(connection).pathname.endsWith("_test")||connection===process.env.DATABASE_URL||!["localhost","127.0.0.1"].includes(new URL(connection).hostname))throw Error("Use the isolated local test database.");
const db=createDatabase(connection),workspaceId=randomUUID(),otherWorkspace=randomUUID(),customerId=randomUUID();
const users=Object.fromEntries(["owner","admin","office","field","teammate","other"].map(role=>[role,randomUUID()]));
const enabled=[...permissionIds];
const identity=(role="owner")=>({userId:users[role],workspaceId:role==="other"?otherWorkspace:workspaceId});
let passed=0,jobId:string;
async function check(label:string,work:()=>Promise<void>){await work();console.log("PASS "+label);passed++;}
async function current(){return (await readJob(db,identity(),enabled,jobId)).job;}
async function change(extra:Record<string,unknown>,role="owner"){
  const row=await current();return mutateJob(db,identity(role),enabled,{workspaceId,jobId,submissionId:randomUUID(),expectedVersion:row.version,...extra});
}
try{
  await db.transaction(async trx=>{
    const now=new Date();
    await trx("users").insert(Object.entries(users).map(([role,id])=>({id,name:`Job fixture ${role}`,email:`${id}@example.test`,createdAt:now,updatedAt:now,termsVersion:"fixture",termsAcceptedAt:now})));
    for(const [id,owner] of [[workspaceId,users.owner],[otherWorkspace,users.other]]){
      await trx("workspaces").insert({id,ownerId:owner,businessName:"Jobs foundation fixture",businessType:"plumbing",postalCode:"",serviceRange:"",timezone:"America/New_York"});
      await trx("workspaceMemberships").insert({workspaceId:id,userId:owner,role:"owner"});
      await initializeWorkspacePolicy(trx,{workspaceId:id,userId:owner});
    }
    await trx("workspaceMemberships").insert(["admin","office","field","teammate"].map(role=>({workspaceId,userId:users[role],role:role==="teammate"?"field":role})));
    await trx("customers").insert({id:customerId,workspaceId,name:"Fictional Job Customer",type:"person",companyName:"",email:"",phone:"",location:"",internalNotes:""});
  });
  const input:CreateJobInput={workspaceId,submissionId:randomUUID(),customerId,title:"Fictional plumbing repair",primaryOwnerId:users.field,teamUserIds:[users.teammate]};
  await check("creation, stable job numbers, explicit assignment and actor-bound retries",async()=>{
    const first=await createJob(db,identity(),enabled,input);jobId=first.jobId;
    assert.deepEqual(await createJob(db,identity(),enabled,input),first);
    assert.equal((await current()).number,"J-0001");
    await assert.rejects(createJob(db,identity(),enabled,{...input,title:"Changed replay"}),JobConflictError);
    await assert.rejects(createJob(db,identity("field"),enabled,{...input,submissionId:randomUUID()}),AuthorizationAccessError);
    await assert.rejects(createJob(db,identity(),enabled,{...input,submissionId:randomUUID(),primaryOwnerId:users.other}),JobValidationError);
  });
  await check("SQL-scoped role reads and counts; team assignment; cross-workspace denial",async()=>{
    for(const role of ["owner","admin","office","field","teammate"])assert.equal((await readJobs(db,identity(role),enabled,{workspaceId})).total,1);
    assert.equal((await readJobs(db,identity("other"),enabled,{workspaceId:otherWorkspace})).total,0);
    await assert.rejects(readJob(db,identity("other"),enabled,jobId),AuthorizationAccessError);
    await assert.rejects(readJobs(db,identity(),enabled,{workspaceId:otherWorkspace}),AuthorizationAccessError);
    assert.equal((await readJobs(db,identity(),enabled,{workspaceId,q:"%_"})).total,0);
  });
  await check("workspace-local schedule/deadline, transitions and exact date strings across DST",async()=>{
    await change({action:"deadline",completionDeadline:"2026-11-02"});
    await change({action:"schedule",scheduledDate:"2026-11-01",arrivalWindow:"09:00-11:00"});
    let row=await current();assert.equal(row.status,"scheduled");assert.equal(row.scheduledDate,"2026-11-01");assert.equal(row.completionDeadline,"2026-11-02");
    await change({action:"schedule",scheduledDate:null,arrivalWindow:null});row=await current();assert.equal(row.status,"needs-scheduling");assert.equal(row.completionDeadline,"2026-11-02");
  });
  await check("Field grant plus primary ownership, revoked grants and team-only restriction",async()=>{
    await change({action:"schedule",scheduledDate:"2026-10-20",arrivalWindow:null},"field");
    await db("workspaceRolePolicies").where({workspaceId,role:"field",permission:"jobs.schedule.update"}).delete();
    await assert.rejects(change({action:"schedule",scheduledDate:"2026-10-21",arrivalWindow:null},"field"),AuthorizationAccessError);
    await db("workspaceRolePolicies").insert({workspaceId,role:"field",permission:"jobs.schedule.update",scope:"assigned"});
    await change({action:"schedule",scheduledDate:"2026-10-20",arrivalWindow:null},"field");
    await assert.rejects(change({action:"schedule",scheduledDate:"2026-10-21",arrivalWindow:null},"teammate"),AuthorizationAccessError);
    await db("workspaceRolePolicies").where({workspaceId,role:"field",permission:"jobs.schedule.update"}).delete();
    await assert.rejects(change({action:"deadline",completionDeadline:null},"field"),AuthorizationAccessError);
  });
  await check("concurrent mutations serialize; stale edits and forged retries cannot overwrite",async()=>{
    const row=await current(),base={workspaceId,jobId,expectedVersion:row.version,action:"deadline"};
    const results=await Promise.allSettled(["2026-10-25","2026-10-26"].map(completionDeadline=>mutateJob(db,identity(),enabled,{...base,submissionId:randomUUID(),completionDeadline})));
    assert.equal(results.filter(r=>r.status==="fulfilled").length,1);
    assert(results.some(r=>r.status==="rejected"&&r.reason instanceof JobConflictError));
  });
  await check("immutable append-only notes retry once and retain actor/source",async()=>{
    const row=await current(),note={workspaceId,jobId,expectedVersion:1,submissionId:randomUUID(),action:"note",body:"Fictional progress note"};
    await mutateJob(db,identity("field"),enabled,note,"assistant-confirmed");await mutateJob(db,identity("field"),enabled,note,"assistant-confirmed");
    const details=await readJob(db,identity(),enabled,jobId);
    assert.equal(details.activity.filter(e=>e.type==="note").length,1);assert.equal(details.job.version,row.version+1);
    assert(details.activity.some(e=>e.type==="note"&&e.source==="assistant-confirmed"));
    await assert.rejects(mutateJob(db,identity("teammate"),enabled,note),JobConflictError);
  });
  await check("Waiting/close confirmations, completed retry, reopen deadline review and retained history",async()=>{
    await change({action:"status",to:"waiting",waitingReason:"materials"},"field");
    await change({action:"status",to:"in-progress"},"field");
    await assert.rejects(change({action:"status",to:"completed"},"field"));
    const row=await current(),complete={workspaceId,jobId,submissionId:randomUUID(),expectedVersion:row.version,action:"status",to:"completed",confirmed:true};
    await mutateJob(db,identity("field"),enabled,complete);await mutateJob(db,identity("field"),enabled,complete);
    assert.equal((await readJobs(db,identity(),enabled,{workspaceId})).total,0);
    assert.equal((await readJobs(db,identity(),enabled,{workspaceId,closed:true})).total,1);
    await assert.rejects(change({action:"note",body:"closed"},"field"),JobValidationError);
    await assert.rejects(change({action:"status",to:"in-progress",confirmed:true,reopenDeadline:null},"field"),AuthorizationAccessError);
    await assert.rejects(change({action:"status",to:"in-progress",confirmed:true}));
    await change({action:"status",to:"in-progress",confirmed:true,reopenDeadline:null});
    const details=await readJob(db,identity(),enabled,jobId);assert.equal(details.job.completionDeadline,null);
    assert(details.activity.some(e=>e.type==="status"&&e.changes.to==="completed"));
  });
  await check("reassignment ends previous job-based access without rewriting history",async()=>{
    await change({action:"assign",primaryOwnerId:users.office,teamUserIds:[users.teammate]});
    await assert.rejects(readJob(db,identity("field"),enabled,jobId),AuthorizationAccessError);
    assert.equal((await readJobs(db,identity("field"),enabled,{workspaceId})).total,0);
    assert.equal((await readJob(db,identity("teammate"),enabled,jobId)).job.primaryOwnerId,users.office);
    assert((await readJob(db,identity(),enabled,jobId)).activity.some(e=>e.type==="assign"));
  });
  await check("active jobs block customer deletion; closed jobs keep history after customer deletion",async()=>{
    const customer=await db("customers").where({id:customerId}).first();
    const deletion={workspaceId,customerId,submissionId:randomUUID(),expectedVersion:customer.version,action:"delete",typedConfirmation:"CU-0001",unlinkOpenLeads:true};
    await assert.rejects(mutateCustomer(db,identity(),enabled,deletion),CustomerValidationError);
    await change({action:"status",to:"canceled",cancellationReason:"duplicate",confirmed:true});
    await mutateCustomer(db,identity(),enabled,deletion);
    const row=await current();assert.equal(row.customerId,null);assert.equal(row.customerName,"Fictional Job Customer");assert.equal(row.status,"canceled");
    await assert.rejects(db.transaction(down),/Retained job history/);
  });
  await check("tenant-safe source links, once-per-lead creation and retained source snapshots",async()=>{
    const customer=randomUUID(),foreignCustomer=randomUUID(),leadId=randomUUID();
    await db("customers").insert([{id:customer,workspaceId,name:"Source fixture",type:"person",companyName:"",email:"",phone:"",location:"",internalNotes:""},{id:foreignCustomer,workspaceId:otherWorkspace,name:"Other workspace fixture",type:"person",companyName:"",email:"",phone:"",location:"",internalNotes:""}]);
    await assert.rejects(createJob(db,identity(),enabled,{...input,submissionId:randomUUID(),customerId:foreignCustomer}),AuthorizationAccessError);
    await db("leads").insert({id:leadId,workspaceId,customerId:customer,createdBy:users.owner,submissionId:randomUUID(),submissionHash:"fixture",name:"Source fixture",service:"Repair",email:"",phone:"",address:"",details:"",notes:"",source:"other",stage:"won"});
    const source={...input,submissionId:randomUUID(),customerId:customer,sourceLeadId:leadId};
    const created=await createJob(db,identity(),enabled,source);
    await assert.rejects(createJob(db,identity(),enabled,{...source,submissionId:randomUUID()}),JobConflictError);
    await assert.rejects(db.transaction(async trx=>{await trx("jobs").where({id:created.jobId}).update({customerId:foreignCustomer});}));
    await db("leads").where({id:leadId,workspaceId}).delete();
    const retained=await db("jobs").where({id:created.jobId}).first();assert.equal(retained.sourceLeadId,null);assert.match(retained.sourceLeadNumber,/^LD-/);
  });
  console.log(`PASS ${passed} Jobs foundation database journeys`);
}finally{
  await db("users").whereIn("id",Object.values(users)).delete();
  await db.destroy();
}
