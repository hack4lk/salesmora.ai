'use client';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import {cancellationOpeningResultSchema,type CancellationOpeningResult} from '@salesmora/contracts';
import {ApiQueryScopeBoundary} from '../../api/api-query-provider';
import {apiReadOptions,invalidateWorkspaceResources} from '../../api/api-read-options';
import {useApiQuery} from '../../api/use-api-query';
import {apiRequest} from '../../api/api-request';
import {WorkflowCancellationOpening,type CancellationBookingReview} from './workflow-cancellation-opening';
export function WorkflowCancellationOpeningRoute(props:{viewerId:string;workspaceId:string;initial:CancellationOpeningResult;initialUpdatedAt:number}){
 return <ApiQueryScopeBoundary scope={{viewerId:props.viewerId,workspaceId:props.workspaceId}}><OpeningContent {...props}/></ApiQueryScopeBoundary>;
}
function OpeningContent({viewerId,workspaceId,initial,initialUpdatedAt}:{viewerId:string;workspaceId:string;initial:CancellationOpeningResult;initialUpdatedAt:number}){
 const router=useRouter(),client=useQueryClient(),scope={viewerId,workspaceId},[refreshing,setRefreshing]=useState(false),flight=useRef(false),receipt=useRef<{hash:string;id:string}>(undefined);
 const path=`/api/workflows/openings/${initial.opening.id}`,url=`${path}?workspace=${encodeURIComponent(workspaceId)}`;
 const query=useApiQuery({...apiReadOptions(scope,'workflow-opening',{id:initial.opening.id},url,raw=>cancellationOpeningResultSchema.parse(raw),'Could not load this opening.'),initialData:initial,initialDataUpdatedAt:initialUpdatedAt});
 const view=query.data??initial;
 async function refresh(){if(flight.current)return;setRefreshing(true);try{await query.refetch();}finally{setRefreshing(false);}}
 async function book(review:CancellationBookingReview){
  if(flight.current)return;flight.current=true;const hash=JSON.stringify(review);if(receipt.current?.hash!==hash)receipt.current={hash,id:crypto.randomUUID()};
  try{await apiRequest(path,{method:'POST',body:{workspaceId,requestId:receipt.current.id,...review},parse:raw=>raw,failureMessage:'Could not confirm this booking.'});
   await invalidateWorkspaceResources(client,workspaceId,['workflow-opening','calendar','calendar-visit','jobs','job-detail','notifications']);
   window.dispatchEvent(new Event('salesmora:notifications-refresh'));
  }catch(error){if(error&&typeof error==='object'&&'status' in error&&error.status===409)await query.refetch();throw error;}
  finally{flight.current=false;}
 }
 return <WorkflowCancellationOpening {...view} state={query.isError?'error':view.state} canRead={!(query.error&&'status' in query.error&&[401,403,404].includes(Number(query.error.status)))} refreshing={refreshing} onRefresh={()=>void refresh()} onBack={()=>router.push(`/workflows?workspace=${workspaceId}`)} onBook={book}/>;
}
