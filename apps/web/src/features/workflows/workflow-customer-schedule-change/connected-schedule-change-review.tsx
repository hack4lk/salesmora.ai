'use client';
import type { CustomerVisitOptions } from '@salesmora/contracts';
import { CustomerScheduleChangeCard, type ScheduleChangeCardProps } from './workflow-customer-schedule-change-card';
import { scheduleChangeExamples } from './customer-schedule-change.fixtures';
/** Reuses the approved card and a single cached, authorized sender/contact setup projection. */
export function ConnectedScheduleChangeReview({workspaceId,setup,...props}:Omit<ScheduleChangeCardProps,'company'|'senderReady'|'emailSettingsHref'|'examples'> & {workspaceId:string;setup?:CustomerVisitOptions}){
 return <CustomerScheduleChangeCard {...props} company={setup?.company??{name:'',phone:'',email:''}} senderReady={setup?.senderReady??false} companySetupAccess={setup?.canConfigureCompany??false} examples={scheduleChangeExamples} emailSettingsHref={`/settings/work-orders?workspace=${workspaceId}`}/>;
}
