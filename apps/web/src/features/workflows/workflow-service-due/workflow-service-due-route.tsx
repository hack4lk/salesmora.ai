'use client';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import {serviceDuePageSchema,serviceEmailReviewSchema,serviceEmailTextSchema,serviceDueSavedSchema,serviceEmailResultsSchema,type ServiceDuePage} from '@salesmora/contracts';
import {ApiQueryScopeBoundary} from '../../api/api-query-provider';
import {apiReadOptions,invalidateWorkspaceResources} from '../../api/api-read-options';
import {useApiQuery} from '../../api/use-api-query';
import {apiRequest} from '../../api/api-request';
import {WorkflowServiceDueList,type WorkflowServiceDueListProps} from './workflow-service-due-list';
type Props={viewerId:string;workspaceId:string;initial:ServiceDuePage;initialUpdatedAt:number;canGenerate:boolean};
export function WorkflowServiceDueRoute(props:Props){return <ApiQueryScopeBoundary scope={{viewerId:props.viewerId,workspaceId:props.workspaceId}}><DueContent key={`${props.viewerId}:${props.workspaceId}:${props.initial.workflowId}`} {...props}/></ApiQueryScopeBoundary>;}
function DueContent({viewerId,workspaceId,initial,initialUpdatedAt,canGenerate}:Props){
 const router=useRouter(),client=useQueryClient(),[page,setPage]=useState(initial.page),[pageSize,setPageSize]=useState(initial.pageSize),[templateConflict,setTemplateConflict]=useState(false),receipt=useRef(new Map<string,string>()),lock=useRef(false);
 const path=`/api/workflows/services/${initial.workflowId}`,url=`${path}?workspace=${workspaceId}&page=${page}&pageSize=${pageSize}`,scope={viewerId,workspaceId};
 const query=useApiQuery({...apiReadOptions(scope,'service-due',{id:initial.workflowId,page,pageSize,filter:'active'},url,raw=>serviceDuePageSchema.parse(raw),'Could not load service reminders.'),initialData:page===initial.page&&pageSize===initial.pageSize?initial:undefined,initialDataUpdatedAt:initialUpdatedAt});
 const view=query.data??initial,denied=!!query.error&&'status'in query.error&&[401,403,404].includes(Number(query.error.status));
 async function write<T>(command:unknown,parse:(raw:unknown)=>T,refresh=true){if(lock.current)throw Error('A change is still pending.');lock.current=true;const hash=JSON.stringify({command,company:view.company});let requestId=receipt.current.get(hash);if(!requestId){requestId=crypto.randomUUID();receipt.current.set(hash,requestId);}
  try{const result=await apiRequest(path,{method:'POST',body:{workspaceId,requestId,command},parse,failureMessage:'Could not save this service reminder change.'});if(refresh){await invalidateWorkspaceResources(client,workspaceId,['service-due','notifications','work-order-settings']);window.dispatchEvent(new Event('salesmora:notifications-refresh'));}return result;}
  catch(error){if(error&&typeof error==='object'&&'status'in error&&error.status===409){setTemplateConflict(true);await query.refetch();}throw error;}finally{lock.current=false;}
 }
 const saveCompany:NonNullable<WorkflowServiceDueListProps['onSaveCompany']>=async input=>{await write({action:'company',...input},serviceDueSavedSchema.parse);};
 return <WorkflowServiceDueList {...view} canRead={!denied} state={query.isError?'error':query.isPending?'loading':'ready'} rows={query.isError||query.isPending?[]:view.rows} templateConflict={templateConflict} canGenerate={canGenerate} onSaveCompany={saveCompany}
  pagination={{total:view.total,page,pageSize,onPageChange:setPage,onPageSizeChange:size=>{setPageSize(size as 25|50|100);setPage(1);},disabled:query.isFetching}}
  onRetry={()=>void query.refetch()} onReloadTemplate={()=>{void query.refetch().then(()=>setTemplateConflict(false));}} onBack={()=>router.push(`/workflows?workspace=${workspaceId}`)} onOpenCustomer={row=>router.push(`/customers/${row.customerId}?workspace=${workspaceId}`)} onOpenJob={row=>router.push(`/jobs/${row.jobId}?workspace=${workspaceId}`)} onOpenExistingJob={row=>{if(row.activeJob)router.push(`/jobs/${row.activeJob.id}?workspace=${workspaceId}`);}}
  onResolve={async input=>{await write({action:'resolve',cycleId:input.cycleId,expectedVersion:input.expectedVersion,resolution:input.action,...(input.date?{date:input.date}:{})},serviceDueSavedSchema.parse);}}
  onGenerate={input=>write({action:'generate',...input},serviceEmailTextSchema.parse,false)} onSaveTemplate={async input=>{await write({action:'template',...input},serviceDueSavedSchema.parse);}}
  onPrepareEmails={input=>write({action:'prepare',...input},serviceEmailReviewSchema.parse,false)} onReviseEmails={input=>write({action:'revise',...input},serviceEmailReviewSchema.parse,false)} onSendEmails={input=>write({action:'send',...input},serviceEmailResultsSchema.parse)}/>;
}
