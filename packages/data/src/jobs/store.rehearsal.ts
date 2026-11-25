import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {customerQuerySchema,permissionIds,type CreateJobInput,type JobLifecycleQuery,type JobCompletionQuery} from "@salesmora/contracts";
import {createDatabase} from "../database";
import {initializeWorkspacePolicy,AuthorizationAccessError,withWorkspaceAuthorization} from "../authorization/store";
import {createJob,readJobs,readJob,mutateJob,JobConflictError,JobValidationError} from "./store";
import {readJobWorkloadReportInTransaction} from "../reports/jobs";
import {readTeamJobsReportInTransaction} from "../reports/team-jobs";
import {readTeamReportWithAuthorityInTransaction,initialTeamReportWithAuthorityInTransaction} from "../reports/team-read";
import {readJobLifecycleReportInTransaction} from "../reports/job-lifecycle";
import {readJobCompletionReportInTransaction} from "../reports/job-completion";
import {readJobReportWithAuthorityInTransaction,initialJobReportWithAuthorityInTransaction} from "../reports/job-read";
import {selectedJobLifecycleEvents} from "../reports/job-events";
import {jobReportContext} from "../reports/job-context";
import {prepareJobReportCSVProjectionInTransaction} from "../reports/job-export-projection";
import {prepareTeamReportCSVProjectionInTransaction} from "../reports/team-export-projection";
import {readBusinessOverviewInTransaction} from "../reports/business-overview";
import {readBusinessOverviewWithAuthorityInTransaction,initialBusinessOverviewWithAuthorityInTransaction} from "../reports/business-overview-read";
import {readLeadReportInTransaction} from "../reports/leads";
import {readEstimateDecisionsReportInTransaction} from "../reports/estimate-decisions";
import {readEstimateCurrentReportInTransaction} from "../reports/estimate-current";
import {readCalendarScheduledReportInTransaction} from "../reports/calendar-scheduled";
import {addCalendarDays} from "@salesmora/domain";
import {readCustomers,mutateCustomer,CustomerValidationError} from "../customers/store";
import {migrateFreshBaseline} from "../baseline-runner";
import {down as rollbackBaseline} from "../baseline-migrations/202611150001_fresh_baseline";
const env=fileURLToPath(new URL("../../../../.env.local",import.meta.url));
if(existsSync(env))process.loadEnvFile(env);
const connection=process.env.TEST_DATABASE_URL;
if(!connection||!new URL(connection).pathname.endsWith("_test")||connection===process.env.DATABASE_URL||!["localhost","127.0.0.1"].includes(new URL(connection).hostname))throw Error("Use the isolated local test database.");
const name=`jobs_rehearsal_${randomUUID().replaceAll("-","")}_test`;
const url=new URL(connection);url.pathname=`/${name}`;
const owner=createDatabase(connection),db=createDatabase(url.toString()),workspaceId=randomUUID(),otherWorkspace=randomUUID(),customerId=randomUUID();
let created=false;
const users=Object.fromEntries(["owner","admin","office","field","teammate","other"].map(role=>[role,randomUUID()]));
const enabled=[...permissionIds];
const identity=(role="owner")=>({userId:users[role],workspaceId:role==="other"?otherWorkspace:workspaceId});
let passed=0,jobId:string;
async function check(label:string,work:()=>Promise<void>){await work();console.log("PASS "+label);passed++;}
async function current(){return (await readJob(db,identity(),enabled,jobId)).job;}
async function report(
  userId:string,
  selectedWorkspaceId:string,
  query:Parameters<typeof readJobWorkloadReportInTransaction>[2],
  permissions=enabled,
){
  return withWorkspaceAuthorization(db,{userId,workspaceId:selectedWorkspaceId},permissions,false,
    (trx,context)=>readJobWorkloadReportInTransaction(trx,context,query));
}
async function lifecycleReport(
  userId:string,
  selectedWorkspaceId:string,
  query:JobLifecycleQuery,
  permissions=enabled,
){
  return withWorkspaceAuthorization(db,{userId,workspaceId:selectedWorkspaceId},permissions,false,
    (trx,context)=>readJobLifecycleReportInTransaction(trx,context,query));
}
async function completionReport(
  userId:string,
  selectedWorkspaceId:string,
  query:JobCompletionQuery,
  permissions=enabled,
){
  return withWorkspaceAuthorization(db,{userId,workspaceId:selectedWorkspaceId},permissions,false,
    (trx,context)=>readJobCompletionReportInTransaction(trx,context,query));
}
async function change(extra:Record<string,unknown>,role="owner"){
  const row=await current();return mutateJob(db,identity(role),enabled,{workspaceId,jobId,submissionId:randomUUID(),expectedVersion:row.version,...extra});
}
async function teamReport(userId:string,selectedWorkspaceId:string,
  selected:Parameters<typeof readTeamJobsReportInTransaction>[2]["selected"]={kind:"queue",queue:"active"},
  permissions=enabled,page=1,members:string[]=[]){
  return withWorkspaceAuthorization(db,{userId,workspaceId:selectedWorkspaceId},permissions,false,
    (trx,context)=>readTeamJobsReportInTransaction(trx,context,{
      workspaceId:selectedWorkspaceId,view:"team-jobs",selected,page,pageSize:25,filters:{members},
    }));
}
try{
  await owner.raw("CREATE DATABASE ??",[name]);created=true;
  await migrateFreshBaseline(db);
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
  const input:CreateJobInput={postalCode:'10001',workspaceId,submissionId:randomUUID(),customerId,title:"Fictional plumbing repair",primaryOwnerId:users.field,teamUserIds:[users.teammate]};
  await check("creation, stable job numbers, explicit assignment and actor-bound retries",async()=>{
    const first=await createJob(db,identity(),enabled,input);jobId=first.jobId;
    assert.deepEqual(await createJob(db,identity(),enabled,input),first);
    assert.equal((await current()).number,"J-0001");
    await assert.rejects(createJob(db,identity(),enabled,{...input,title:"Changed replay",postalCode:'10001'}),JobConflictError);
    await assert.rejects(createJob(db,identity("field"),enabled,{...input,submissionId:randomUUID(),postalCode:'10001'}),AuthorizationAccessError);
    await assert.rejects(createJob(db,identity(),enabled,{...input,submissionId:randomUUID(),primaryOwnerId:users.other,postalCode:'10001'}),JobValidationError);
  });
  await check("SQL-scoped role reads and counts; team assignment; cross-workspace denial",async()=>{
    for(const role of ["owner","admin","office","field","teammate"])assert.equal((await readJobs(db,identity(role),enabled,{workspaceId})).total,1);
    assert.equal((await readJobs(db,identity("other"),enabled,{workspaceId:otherWorkspace})).total,0);
    await assert.rejects(readJob(db,identity("other"),enabled,jobId),AuthorizationAccessError);
    await assert.rejects(readJobs(db,identity(),enabled,{workspaceId:otherWorkspace}),AuthorizationAccessError);
    assert.equal((await readJobs(db,identity(),enabled,{workspaceId,q:"%_"})).total,0);
  });
  await check("customer overview counts active customers independently of search and respects Jobs access",async()=>{
    const result=await readCustomers(db,identity(),enabled,customerQuerySchema.parse({workspaceId,q:"No matching customers"}));
    assert.equal(result.total,0);
    assert.equal(result.totals.withActiveJobs,1);
    const withoutJobs=await readCustomers(db,identity(),enabled.filter(permission=>permission!=="jobs.read"),customerQuerySchema.parse({workspaceId}));
    assert.equal(withoutJobs.totals.withActiveJobs,undefined);
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
    assert.equal((await readCustomers(db,identity(),enabled,customerQuerySchema.parse({workspaceId}))).totals.withActiveJobs,0);
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
    await assert.rejects(rollbackBaseline(),/forward-only/);
    assert.equal((await current()).customerName,"Fictional Job Customer");
  });
  await check("tenant-safe source links, once-per-lead creation and retained source snapshots",async()=>{
    const customer=randomUUID(),foreignCustomer=randomUUID(),leadId=randomUUID();
    await db("customers").insert([{id:customer,workspaceId,name:"Source fixture",type:"person",companyName:"",email:"",phone:"",location:"",internalNotes:""},{id:foreignCustomer,workspaceId:otherWorkspace,name:"Other workspace fixture",type:"person",companyName:"",email:"",phone:"",location:"",internalNotes:""}]);
    await assert.rejects(createJob(db,identity(),enabled,{...input,submissionId:randomUUID(),customerId:foreignCustomer,postalCode:'10001'}),AuthorizationAccessError);
    await db("leads").insert({id:leadId,workspaceId,customerId:customer,createdBy:users.owner,submissionId:randomUUID(),submissionHash:"fixture",name:"Source fixture",service:"Repair",email:"",phone:"",address:"",details:"",notes:"",source:"other",stage:"won"});
    const source={...input,submissionId:randomUUID(),customerId:customer,sourceLeadId:leadId};
    const created=await createJob(db,identity(),enabled,source);
    await assert.rejects(createJob(db,identity(),enabled,{...source,submissionId:randomUUID(),postalCode:'10001'}),JobConflictError);
    await assert.rejects(db.transaction(async trx=>{await trx("jobs").where({id:created.jobId}).update({customerId:foreignCustomer});}));
    await db("leads").where({id:leadId,workspaceId}).delete();
    const retained=await db("jobs").where({id:created.jobId}).first();assert.equal(retained.sourceLeadId,null);assert.match(retained.sourceLeadNumber,/^LD-/);
  });
  await check("current workload reconciles deadlines, groups, filters and assigned Job scope",async()=>{
    const now=await db.raw(`select to_char(current_timestamp AT TIME ZONE 'America/New_York','YYYY-MM-DD') as today`);
    const today=String(now.rows[0].today);
    const shift=(days:number)=>{
      const date=new Date(`${today}T12:00:00Z`);
      date.setUTCDate(date.getUTCDate()+days);
      return date.toISOString().slice(0,10);
    };
    const reportIds=Array.from({length:7},()=>randomUUID());
    await db("workspaceMemberships").insert([
      {workspaceId:otherWorkspace,userId:users.office,role:"office"},
      {workspaceId:otherWorkspace,userId:users.field,role:"field"},
    ]);
    const fixture=[
      {status:"in-progress",completionDeadline:shift(-1),scheduledDate:shift(-2),primaryOwnerId:users.office,service:"Repair",waitingReason:null},
      {status:"scheduled",completionDeadline:today,scheduledDate:today,primaryOwnerId:users.office,service:"Repair",waitingReason:null},
      {status:"waiting",completionDeadline:shift(7),scheduledDate:shift(-2),primaryOwnerId:users.office,service:"Installation",waitingReason:"materials"},
      {status:"needs-scheduling",completionDeadline:null,scheduledDate:null,primaryOwnerId:null,service:"",waitingReason:null},
      {status:"in-progress",completionDeadline:shift(8),scheduledDate:shift(-1),primaryOwnerId:users.office,service:"Installation",waitingReason:null},
      {status:"completed",completionDeadline:shift(-1),scheduledDate:shift(-3),primaryOwnerId:users.office,service:"Repair",waitingReason:null},
      {status:"canceled",completionDeadline:shift(-2),scheduledDate:null,primaryOwnerId:null,service:"",waitingReason:null},
    ];
    await db("jobs").insert(fixture.map((row,index)=>({
      id:reportIds[index],workspaceId:otherWorkspace,customerId:null,customerName:"Workload fixture",
      sourceLeadId:null,sourceLeadNumber:null,title:`Workload ${index}`,service:row.service,location:"",
      description:"",status:row.status,primaryOwnerId:row.primaryOwnerId,createdBy:users.other,
      scheduledDate:row.scheduledDate,arrivalWindow:null,completionDeadline:row.completionDeadline,
      waitingReason:row.waitingReason,createdAt:new Date(),updatedAt:new Date(),lastActivityAt:new Date(),
    })));
    await db("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.field});
    const baseQuery={workspaceId:otherWorkspace,view:"workload" as const,
      filters:{statuses:[],owners:[],services:[]},selection:{kind:"metric" as const,metric:"active" as const},
      page:1,pageSize:25 as const};
    try{
      const result=await report(users.other,otherWorkspace,baseQuery);
      assert.deepEqual(result.counts,{active:5,overdue:1,dueSoon:2,noDeadline:1,waiting:1,unassigned:1});
      assert.deepEqual(result.groups.status.map(group=>group.count),[1,1,2,1]);
      assert.equal(result.groups.owner.find(group=>group.id==="unassigned")?.count,1);
      assert.equal(result.groups.service.find(group=>group.id==="service:Repair")?.count,2);
      assert.equal(result.groups.waitingReason.find(group=>group.id==="materials")?.count,1);
      const dueSoon=await report(users.other,otherWorkspace,{...baseQuery,
        selection:{kind:"metric",metric:"dueSoon"}});
      assert.deepEqual(new Set(dueSoon.rows.map(row=>row.id)),new Set(reportIds.slice(1,3)));
      const filtered=await report(users.other,otherWorkspace,{...baseQuery,
        filters:{statuses:["waiting"],owners:[`member:${users.office}`],services:["service:Installation"]}});
      assert.equal(filtered.counts.active,1);
      assert.equal(filtered.rows[0]?.id,reportIds[2]);
      const assigned=await report(users.field,otherWorkspace,baseQuery);
      assert.equal(assigned.counts.active,1);
      assert.equal(assigned.rows[0]?.id,reportIds[0]);
      await check("Jobs CSV workload tables and unpaged evidence respect narrowed export scope",async()=>{
        await withWorkspaceAuthorization(db,{userId:users.other,workspaceId:otherWorkspace},enabled,false,async(trx,context)=>{
          context.policy.grants.push({role:"owner",permission:"reports.export",scope:"enabled"});
          const query={workspaceId:otherWorkspace,view:baseQuery.view,filters:baseQuery.filters,selection:baseQuery.selection};
          const collect=async(projection:Awaited<ReturnType<typeof prepareJobReportCSVProjectionInTransaction>>)=>{
            const rows=[];for await(const row of projection.rows())rows.push(row);return rows;
          };
          for(const dataset of ["summary","status","owner","service","waiting-reasons","evidence"] as const){
            const projection=await prepareJobReportCSVProjectionInTransaction(trx,context,{query,dataset});
            const rows=await collect(projection);
            assert.equal(rows.length,projection.count);
            assert(rows.every(row=>row.length===projection.columns.length));
            if(dataset==="summary")assert.deepEqual(rows[0]?.slice(-6),Object.values(result.counts));
            if(dataset==="evidence")assert.deepEqual(rows.map(row=>row[10]),result.rows.map(row=>row.id));
          }
          const selections=[
            ...(["active","overdue","dueSoon","noDeadline","waiting","unassigned"] as const)
              .map(metric=>({kind:"metric" as const,metric})),
            ...(["status","owner","service","waitingReason"] as const)
              .flatMap(group=>result.groups[group].map(item=>({kind:"group" as const,group,id:item.id}))),
          ];
          for(const selection of selections){
            const selectedQuery={...query,selection};
            const native=await readJobWorkloadReportInTransaction(trx,context,{...selectedQuery,page:1,pageSize:25});
            const projection=await prepareJobReportCSVProjectionInTransaction(trx,context,{query:selectedQuery,dataset:"evidence"});
            assert.deepEqual((await collect(projection)).map(row=>row[10]),native.rows.map(row=>row.id));
          }
          const extraIds=Array.from({length:105},()=>randomUUID());
          await trx("jobs").insert(extraIds.map(id=>({
            id,workspaceId:otherWorkspace,customerId:null,customerName:"CSV fixture",sourceLeadId:null,
            sourceLeadNumber:null,title:"CSV extra",service:"Bulk",location:"",description:"",status:"in-progress",
            primaryOwnerId:users.other,createdBy:users.other,scheduledDate:null,arrivalWindow:null,
            completionDeadline:null,waitingReason:null,createdAt:new Date(),updatedAt:new Date(),lastActivityAt:new Date(),
          })));
          const bulk=await prepareJobReportCSVProjectionInTransaction(trx,context,{
            query:{...query,filters:{...query.filters,services:["service:Bulk"]}},dataset:"evidence"});
          assert.equal(bulk.count,105);
          assert.deepEqual(new Set((await collect(bulk)).map(row=>row[10])),new Set(extraIds));
          const controller=new AbortController();
          const iterator=bulk.rows(controller.signal);
          assert.equal((await iterator.next()).done,false);
          controller.abort();
          await assert.rejects(iterator.next(),{name:"AbortError"});
          assert.equal((await trx.raw("SELECT name FROM pg_cursors WHERE name LIKE 'jobs_csv_%'")).rows.length,0);
          await trx("jobs").whereIn("id",extraIds).delete();
          await trx("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.other});
          context.policy.grants=context.policy.grants.map(grant=>grant.role==="owner"&&grant.permission==="jobs.export"
            ?{...grant,scope:"assigned"}:grant);
          const narrow=await prepareJobReportCSVProjectionInTransaction(trx,context,{query,dataset:"summary"});
          assert.equal(narrow.scope,"assigned");
          assert.equal((await collect(narrow))[0]?.[10],1);
          const narrowedEvidence=await prepareJobReportCSVProjectionInTransaction(trx,context,{query,dataset:"evidence"});
          assert.deepEqual((await collect(narrowedEvidence)).map(row=>row[10]),[reportIds[0]]);
          await assert.rejects(prepareJobReportCSVProjectionInTransaction(trx,context,{
            query:{...query,filters:{...query.filters,services:["service:Installation"]}},dataset:"evidence"}),AuthorizationAccessError);
          await trx("jobTeamMembers").where({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.other}).delete();
          context.enabledPermissions=context.enabledPermissions.filter(permission=>permission!=="jobs.export");
          await assert.rejects(prepareJobReportCSVProjectionInTransaction(trx,context,{query,dataset:"summary"}),AuthorizationAccessError);
        });
      });
      await check("Jobs authority envelopes reconcile all native views and authorized pre-filter facets",async()=>{
        await db("jobs").where({id:reportIds[5]}).update({service:"Closed-only service",primaryOwnerId:users.other});
        try{
          await withWorkspaceAuthorization(db,{userId:users.other,workspaceId:otherWorkspace},enabled,false,async(trx,context)=>{
            const initial=await initialJobReportWithAuthorityInTransaction(trx,context);
            assert.equal(initial.viewerId,context.userId);
            assert.equal(initial.policyRevision,context.policy.revision);
            assert.equal(initial.scope,"workspace");
            assert.equal(initial.exportScope,null);
            context.policy.grants.push({role:"owner",permission:"reports.export",scope:"enabled"});
            context.policy.grants=context.policy.grants.map(grant=>grant.role==="owner"&&grant.permission==="jobs.export"
              ?{...grant,scope:"assigned"}:grant);
            assert.equal((await readJobReportWithAuthorityInTransaction(trx,context,baseQuery)).exportScope,"assigned");
            context.policy.grants=context.policy.grants.filter(grant=>!(grant.role==="owner"&&grant.permission==="reports.export"))
              .map(grant=>grant.role==="owner"&&grant.permission==="jobs.export"?{...grant,scope:"workspace"}:grant);
            assert.deepEqual(initial.query,{workspaceId:otherWorkspace,view:"lifecycle",
              period:{from:addCalendarDays(initial.today,-29),to:initial.today},filters:baseQuery.filters,
              selectedView:"created",page:1,pageSize:25});
            const selections=[
              ...(["active","overdue","dueSoon","noDeadline","waiting","unassigned"] as const)
                .map(metric=>({kind:"metric" as const,metric})),
              ...(["status","owner","service","waitingReason"] as const)
                .flatMap(group=>result.groups[group].map(item=>({kind:"group" as const,group,id:item.id}))),
            ];
            for(const selection of selections){
              const query={...baseQuery,selection,page:999};
              const envelope=await readJobReportWithAuthorityInTransaction(trx,context,query);
              assert.deepEqual(envelope.report,await readJobWorkloadReportInTransaction(trx,context,query));
              assert.equal(envelope.options.context,"current");
              assert.equal(envelope.options.statuses.length,4);
              assert.equal(envelope.options.services.some(option=>option.value==="service:Closed-only service"),false);
              assert.equal(envelope.options.owners.some(option=>option.value===`member:${users.other}`),false);
            }
            const period={from:addCalendarDays(initial.today,-90),to:addCalendarDays(initial.today,-60)};
            for(const selectedView of ["created","completed","canceled","reopened"] as const){
              const query={workspaceId:otherWorkspace,view:"lifecycle" as const,period,
                filters:baseQuery.filters,selectedView,page:99,pageSize:25 as const};
              const envelope=await readJobReportWithAuthorityInTransaction(trx,context,query);
              assert.deepEqual(envelope.report,await readJobLifecycleReportInTransaction(trx,context,query));
              assert.equal(envelope.options.context,"period");
              assert.equal(envelope.options.statuses.length,6);
              assert.equal(envelope.options.services.some(option=>option.value==="service:Closed-only service"),true);
              assert.equal(envelope.options.owners.some(option=>option.value===`member:${users.other}`),true);
            }
            for(const selectedDate of [undefined,initial.today]){
              const query={workspaceId:otherWorkspace,view:"completion" as const,
                period:{from:addCalendarDays(initial.today,-29),to:initial.today},
                filters:baseQuery.filters,selectedDate,page:99,pageSize:50 as const};
              assert.deepEqual((await readJobReportWithAuthorityInTransaction(trx,context,query)).report,
                await readJobCompletionReportInTransaction(trx,context,query));
            }
            const filtered=await readJobReportWithAuthorityInTransaction(trx,context,{...baseQuery,
              filters:{statuses:["waiting"],owners:[`member:${users.office}`],services:["service:Installation"]}});
            assert.equal(filtered.report.evidenceTotal,1);
            assert.equal(filtered.options.services.some(option=>option.value==="service:Repair"),true);
            assert.equal(filtered.options.owners.some(option=>option.value==="unassigned"),true);
            await assert.rejects(readJobReportWithAuthorityInTransaction(trx,context,{...baseQuery,workspaceId}),AuthorizationAccessError);
          });
        }finally{
          await db("jobs").where({id:reportIds[5]}).update({service:"Repair",primaryOwnerId:users.office});
        }
      });
      await check("Jobs authority facets follow supporting assignment and fail closed on stale sources and access",async()=>{
        await withWorkspaceAuthorization(db,{userId:users.field,workspaceId:otherWorkspace},enabled,false,async(trx,context)=>{
          const envelope=await readJobReportWithAuthorityInTransaction(trx,context,baseQuery);
          assert.equal(envelope.scope,"assigned");
          assert.equal(envelope.viewerId,users.field);
          assert.deepEqual(envelope.report.rows.map(row=>row.id),[reportIds[0]]);
          assert.deepEqual(envelope.options.owners.map(option=>option.value),[`member:${users.office}`]);
          assert.deepEqual(envelope.options.services.map(option=>option.value),["service:Repair"]);
          await assert.rejects(readJobReportWithAuthorityInTransaction(trx,context,{...baseQuery,
            filters:{...baseQuery.filters,services:["service:Installation"]}}),AuthorizationAccessError);
        });
        await db("jobTeamMembers").where({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.field}).delete();
        try{
          await withWorkspaceAuthorization(db,{userId:users.field,workspaceId:otherWorkspace},enabled,false,async(trx,context)=>{
            const empty=await readJobReportWithAuthorityInTransaction(trx,context,baseQuery);
            assert.equal(empty.report.evidenceTotal,0);
            assert.deepEqual(empty.options.owners,[]);
            assert.deepEqual(empty.options.services,[]);
            await assert.rejects(readJobReportWithAuthorityInTransaction(trx,context,{...baseQuery,
              filters:{...baseQuery.filters,owners:[`member:${users.office}`]}}),AuthorizationAccessError);
          });
        }finally{
          await db("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.field});
        }
        for(const permission of ["reports.read","jobs.read"]){
          await withWorkspaceAuthorization(db,{userId:users.other,workspaceId:otherWorkspace},enabled.filter(value=>value!==permission),false,async(trx,context)=>{
            await assert.rejects(readJobReportWithAuthorityInTransaction(trx,context,baseQuery),AuthorizationAccessError);
            await assert.rejects(initialJobReportWithAuthorityInTransaction(trx,context),AuthorizationAccessError);
          });
        }
        await assert.rejects(withWorkspaceAuthorization(db,{userId:users.owner,workspaceId:otherWorkspace},enabled,false,
          (trx,context)=>readJobReportWithAuthorityInTransaction(trx,context,baseQuery)),AuthorizationAccessError);
      });
      await check("Team Jobs separate primary/supporting responsibility and redact assigned-only workload",async()=>{
        await db("workspaceMemberships").insert({workspaceId:otherWorkspace,userId:users.teammate,role:"field"});
        await db("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.teammate});
        const team=await teamReport(users.other,otherWorkspace);
        assert.deepEqual(team.counts,{active:5,overdue:1,waiting:1});
        assert.equal(team.members.find(member=>member.id===users.office)?.primary.count,4);
        assert.equal(team.members.find(member=>member.id===users.field)?.supporting.count,1);
        assert.equal(team.members.find(member=>member.id===users.teammate)?.supporting.count,1);
        assert.equal(team.unassigned?.count,1);
        await check("Team Jobs CSV matches workload and withholds unrelated assigned attribution",async()=>{
          await withWorkspaceAuthorization(db,{userId:users.other,workspaceId:otherWorkspace},enabled,false,async(trx,context)=>{
            context.policy.grants.push({role:"owner",permission:"reports.export",scope:"enabled"});
            const query={workspaceId:otherWorkspace,view:"team-jobs" as const,selected:{kind:"queue" as const,queue:"active" as const},
              filters:{members:[] as string[]}};
            const native=await readTeamJobsReportInTransaction(trx,context,{...query,page:1,pageSize:100});
            const collect=async(dataset:"summary"|"members"|"unassigned"|"evidence")=>{
              const projection=await prepareTeamReportCSVProjectionInTransaction(trx,context,{query,dataset});
              const rows=[];for await(const row of projection.rows())rows.push(row);
              assert.equal(rows.length,projection.count);
              assert(rows.every(row=>row.length===projection.columns.length));
              return rows;
            };
            assert.deepEqual((await collect("summary"))[0]?.slice(-3),Object.values(native.counts));
            assert.equal((await collect("members")).length,native.members.length*2);
            assert.equal((await collect("unassigned"))[0]?.[9],native.unassigned?.count);
            assert.deepEqual((await collect("evidence")).map(row=>row[9]),native.rows.map(row=>row.id));
            for(const selected of [
              {kind:"queue" as const,queue:"overdue" as const},
              {kind:"queue" as const,queue:"waiting" as const},
              {kind:"unassigned" as const,filter:"all" as const},
              {kind:"member" as const,id:users.office,responsibility:"supporting" as const,filter:"all" as const},
            ]){
              const selectedQuery={...query,selected};
              const selectedNative=await readTeamJobsReportInTransaction(trx,context,{...selectedQuery,page:1,pageSize:100});
              const projection=await prepareTeamReportCSVProjectionInTransaction(trx,context,{query:selectedQuery,dataset:"evidence"});
              const rows=[];for await(const row of projection.rows())rows.push(row);
              assert.deepEqual(rows.map(row=>row[9]),selectedNative.rows.map(row=>row.id));
            }
            await trx("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.other});
            context.policy.grants=context.policy.grants.map(grant=>grant.role==="owner"&&grant.permission==="jobs.export"
              ?{...grant,scope:"assigned"}:grant);
            const mine=await collect("evidence");
            assert.deepEqual(mine.map(row=>row[9]),[reportIds[0]]);
            assert.equal(mine[0]?.[16],"withheld");assert.equal(mine[0]?.[17],null);
            assert.deepEqual(JSON.parse(String(mine[0]?.[18])),[users.other]);
            assert(!JSON.stringify(mine).includes(users.office));
            assert(!JSON.stringify(mine).includes(users.field));
            assert(!JSON.stringify(mine).includes(users.teammate));
            await assert.rejects(collect("unassigned"),AuthorizationAccessError);
            await assert.rejects(prepareTeamReportCSVProjectionInTransaction(trx,context,{
              query:{...query,filters:{members:[users.office]}},dataset:"summary"}),AuthorizationAccessError);
            const selfQuery={...query,filters:{members:[users.other]},
              selected:{kind:"member" as const,id:users.other,responsibility:"supporting" as const,filter:"all" as const}};
            const self=await prepareTeamReportCSVProjectionInTransaction(trx,context,{query:selfQuery,dataset:"evidence"});
            const selfRows=[];for await(const row of self.rows())selfRows.push(row);
            assert.deepEqual(selfRows.map(row=>row[9]),[reportIds[0]]);
            await trx("jobTeamMembers").where({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.other}).delete();
          });
        });
        await check("Team authority independently falls back to Jobs and rejects cross-scope shared member drafts",async()=>{
          await withWorkspaceAuthorization(db,{userId:users.other,workspaceId:otherWorkspace},enabled,false,async(trx,context)=>{
            const initial=await initialTeamReportWithAuthorityInTransaction(trx,context);
            assert.equal(initial.query.view,"team-leads");
            assert.deepEqual(initial.authority,{leads:{kind:"workspace"},jobs:{kind:"workspace"}});
            const envelope=await readTeamReportWithAuthorityInTransaction(trx,context,{
              workspaceId:otherWorkspace,view:"team-jobs",selected:{kind:"queue",queue:"active"},
              filters:{members:[]},page:1,pageSize:25,
            });
            assert(envelope.query.view==="team-jobs");
            assert.deepEqual(envelope.report,await readTeamJobsReportInTransaction(trx,context,envelope.query));
            assert.equal(envelope.options.length,team.members.length);
            assert(envelope.options.some(option=>option.value===users.other));
          });
          await withWorkspaceAuthorization(db,{userId:users.other,workspaceId:otherWorkspace},
            enabled.filter(value=>value!=="leads.read"),false,async(trx,context)=>{
              const initial=await initialTeamReportWithAuthorityInTransaction(trx,context);
              assert(initial.query.view==="team-jobs");
              assert.equal(initial.query.view,"team-jobs");
              assert.deepEqual(initial.authority,{leads:null,jobs:{kind:"workspace"}});
              assert.deepEqual(initial.report,await readTeamJobsReportInTransaction(trx,context,initial.query));
              await assert.rejects(readTeamReportWithAuthorityInTransaction(trx,context,{
                workspaceId:otherWorkspace,view:"team-leads",selected:{kind:"queue",queue:"open"},
                filters:{members:[]},page:1,pageSize:25,
              }),AuthorizationAccessError);
          });
          await withWorkspaceAuthorization(db,{userId:users.field,workspaceId:otherWorkspace},enabled,false,async(trx,context)=>{
            const initial=await initialTeamReportWithAuthorityInTransaction(trx,context);
            const mixed={...context,policy:{...context.policy,grants:context.policy.grants.map(grant=>
              grant.permission==="leads.read"||grant.permission==="reports.read"
                ?{...grant,scope:"workspace" as const}:grant)}};
            const lead=await initialTeamReportWithAuthorityInTransaction(trx,mixed);
            assert.deepEqual(lead.authority,{leads:{kind:"workspace"},jobs:{kind:"assigned",currentMemberId:users.field}});
            assert(lead.options.some(option=>option.value===users.office));
            const query={workspaceId:otherWorkspace,view:"team-jobs" as const,selected:{kind:"queue" as const,queue:"active" as const},
              filters:{members:[] as string[]},page:1,pageSize:25 as const};
            const assigned=await readTeamReportWithAuthorityInTransaction(trx,mixed,query);
            assert.deepEqual(assigned.options.map(option=>option.value),[users.field]);
            assert.deepEqual(assigned.report,await readTeamJobsReportInTransaction(trx,mixed,query));
            assert.equal(assigned.report.rows[0]?.id,reportIds[0]);
            await assert.rejects(readTeamReportWithAuthorityInTransaction(trx,mixed,{
              ...query,filters:{members:[users.office]},
            }),AuthorizationAccessError);
            await assert.rejects(readTeamReportWithAuthorityInTransaction(trx,context,{
              ...initial.query,filters:{members:[users.office]},
            }),AuthorizationAccessError);
          });
          for(const permissions of [enabled.filter(value=>value!=="reports.read"),
            enabled.filter(value=>value!=="leads.read"&&value!=="jobs.read")]){
            await withWorkspaceAuthorization(db,{userId:users.other,workspaceId:otherWorkspace},permissions,false,
              async(trx,context)=>{await assert.rejects(initialTeamReportWithAuthorityInTransaction(trx,context),AuthorizationAccessError);});
          }
        });
        const filtered=await teamReport(users.other,otherWorkspace,{kind:"queue",queue:"active"},enabled,99,[users.field,users.teammate]);
        assert.deepEqual(filtered.filters,{members:[users.field,users.teammate]});
        assert.equal(filtered.page,1);
        assert.deepEqual(filtered.counts,{active:1,overdue:1,waiting:0});
        assert.deepEqual(filtered.rows.map(row=>row.id),[reportIds[0]]);
        assert.equal(filtered.members.find(member=>member.id===users.office)?.primary.count,1);
        assert.equal(filtered.members.find(member=>member.id===users.field)?.supporting.count,1);
        assert.equal(filtered.members.find(member=>member.id===users.teammate)?.supporting.count,1);
        const primaryOrSupport=await teamReport(users.other,otherWorkspace,{kind:"queue",queue:"active"},enabled,1,[users.office,users.field]);
        assert.equal(primaryOrSupport.counts.active,4);
        assert.equal(primaryOrSupport.unassigned?.count,0);
        const noMatches=await teamReport(users.other,otherWorkspace,{kind:"queue",queue:"active"},enabled,1,[users.other]);
        assert.equal(noMatches.counts.active,0);
        assert.equal(noMatches.rows.length,0);
        for(const members of [[users.owner],[randomUUID()]]){
          await assert.rejects(teamReport(users.other,otherWorkspace,{kind:"queue",queue:"active"},enabled,1,members),AuthorizationAccessError);
        }
        await assert.rejects(teamReport(users.field,otherWorkspace,{kind:"queue",queue:"active"},enabled,1,[users.office]),AuthorizationAccessError);
        const selfFiltered=await teamReport(users.field,otherWorkspace,{kind:"queue",queue:"active"},enabled,1,[users.field]);
        assert.equal(selfFiltered.counts.active,1);
        assert.deepEqual(selfFiltered.rows[0]?.primary,{kind:"withheld"});
        await db("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:reportIds[3],userId:users.teammate});
        const supportedUnassigned=await teamReport(users.other,otherWorkspace,{kind:"queue",queue:"unassigned"},enabled,1,[users.teammate]);
        assert.equal(supportedUnassigned.counts.active,2);
        assert.equal(supportedUnassigned.unassigned?.count,1);
        assert.deepEqual(supportedUnassigned.rows.map(row=>row.id),[reportIds[3]]);
        await db("jobTeamMembers").where({workspaceId:otherWorkspace,jobId:reportIds[3],userId:users.teammate}).delete();
        const support=await teamReport(users.other,otherWorkspace,{
          kind:"member",id:users.field,responsibility:"supporting",filter:"overdue",
        });
        assert.deepEqual(support.rows.map(row=>row.id),[reportIds[0]]);
        const mine=await teamReport(users.field,otherWorkspace);
        assert.deepEqual(mine.counts,{active:1,overdue:1,waiting:0});
        assert.deepEqual(mine.members.map(member=>member.id),[users.field]);
        assert.equal(mine.unassigned,null);
        assert.deepEqual(mine.rows[0]?.primary,{kind:"withheld"});
        assert.deepEqual(mine.rows[0]?.supportingMemberIds,[users.field]);
        assert(!JSON.stringify(mine).includes(users.office));
        assert(!JSON.stringify(mine).includes(users.teammate));
        const unassigned=await teamReport(users.other,otherWorkspace,{kind:"unassigned",filter:"all"});
        assert.deepEqual(unassigned.rows.map(row=>row.id),[reportIds[3]]);
        await db("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.office});
        await assert.rejects(teamReport(users.other,otherWorkspace),/overlapping primary and supporting assignments/);
        await db("jobTeamMembers").where({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.office}).delete();
        await assert.rejects(teamReport(users.field,otherWorkspace,{kind:"queue",queue:"unassigned"}),AuthorizationAccessError);
        await assert.rejects(teamReport(users.field,otherWorkspace,{
          kind:"member",id:users.office,responsibility:"primary",filter:"all",
        }),AuthorizationAccessError);
        await assert.rejects(teamReport(users.other,otherWorkspace,{
          kind:"member",id:randomUUID(),responsibility:"primary",filter:"all",
        }),AuthorizationAccessError);
        for(const permission of ["reports.read","jobs.read"]){
          await assert.rejects(teamReport(users.other,otherWorkspace,{kind:"queue",queue:"active"},
            enabled.filter(item=>item!==permission)),AuthorizationAccessError);
        }
        await db("jobTeamMembers").where({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.field}).delete();
        assert.equal((await teamReport(users.field,otherWorkspace)).counts.active,0);
        await db("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:reportIds[0],userId:users.field});
        await db("workspaceMemberships").where({workspaceId:otherWorkspace,userId:users.office}).delete();
        const removed=await teamReport(users.other,otherWorkspace);
        assert.equal(removed.unassigned?.count,5);
        assert(!removed.members.some(member=>member.id===users.office));
        await assert.rejects(teamReport(users.other,otherWorkspace,{kind:"queue",queue:"active"},enabled,1,[users.office]),AuthorizationAccessError);
        await db("workspaceMemberships").insert({workspaceId:otherWorkspace,userId:users.office,role:"office"});
        await db("jobs").whereIn("id",[reportIds[0],reportIds[1],reportIds[2],reportIds[4],reportIds[5]])
          .update({primaryOwnerId:users.office});
      });
      await assert.rejects(report(users.field,otherWorkspace,{...baseQuery,
        filters:{...baseQuery.filters,owners:[`member:${users.field}`]}}),AuthorizationAccessError);
      await assert.rejects(report(users.other,otherWorkspace,{...baseQuery,workspaceId}),AuthorizationAccessError);
      await assert.rejects(report(users.other,otherWorkspace,baseQuery,enabled.filter(permission=>permission!=="reports.read")),AuthorizationAccessError);
    }finally{
      await db("jobs").whereIn("id",reportIds).delete();
    }
  });
  await check("period lifecycle counts distinct Jobs and selects the latest in-period completion",async()=>{
    const reportIds={ja:randomUUID(),jb:randomUUID(),jc:randomUUID()};
    const statusRows=[
      {jobId:reportIds.ja,from:"in-progress",to:"completed",at:"2026-10-03T16:00:00Z"},
      {jobId:reportIds.ja,from:"completed",to:"in-progress",at:"2026-10-05T16:00:00Z"},
      {jobId:reportIds.ja,from:"in-progress",to:"completed",at:"2026-10-10T16:00:00Z"},
      {jobId:reportIds.ja,from:"completed",to:"in-progress",at:"2026-11-02T16:00:00Z"},
      {jobId:reportIds.jb,from:"in-progress",to:"completed",at:"2026-10-07T16:00:00Z"},
      {jobId:reportIds.jc,from:"in-progress",to:"canceled",at:"2026-10-09T16:00:00Z"},
    ];
    await db("jobs").insert([
      {id:reportIds.ja,workspaceId:otherWorkspace,customerId:null,customerName:"Lifecycle fixture",
        sourceLeadId:null,sourceLeadNumber:null,title:"Job A",service:"Repair",location:"",description:"",
        status:"in-progress",primaryOwnerId:users.office,createdBy:users.other,scheduledDate:null,arrivalWindow:null,
        completionDeadline:null,waitingReason:null,createdAt:new Date("2026-09-30T16:00:00Z"),
        updatedAt:new Date("2026-11-02T16:00:00Z"),lastActivityAt:new Date("2026-11-02T16:00:00Z")},
      ...[
        {id:reportIds.jb,title:"Job B",status:"completed",createdAt:"2026-10-02T16:00:00Z",updatedAt:"2026-10-07T16:00:00Z"},
        {id:reportIds.jc,title:"Job C",status:"canceled",createdAt:"2026-10-04T16:00:00Z",updatedAt:"2026-10-09T16:00:00Z"},
      ].map(job=>({workspaceId:otherWorkspace,customerId:null,customerName:"Lifecycle fixture",
        sourceLeadId:null,sourceLeadNumber:null,service:"Repair",location:"",description:"",
        primaryOwnerId:users.office,createdBy:users.other,scheduledDate:null,arrivalWindow:null,
        completionDeadline:null,waitingReason:null,lastActivityAt:new Date(job.updatedAt),
        ...job,createdAt:new Date(job.createdAt),updatedAt:new Date(job.updatedAt)})),
    ]);
    try{
      await db("jobActivity").insert(statusRows.map(event=>({
        id:randomUUID(),workspaceId:otherWorkspace,jobId:event.jobId,actorId:users.other,
        actorName:"Lifecycle fixture",source:"ui",type:"status",
        changes:{from:event.from,to:event.to},createdAt:new Date(event.at),
      })));
      const baseQuery:JobLifecycleQuery={
        workspaceId:otherWorkspace,view:"lifecycle",
        filters:{statuses:[],owners:[],services:[]},
        period:{from:"2026-10-01",to:"2026-10-31"},
        selectedView:"completed",page:1,pageSize:25,
      };
      const completed=await lifecycleReport(users.other,otherWorkspace,baseQuery);
      assert.deepEqual(completed.counts,{created:2,completed:2,canceled:1,reopened:1});
      assert.deepEqual(completed.rows.map(row=>row.cells.date),["2026-10-10","2026-10-07"]);
      assert.deepEqual(new Set(completed.rows.map(row=>row.id)),new Set([reportIds.ja,reportIds.jb]));
      assert.equal(completed.coverage.completed.kind,"complete");
      await check("Jobs CSV lifecycle and completion match native selected evidence",async()=>{
        await withWorkspaceAuthorization(db,{userId:users.other,workspaceId:otherWorkspace},enabled,false,async(trx,context)=>{
          context.policy.grants.push({role:"owner",permission:"reports.export",scope:"enabled"});
          const lifecycle={workspaceId:otherWorkspace,view:baseQuery.view,filters:baseQuery.filters,
            period:baseQuery.period,selectedView:baseQuery.selectedView};
          for(const selectedView of ["created","completed","canceled","reopened"] as const){
            const query={...lifecycle,selectedView};
            const native=await readJobLifecycleReportInTransaction(trx,context,{...query,page:1,pageSize:25});
            for(const dataset of ["summary","evidence"] as const){
              const projection=await prepareJobReportCSVProjectionInTransaction(trx,context,{query,dataset});
              const rows=[];for await(const row of projection.rows())rows.push(row);
              assert.equal(rows.length,projection.count);
              if(dataset==="summary")assert.deepEqual(rows[0]?.slice(-4),Object.values(native.counts));
              else assert.deepEqual(rows.map(row=>row[10]),native.rows.map(row=>row.id));
            }
          }
          const query={workspaceId:otherWorkspace,view:"completion" as const,period:baseQuery.period,
            filters:baseQuery.filters,selectedDate:"2026-10-10"};
          const native=await readJobCompletionReportInTransaction(trx,context,{...query,page:1,pageSize:25});
          for(const dataset of ["summary","days","evidence"] as const){
            const projection=await prepareJobReportCSVProjectionInTransaction(trx,context,{query,dataset});
            const rows=[];for await(const row of projection.rows())rows.push(row);
            assert.equal(rows.length,projection.count);
            if(dataset==="summary")assert.deepEqual(rows[0]?.slice(-4),[native.total,native.duration.sampleSize,
              native.duration.totalElapsedDays,native.duration.averageElapsedDays]);
            if(dataset==="days")assert.deepEqual(rows.map(row=>row.slice(-2)),native.days.map(day=>[day.date,day.count]));
            if(dataset==="evidence")assert.deepEqual(rows.map(row=>row[10]),native.rows.map(row=>row.id));
          }
        });
      });
      const created=await lifecycleReport(users.other,otherWorkspace,{...baseQuery,selectedView:"created"});
      assert.deepEqual(new Set(created.rows.map(row=>row.id)),new Set([reportIds.jb,reportIds.jc]));
      const earlyPeriod=await lifecycleReport(users.other,otherWorkspace,{...baseQuery,
        period:{from:"2026-10-01",to:"2026-10-05"}});
      assert.equal(earlyPeriod.counts.completed,1);
      assert.equal(earlyPeriod.rows[0]?.cells.date,"2026-10-03");
      await check("completion trend and elapsed days reconcile the lifecycle-selected event set",async()=>{
        const completionQuery:JobCompletionQuery={
          workspaceId:otherWorkspace,view:"completion",period:baseQuery.period,page:1,pageSize:25,
          filters:{statuses:[],owners:[],services:[]},
        };
        const result=await completionReport(users.other,otherWorkspace,completionQuery);
        assert.equal(result.total,completed.counts.completed);
        assert.deepEqual(result.duration,{sampleSize:2,totalElapsedDays:15,averageElapsedDays:7.5});
        assert.equal(result.days.length,31);
        assert.deepEqual(result.days.filter(day=>day.count>0).map(day=>[day.date,day.count]),
          [["2026-10-07",1],["2026-10-10",1]]);
        assert.deepEqual(result.rows.map(row=>row.completionDate),["2026-10-10","2026-10-07"]);
        const day=await completionReport(users.other,otherWorkspace,{...completionQuery,selectedDate:"2026-10-03"});
        assert.equal(day.evidenceTotal,0);
        assert.equal(day.total,2);
        assert.deepEqual(day.duration,result.duration);
        const selected=await completionReport(users.other,otherWorkspace,{...completionQuery,selectedDate:"2026-10-10",page:99});
        assert.equal(selected.page,1);
        assert.deepEqual(selected.rows.map(row=>row.id),[reportIds.ja]);
        const early=await completionReport(users.other,otherWorkspace,{...completionQuery,
          period:{from:"2026-10-01",to:"2026-10-05"}});
        assert.deepEqual(early.duration,{sampleSize:1,totalElapsedDays:3,averageElapsedDays:3});
        await check("period facets intersect current values without replacing historical completion selection",async()=>{
          await db("jobs").where({id:reportIds.ja}).update({service:" Installation "});
          await db("jobs").where({id:reportIds.jc}).update({primaryOwnerId:null,service:""});
          const filters={statuses:["in-progress" as const,"completed" as const],
            owners:[`member:${users.office}`],services:["service:Installation","service:Repair"]};
          const both=await completionReport(users.other,otherWorkspace,{...completionQuery,filters});
          assert.equal(both.total,2);
          assert.deepEqual(both.filters,filters);
          assert.deepEqual(both.duration,result.duration);
          const narrowed={...filters,statuses:["in-progress" as const],services:["service:Installation"]};
          const one=await completionReport(users.other,otherWorkspace,{...completionQuery,filters:narrowed});
          assert.deepEqual(one.rows.map(row=>row.id),[reportIds.ja]);
          assert.deepEqual(one.duration,{sampleSize:1,totalElapsedDays:10,averageElapsedDays:10});
          const lifecycle=await lifecycleReport(users.other,otherWorkspace,{...baseQuery,filters:narrowed});
          assert.deepEqual(lifecycle.counts,{created:0,completed:1,canceled:0,reopened:1});
          assert.equal(lifecycle.rows[0]?.cells.date,"2026-10-10");
          const canceled=await lifecycleReport(users.other,otherWorkspace,{...baseQuery,selectedView:"canceled",
            filters:{statuses:["canceled"],owners:["unassigned"],services:["none"]}});
          assert.deepEqual(canceled.rows.map(row=>row.id),[reportIds.jc]);
          const union=await lifecycleReport(users.other,otherWorkspace,{...baseQuery,selectedView:"created",
            filters:{statuses:[],owners:[`member:${users.office}`,"unassigned"],services:["service:Repair","none"]}});
          assert.equal(union.counts.created,2);
          const noMatch=await completionReport(users.other,otherWorkspace,{...completionQuery,
            filters:{statuses:["canceled"],owners:[],services:["service:Installation"]}});
          assert.equal(noMatch.total,0);
          assert.equal(noMatch.duration.averageElapsedDays,null);
          for(const stale of [
            {statuses:[],owners:[`member:${users.other}`],services:[]},
            {statuses:[],owners:[],services:["service:Unavailable"]},
          ]){
            await assert.rejects(completionReport(users.other,otherWorkspace,{...completionQuery,filters:stale}),
              AuthorizationAccessError);
            await assert.rejects(lifecycleReport(users.other,otherWorkspace,{...baseQuery,filters:stale}),
              AuthorizationAccessError);
          }
          await db("jobs").where({id:reportIds.ja}).update({service:"Repair"});
        });
        const empty=await completionReport(users.other,otherWorkspace,{...completionQuery,
          period:{from:"2026-09-01",to:"2026-09-02"}});
        assert.deepEqual(empty.duration,{sampleSize:0,totalElapsedDays:0,averageElapsedDays:null});
        await db("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:reportIds.ja,userId:users.field});
        const assigned=await completionReport(users.field,otherWorkspace,completionQuery);
        assert.equal(assigned.total,1);
        assert.deepEqual(assigned.rows.map(row=>row.id),[reportIds.ja]);
        assert.equal(assigned.duration.totalElapsedDays,10);
        await assert.rejects(completionReport(users.field,otherWorkspace,{...completionQuery,
          filters:{statuses:[],owners:["unassigned"],services:[]}}),AuthorizationAccessError);
        for(const permission of ["reports.read","jobs.read"]){
          await assert.rejects(completionReport(users.other,otherWorkspace,completionQuery,
            enabled.filter(item=>item!==permission)),AuthorizationAccessError);
        }
        await assert.rejects(completionReport(users.other,otherWorkspace,{...completionQuery,workspaceId}),
          AuthorizationAccessError);
        await assert.rejects(completionReport(users.other,otherWorkspace,{...completionQuery,
          period:{from:"9999-01-01",to:"9999-01-02"}}),RangeError);
      });
      await assert.rejects(lifecycleReport(users.other,otherWorkspace,baseQuery,
        enabled.filter(permission=>permission!=="reports.read")),AuthorizationAccessError);
      await assert.rejects(lifecycleReport(users.other,otherWorkspace,{...baseQuery,workspaceId}),
        AuthorizationAccessError);
      const malformedEventId=randomUUID();
      await db("jobActivity").insert({
        id:malformedEventId,workspaceId:otherWorkspace,jobId:reportIds.ja,actorId:users.other,
        actorName:"Lifecycle fixture",source:"ui",type:"status",
        changes:{from:"completed",to:"canceled"},createdAt:new Date("2026-10-15T16:00:00Z"),
      });
      await assert.rejects(lifecycleReport(users.other,otherWorkspace,baseQuery),
        /invalid lifecycle transition evidence/);
      const completionQuery:JobCompletionQuery={
        workspaceId:otherWorkspace,view:"completion",period:baseQuery.period,page:1,pageSize:25,
        filters:{statuses:[],owners:[],services:[]},
      };
      await assert.rejects(completionReport(users.other,otherWorkspace,completionQuery),
        /invalid lifecycle transition evidence/);
      await db("jobActivity").where({id:malformedEventId}).update({changes:{to:"completed"}});
      await assert.rejects(lifecycleReport(users.other,otherWorkspace,baseQuery),
        /invalid lifecycle transition evidence/);
      await assert.rejects(completionReport(users.other,otherWorkspace,completionQuery),
        /invalid lifecycle transition evidence/);
      await db("jobActivity").where({id:malformedEventId}).delete();
      await db("jobActivity").insert({
        id:randomUUID(),workspaceId:otherWorkspace,jobId:reportIds.jb,actorId:users.other,
        actorName:"Lifecycle fixture",source:"ui",type:"status",
        changes:{from:"in-progress",to:"completed"},createdAt:new Date("2026-10-01T16:00:00Z"),
      });
      await assert.rejects(lifecycleReport(users.other,otherWorkspace,baseQuery),
        /invalid lifecycle transition evidence/);
      await assert.rejects(completionReport(users.other,otherWorkspace,completionQuery),
        /invalid lifecycle transition evidence/);
    }finally{
      await db("jobs").whereIn("id",Object.values(reportIds)).delete();
    }
  });
  await check("completion dates honor DST endpoints, stable pagination, event tie-breaks and current assignment",async()=>{
    const ids=Array.from({length:28},()=>randomUUID());
    await db("jobs").insert(ids.map((id,index)=>({
      id,workspaceId:otherWorkspace,customerId:null,customerName:"Completion boundary fixture",
      title:`Completion boundary ${index}`,service:"",location:"",description:"",status:"in-progress",
      primaryOwnerId:users.office,createdBy:users.other,
      createdAt:new Date(index===0?"2026-11-01T03:30:00Z":"2026-10-31T16:00:00Z"),
      updatedAt:new Date(),lastActivityAt:new Date(),
    })));
    const eventTimes=ids.map((_,index)=>index===0?"2026-11-02T05:00:00Z"
      :index===26?"2026-11-01T03:59:59Z":index===27?"2026-11-03T05:00:00Z":"2026-11-01T06:30:00Z");
    const tieIds=[randomUUID(),randomUUID()].sort();
    const query:JobCompletionQuery={
      workspaceId:otherWorkspace,view:"completion",period:{from:"2026-11-01",to:"2026-11-02"},page:1,pageSize:25,
      filters:{statuses:[],owners:[],services:[]},
    };
    try{
      await db("jobActivity").insert(ids.map((id,index)=>({
        id:index===0?tieIds[0]:randomUUID(),workspaceId:otherWorkspace,jobId:id,
        actorId:users.other,actorName:"Completion boundary fixture",source:"ui",type:"status",
        changes:{from:"in-progress",to:"completed"},createdAt:new Date(eventTimes[index]),
      })));
      await db("jobActivity").insert({
        id:tieIds[1],workspaceId:otherWorkspace,jobId:ids[0],actorId:users.other,
        actorName:"Completion boundary fixture",source:"ui",type:"status",
        changes:{from:"in-progress",to:"completed"},createdAt:new Date(eventTimes[0]),
      });
      await withWorkspaceAuthorization(db,{userId:users.other,workspaceId:otherWorkspace},enabled,false,
        async(trx,context)=>{
          const auth=await jobReportContext(trx,context);
          const selected=await selectedJobLifecycleEvents(trx,auth,query.period,"completed")
            .where("a.jobId",ids[0]).first();
          assert.equal(selected?.eventId,tieIds[1]);
        });
      const first=await completionReport(users.other,otherWorkspace,query);
      const last=await completionReport(users.other,otherWorkspace,{...query,page:99});
      assert.equal(first.total,26);
      assert.deepEqual(first.days.map(day=>[day.date,day.count]),[["2026-11-01",25],["2026-11-02",1]]);
      assert.equal(first.rows.length,25);
      assert.equal(last.page,2);
      assert.equal(last.rows.length,1);
      assert.equal(new Set([...first.rows,...last.rows].map(row=>row.id)).size,26);
      assert.deepEqual(first.duration,{sampleSize:26,totalElapsedDays:27,averageElapsedDays:27/26});
      assert.equal(first.rows[0]?.createdDate,"2026-10-31");
      assert.equal(first.rows[0]?.completionDate,"2026-11-02");
      const teamFirst=await teamReport(users.other,otherWorkspace);
      const teamLast=await teamReport(users.other,otherWorkspace,{kind:"queue",queue:"active"},enabled,99);
      assert.equal(teamFirst.counts.active,28);
      assert.equal(teamFirst.rows.length,25);
      assert.equal(teamLast.page,2);
      assert.equal(teamLast.rows.length,3);
      assert.equal(new Set([...teamFirst.rows,...teamLast.rows].map(row=>row.id)).size,28);
      await db("jobTeamMembers").insert({workspaceId:otherWorkspace,jobId:ids[0],userId:users.field});
      assert.equal((await completionReport(users.field,otherWorkspace,query)).total,1);
      await db("jobs").where({id:ids[26]}).update({createdAt:new Date("2026-11-02T12:00:00Z")});
      await db("jobActivity").insert({
        id:randomUUID(),workspaceId:otherWorkspace,jobId:ids[26],actorId:users.other,
        actorName:"Unauthorized malformed fixture",source:"ui",type:"status",
        changes:{from:"in-progress",to:"completed"},createdAt:new Date("2026-11-01T12:00:00Z"),
      });
      assert.equal((await completionReport(users.field,otherWorkspace,query)).total,1);
      await assert.rejects(completionReport(users.other,otherWorkspace,query),
        /invalid lifecycle transition evidence/);
      await db("jobTeamMembers").where({workspaceId:otherWorkspace,jobId:ids[0],userId:users.field}).delete();
      assert.equal((await completionReport(users.field,otherWorkspace,query)).total,0);
    }finally{
      await db("jobs").whereIn("id",ids).delete();
    }
  });
  await check("Overview composes native reports with current authority, date bases and no private evidence",async()=>{
    const overviewQuery=await withWorkspaceAuthorization(db,identity(),enabled,false,async(trx,context)=>{
      const auth=await jobReportContext(trx,context);
      const period={from:addCalendarDays(auth.today,-29),to:auth.today};
      const query={workspaceId,view:"business-overview" as const,period};
      const result=await readBusinessOverviewInTransaction(trx,context,query);
      const common={workspaceId,page:1,pageSize:25 as const};
      const jobFilters={statuses:[],owners:[],services:[]};
      const leadFilters={stages:[],owners:[],sources:[]};
      const estimateFilters={owners:[],parents:[]};
      const intake=await readLeadReportInTransaction(trx,context,{...common,view:"intake",period,filters:leadFilters,currentFilters:leadFilters});
      const pipeline=await readLeadReportInTransaction(trx,context,{...common,view:"pipeline",filters:leadFilters,selection:{kind:"pipeline"}});
      const attention=await readLeadReportInTransaction(trx,context,{...common,view:"attention",filters:leadFilters,selection:"inactive"});
      const created=await readJobLifecycleReportInTransaction(trx,context,{...common,view:"lifecycle",period,filters:jobFilters,selectedView:"created"});
      const completion=await readJobCompletionReportInTransaction(trx,context,{...common,view:"completion",period,filters:jobFilters});
      const workload=await readJobWorkloadReportInTransaction(trx,context,{...common,view:"workload",filters:jobFilters,selection:{kind:"metric",metric:"active"}});
      const accepted=await readEstimateDecisionsReportInTransaction(trx,context,{...common,view:"estimate-decisions",period,filters:estimateFilters,selected:"accepted"});
      const awaiting=await readEstimateCurrentReportInTransaction(trx,context,{...common,view:"estimate-current",filters:estimateFilters,selected:"awaiting"});
      const visits=await readCalendarScheduledReportInTransaction(trx,context,{...common,view:"calendar-scheduled",
        period:{from:auth.today,to:addCalendarDays(auth.today,6)},selected:"visits",filters:{participants:[],recordTypes:[]}});
      assert.equal(result.leads.kind,"available");assert.equal(result.jobs.kind,"available");
      assert.equal(result.estimates.kind,"available");assert.equal(result.calendar.kind,"available");
      if(result.leads.kind!=="available"||result.jobs.kind!=="available"||result.estimates.kind!=="available"||
        result.calendar.kind!=="available"||intake.view!=="intake"||pipeline.view!=="pipeline"||attention.view!=="attention")throw Error("Expected native Overview projections.");
      assert.equal(result.leads.created,intake.total);assert.deepEqual(result.leads.stages,pipeline.stages);
      assert.equal(result.leads.inactive,attention.counts.inactive);assert.equal(result.leads.archiveVisibility,intake.archiveVisibility);
      assert.equal(result.jobs.created,created.counts.created);assert.equal(result.jobs.completed,completion.total);
      assert.equal(result.jobs.active,workload.counts.active);assert.equal(result.jobs.overdue,workload.counts.overdue);
      assert.equal(result.jobs.waiting,workload.counts.waiting);
      assert.equal(result.estimates.accepted,accepted.counts.accepted);assert.deepEqual(result.estimates.acceptedMoney,accepted.money);
      assert.equal(result.estimates.awaiting,awaiting.counts.awaiting);assert.equal(result.calendar.visits,visits.counts.visits);
      assert.equal(JSON.stringify(result).includes('"rows"'),false);assert.equal(JSON.stringify(result).includes('"recordId"'),false);
      const old=await readBusinessOverviewInTransaction(trx,context,{...query,period:{from:addCalendarDays(auth.today,-90),to:addCalendarDays(auth.today,-60)}});
      assert.deepEqual(old.leads.kind==="available"?old.leads.stages:null,result.leads.stages);
      assert.deepEqual(old.jobs.kind==="available"?old.jobs.active:null,result.jobs.active);
      assert.deepEqual(old.estimates.kind==="available"?old.estimates.awaiting:null,result.estimates.awaiting);
      assert.deepEqual(old.calendar,result.calendar);
      await assert.rejects(readBusinessOverviewInTransaction(trx,context,{...query,workspaceId:otherWorkspace}),AuthorizationAccessError);
      await assert.rejects(readBusinessOverviewInTransaction(trx,context,{...query,period:{from:auth.today,to:addCalendarDays(auth.today,1)}}),RangeError);
      return query;
    });
    for(const permission of ["reports.read","estimates.read","calendar.read","leads.read","jobs.read"]){
      await withWorkspaceAuthorization(db,identity(),enabled.filter(value=>value!==permission),false,async(trx,context)=>{
        if(permission==="reports.read"){await assert.rejects(readBusinessOverviewInTransaction(trx,context,overviewQuery),AuthorizationAccessError);return;}
        const result=await readBusinessOverviewInTransaction(trx,context,overviewQuery);
        const section=permission==="estimates.read"?result.estimates:permission==="calendar.read"?result.calendar:
          permission==="jobs.read"?result.jobs:result.leads;
        assert.equal(section.kind,"unavailable");
      });
    }
    await withWorkspaceAuthorization(db,identity(),enabled.filter(value=>value!=="reports.financial.read"),false,async(trx,context)=>{
      assert.equal((await readBusinessOverviewInTransaction(trx,context,overviewQuery)).estimates.kind,"available");
    });
    await withWorkspaceAuthorization(db,identity("field"),enabled,false,async(trx,context)=>{
      const result=await readBusinessOverviewInTransaction(trx,context,overviewQuery);
      assert.equal(result.reportScope,"assigned");
      if(result.leads.kind==="available")assert.equal(result.leads.scope,"assigned");
      if(result.jobs.kind==="available")assert.equal(result.jobs.scope,"assigned");
      if(result.estimates.kind==="available")assert.equal(result.estimates.scope,"assigned_job");
      if(result.calendar.kind==="available"){assert.equal(result.calendar.scope.kind,"own");
        if(result.calendar.scope.kind==="own")assert.equal(result.calendar.scope.viewerId,users.field);}
    });
  });
  await check("Overview authority envelope retains native composition, initial clock, partial sources and current viewer",async()=>{
    const query=await withWorkspaceAuthorization(db,identity(),enabled,false,async(trx,context)=>{
      const initial=await initialBusinessOverviewWithAuthorityInTransaction(trx,context);
      assert.equal(initial.viewerId,context.userId);
      assert.equal(initial.workspaceId,workspaceId);
      assert.equal(initial.policyRevision,context.policy.revision);
      assert.deepEqual(initial.query.period,{from:addCalendarDays(initial.report.today,-29),to:initial.report.today});
      assert.deepEqual(initial.report,await readBusinessOverviewInTransaction(trx,context,initial.query));
      assert.equal(JSON.stringify(initial).includes('"rows"'),false);
      assert.equal(JSON.stringify(initial).includes('"recordId"'),false);
      await assert.rejects(readBusinessOverviewWithAuthorityInTransaction(trx,context,{...initial.query,workspaceId:otherWorkspace}),AuthorizationAccessError);
      return initial.query;
    });
    for(const permission of ["reports.read","leads.read","jobs.read","estimates.read","calendar.read"]){
      await withWorkspaceAuthorization(db,identity(),enabled.filter(value=>value!==permission),false,async(trx,context)=>{
        if(permission==="reports.read"){
          await assert.rejects(readBusinessOverviewWithAuthorityInTransaction(trx,context,query),AuthorizationAccessError);
          await assert.rejects(initialBusinessOverviewWithAuthorityInTransaction(trx,context),AuthorizationAccessError);
          return;
        }
        const result=await readBusinessOverviewWithAuthorityInTransaction(trx,context,query);
        const key=permission==="leads.read"?"lead":permission==="jobs.read"?"job":permission==="estimates.read"?"estimate":"calendar";
        assert.equal(result.authority[key],null);
        if(permission==="leads.read")assert.equal(result.report.jobs.kind,"available");
      });
    }
    await withWorkspaceAuthorization(db,identity("field"),enabled,false,async(trx,context)=>{
      const result=await readBusinessOverviewWithAuthorityInTransaction(trx,context,query);
      assert.equal(result.viewerId,users.field);
      assert.equal(result.authority.reportScope,"assigned");
      if(result.authority.calendar?.kind==="own")assert.equal(result.authority.calendar.viewerId,result.viewerId);
    });
  });
  await check("structured ZIP is required on new Jobs and edits; legacy jobs remain readable",async()=>{
    const postalCustomer=randomUUID();await db("customers").insert({id:postalCustomer,workspaceId,name:"Postal customer",type:"person",companyName:"",email:"",phone:"",location:"",internalNotes:""});
    const base={...input,customerId:postalCustomer,submissionId:randomUUID(),title:"Postal fixture",primaryOwnerId:null,teamUserIds:[],location:"Address containing 99999",postalCode:"00501-1234"};
    const created=await createJob(db,identity(),enabled,base), detail=await readJob(db,identity(),enabled,created.jobId);
    assert.equal(detail.job.postalCode,"00501"); assert.equal(detail.job.countryCode,"US");
    await assert.rejects(createJob(db,identity(),enabled,{...base,submissionId:randomUUID(),postalCode:""}));
    await assert.rejects(createJob(db,identity(),enabled,{...base,submissionId:randomUUID(),postalCode:undefined} as unknown as CreateJobInput));
    await db("jobs").where({id:created.jobId,workspaceId}).update({postalCode:null,countryCode:null});
    const legacy=await readJob(db,identity(),enabled,created.jobId); assert.equal(legacy.job.postalCode,null);
    const command={workspaceId,jobId:created.jobId,submissionId:randomUUID(),expectedVersion:legacy.job.version,action:"edit",title:legacy.job.title,service:"",location:legacy.job.location,description:"",postalCode:"10002"};
    await assert.rejects(mutateJob(db,identity(),enabled,{...command,postalCode:"Manhattan"}));
    await mutateJob(db,identity(),enabled,command); assert.equal((await readJob(db,identity(),enabled,created.jobId)).job.postalCode,"10002");
  });
  console.log(`PASS ${passed} Jobs foundation database journeys`);
}finally{
  await db.destroy();
  try{if(created)await owner.raw("DROP DATABASE ??",[name]);}finally{await owner.destroy();}
}
