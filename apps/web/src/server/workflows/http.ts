import "server-only";

import { NextResponse } from "next/server";
import { workflowCommandSchema, workflowListQuerySchema, workflowRunRequestSchema, workflowRunConfirmSchema, workflowNotificationsCommandSchema, workflowEditCommandSchema } from "@salesmora/contracts";
import { AuthorizationAccessError, WorkflowConflictError, changeWorkflow, readWorkflows, previewWorkflowRun, confirmWorkflowRun, changeWorkflowNotifications, readWorkflowEditData, editWorkflow, WorkflowDraftError, scheduleChangeOptions, postJobOptions, assignedLeadColdOptions, saveCustomerVisitCompany, customerVisitOptions, serviceDueOptions, routingOptions, withWorkspaceAuthorization } from "@salesmora/data";
import { getSession } from "../auth/session";
import { database } from "../workspaces/store";
import { enabledPermissions } from "../authorization/permissions";
import { isWorkspaceSuspended, workspaceSuspendedResponse } from "../http/suspension";

const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };

export async function workflowRequest(request: Request, write: boolean | "preview" | "run" | "notifications" | "edit" | "routing-options" | "service-options" | "customer-visit-options" | "cold-lead-options" | "post-job-options" | "schedule-change-options" = false) {
  if (write && request.method !== "GET" && (!process.env.BETTER_AUTH_URL || request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL).origin)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403, headers });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to access workflows." }, { status: 401, headers });
  try {
    const url = new URL(request.url);
    const parsed = workflowListQuerySchema.safeParse({ workspaceId: url.searchParams.get("workspace") });
    if (!parsed.success) return NextResponse.json({ error: "Invalid workflow query." }, { status: 422, headers });
    const query = parsed.data;
    const identity = { userId: session.user.id, workspaceId: query.workspaceId };
    if(write==='cold-lead-options')return NextResponse.json(await withWorkspaceAuthorization(database(),identity,enabledPermissions,false,(trx,context)=>assignedLeadColdOptions(trx,context)),{headers});
    if(write==='customer-visit-options'||write==='post-job-options'||write==='schedule-change-options'){
      const kind=write==='schedule-change-options'?'customer_schedule_change':write==='post-job-options'?'post_job_thank_you':'customer_visit_reminder';
      if(request.method==='GET')return NextResponse.json(await withWorkspaceAuthorization(database(),identity,enabledPermissions,false,(trx,context)=>(kind==='customer_schedule_change'?scheduleChangeOptions(trx,context,process.env.BETTER_AUTH_URL??''):kind==='post_job_thank_you'?postJobOptions(trx,context,process.env.BETTER_AUTH_URL??''):customerVisitOptions(trx,context,process.env.BETTER_AUTH_URL??''))),{headers});
      const text=await request.text();if(text.length>2048)return NextResponse.json({error:'Invalid contact details.'},{status:422,headers});
      let body:unknown;try{body=JSON.parse(text);}catch{return NextResponse.json({error:'Invalid contact details.'},{status:422,headers});}
      const {serviceDueCommandSchema}=await import('@salesmora/contracts');const command=serviceDueCommandSchema.safeParse(body);
      if(!command.success||command.data.action!=='company')return NextResponse.json({error:'Check the company phone and email.'},{status:422,headers});
      return NextResponse.json(await withWorkspaceAuthorization(database(),identity,enabledPermissions,true,(trx,context)=>saveCustomerVisitCompany(trx,context,command.data,process.env.BETTER_AUTH_URL??'',kind)),{headers});
    }
    if(write==='service-options')return NextResponse.json(await withWorkspaceAuthorization(database(),identity,enabledPermissions,false,(trx,context)=>serviceDueOptions(trx,context)),{headers});
    if(write==='routing-options')return NextResponse.json(await withWorkspaceAuthorization(database(),identity,enabledPermissions,false,(trx,context)=>routingOptions(trx,context)),{headers});
    if (write === "edit" && request.method === "GET") {
      const selector = workflowRunRequestSchema.safeParse({ workspaceId: query.workspaceId, id: url.searchParams.get("id"), version: Number(url.searchParams.get("version")) });
      if (!selector.success) return NextResponse.json({ error: "Invalid workflow." }, { status: 422, headers });
      return NextResponse.json(await readWorkflowEditData(database(), identity, enabledPermissions, selector.data), { headers });
    }
    if (!write) {
      return NextResponse.json(await readWorkflows(database(), identity, enabledPermissions, query), { headers });
    }
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 32000) return NextResponse.json({ error: "Workflow request is too large." }, { status: 413, headers });
    let body: unknown;
    try { body = JSON.parse(text); }
    catch { return NextResponse.json({ error: "Invalid workflow request." }, { status: 400, headers }); }
    const command = (write === "edit" ? workflowEditCommandSchema : write === "preview" ? workflowRunRequestSchema : write === "run" ? workflowRunConfirmSchema : write === "notifications" ? workflowNotificationsCommandSchema : workflowCommandSchema).safeParse(body);
    if (!command.success) return NextResponse.json({ error: "Check the workflow details and try again." }, { status: 422, headers });
    const service = write === "edit" ? editWorkflow : write === "preview" ? previewWorkflowRun : write === "run" ? confirmWorkflowRun : write === "notifications" ? changeWorkflowNotifications : changeWorkflow;
    return NextResponse.json(await service(database(), identity, enabledPermissions, command.data), { headers });
  } catch (error) {
    if (isWorkspaceSuspended(error)) return workspaceSuspendedResponse();
    if (error instanceof AuthorizationAccessError) return NextResponse.json({ error: "This workflow or workspace is unavailable." }, { status: 404, headers });
    if (error instanceof WorkflowDraftError) return NextResponse.json({ error: error.message }, { status: 422, headers });
    if (error instanceof WorkflowConflictError) return NextResponse.json({ error: error.message, code: "conflict" }, { status: 409, headers });
    return NextResponse.json({ error: "Workflows could not be loaded or updated. Try again." }, { status: 500, headers });
  }
}
