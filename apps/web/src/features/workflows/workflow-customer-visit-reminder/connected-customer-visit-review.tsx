'use client';
import { useEffect, useState } from 'react';
import { customerVisitOptionsSchema, type CustomerVisitOptions } from '@salesmora/contracts';
import { useAssistantResultRequest } from '../../assistant/use-assistant-result-request';
import { CustomerVisitReminderCard, type CustomerVisitReminderCardProps } from './workflow-customer-visit-reminder-card';
/** Canonical card with one scoped settings write; saving contacts sends no email. */
export function ConnectedCustomerVisitReview({workspaceId,setup,expiresAt,...props}:Omit<CustomerVisitReminderCardProps,'company'|'senderReady'|'emailSettingsHref'|'sample'> & {workspaceId:string;setup?:CustomerVisitOptions;expiresAt:string|null}){
 const [saved,setSaved]=useState<CustomerVisitOptions>();
 const [expired,setExpired]=useState(()=>!!expiresAt&&Date.parse(expiresAt)<=Date.now());
 const api=useAssistantResultRequest<CustomerVisitOptions>(workspaceId,'workflow-customer-visit-options','Could not save company contact details.');
 useEffect(()=>{if(!expiresAt||expired)return;let timer:ReturnType<typeof setTimeout>;const check=()=>{const delay=Date.parse(expiresAt)-Date.now();if(!Number.isFinite(delay)||delay<=0)setExpired(true);else timer=setTimeout(check,Math.min(delay,2147483647));};check();return()=>clearTimeout(timer);},[expiresAt,expired]);
 const data=saved??setup;
 return <CustomerVisitReminderCard {...props} state={expired&&props.state==='draft'?'expired':props.state} company={data?.company??{name:'',phone:'',email:''}} companyVersion={data?.company.version} companySetupAccess={data?.canConfigureCompany??false} senderReady={data?.senderReady??false}
   emailSettingsHref={`/settings/work-orders?workspace=${workspaceId}`} sample={{customerName:'Example customer',email:'customer@example.test',date:'Example visit date',arrivalWindow:'9 AM – 11 AM'}}
   onSaveCompany={data?.canConfigureCompany?async value=>{const result=await api.write(`/api/workflows/customer-visit-options?workspace=${workspaceId}`,{action:'company',...value},customerVisitOptionsSchema.parse,new AbortController().signal,true);setSaved(result);}:undefined}/>;
}
