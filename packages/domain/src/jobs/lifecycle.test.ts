import {describe,it,expect} from "vitest";
import {randomUUID} from "node:crypto";
import {createJobSchema,jobDateSchema,jobMutationSchema,jobQuerySchema,permissionIds,type JobMutation} from "@salesmora/contracts";
import {authorize} from "../authorization/authorize";
import {createDefaultWorkspacePolicy} from "../authorization/policy";
import {scheduledJobStatus,validateJobTransition} from "./lifecycle";
const status=(extra:Record<string,unknown>={})=>jobMutationSchema.parse({workspaceId:randomUUID(),jobId:randomUUID(),submissionId:randomUUID(),expectedVersion:1,action:"status",to:"in-progress",...extra}) as Extract<JobMutation,{action:"status"}>;
describe("Jobs foundation contracts and lifecycle",()=>{
  it("validates real local dates across leap days, month ends and DST dates",()=>{
    for(const date of ["2026-03-08","2026-11-01","2028-02-29"])expect(jobDateSchema.parse(date)).toBe(date);
    for(const date of ["2026-02-29","2026-04-31","2026-01-01T00:00:00Z","tomorrow"])expect(jobDateSchema.safeParse(date).success).toBe(false);
  });
  it("requires explicit customer, title and owner choice; rejects forged state/audit/tenant claims",()=>{
    const input={workspaceId:randomUUID(),submissionId:randomUUID(),customerId:randomUUID(),title:"Repair sink",primaryOwnerId:null};
    expect(createJobSchema.parse(input).scheduledDate).toBeNull();
    for(const extra of [{status:"completed"},{createdBy:"another-user"},{version:2},{sql:"SELECT 1"}])expect(createJobSchema.safeParse({...input,...extra}).success).toBe(false);
    expect(createJobSchema.safeParse({...input,primaryOwnerId:undefined}).success).toBe(false);
    expect(createJobSchema.safeParse({...input,arrivalWindow:"09:00-11:00"}).success).toBe(false);
    expect(jobQuerySchema.safeParse({workspaceId:input.workspaceId,pageSize:10000}).success).toBe(false);
  });
  it("only auto-transitions Needs Scheduling/Scheduled and refuses closed schedules",()=>{
    expect(scheduledJobStatus("needs-scheduling","2026-10-20")).toBe("scheduled");
    expect(scheduledJobStatus("scheduled",null)).toBe("needs-scheduling");
    for(const state of ["in-progress","waiting"] as const)expect(scheduledJobStatus(state,null)).toBe(state);
    for(const state of ["completed","canceled"] as const)expect(()=>scheduledJobStatus(state,"2026-10-20")).toThrow();
  });
  it("requires a Waiting reason, allows leaving without one and rejects irrelevant reasons",()=>{
    expect(()=>validateJobTransition({status:"in-progress",scheduledDate:null},status({to:"waiting"}))).toThrow();
    expect(()=>validateJobTransition({status:"in-progress",scheduledDate:null},status({to:"waiting",waitingReason:"materials"}))).not.toThrow();
    expect(()=>validateJobTransition({status:"waiting",scheduledDate:null},status())).not.toThrow();
    expect(()=>validateJobTransition({status:"waiting",scheduledDate:null},status({waitingReason:"materials"}))).toThrow();
  });
  it("requires explicit close confirmation and cancellation reason",()=>{
    const row={status:"in-progress" as const,scheduledDate:null};
    expect(()=>validateJobTransition(row,status({to:"completed"}))).toThrow();
    expect(()=>validateJobTransition(row,status({to:"completed",confirmed:true}))).not.toThrow();
    expect(()=>validateJobTransition(row,status({to:"canceled",confirmed:true}))).toThrow();
    expect(()=>validateJobTransition(row,status({to:"canceled",confirmed:true,cancellationReason:"duplicate"}))).not.toThrow();
  });
  it("requires a schedule for Scheduled, and explicit deadline review on reopening",()=>{
    expect(()=>validateJobTransition({status:"needs-scheduling",scheduledDate:null},status({to:"scheduled"}))).toThrow();
    const closed={status:"completed" as const,scheduledDate:null};
    expect(()=>validateJobTransition(closed,status({confirmed:true}))).toThrow();
    expect(()=>validateJobTransition(closed,status({confirmed:true,reopenDeadline:null}))).not.toThrow();
    expect(()=>validateJobTransition(closed,status({to:"canceled",confirmed:true,cancellationReason:"other",reopenDeadline:null}))).toThrow();
  });
  it("Field schedule permission requires primary ownership even under a broader saved grant",()=>{
    const policy=createDefaultWorkspacePolicy("workspace");
    policy.grants=policy.grants.filter(g=>g.role!=="field"||g.permission!=="jobs.schedule.update");
    policy.grants.push({role:"field",permission:"jobs.schedule.update",scope:"assigned"});
    const context={workspaceId:"workspace",userId:"field",ownerUserId:"owner",membership:{workspaceId:"workspace",userId:"field",role:"field"},policy,enabledPermissions:[...permissionIds]};
    const job={kind:"job",id:"job",workspaceId:"workspace",ownerId:"other",teamUserIds:["field"]};
    expect(authorize(context,{permission:"jobs.schedule.update",resource:job}).allowed).toBe(false);
    expect(authorize(context,{permission:"jobs.schedule.update",resource:{...job,ownerId:"field"}}).allowed).toBe(true);
    policy.grants=policy.grants.filter(g=>g.role!=="field"||g.permission!=="jobs.schedule.update");
    expect(authorize(context,{permission:"jobs.schedule.update",resource:{...job,ownerId:"field"}}).allowed).toBe(false);
  });
});
