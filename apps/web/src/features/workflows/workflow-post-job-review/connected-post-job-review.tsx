'use client';
import { useEffect, useState } from 'react';
import { defaultPostJobMessage, type CustomerVisitOptions } from '@salesmora/contracts';
import { PostJobReviewCard, type PostJobReviewCardProps } from './workflow-post-job-review-card';
export function ConnectedPostJobReview({workspaceId,setup,expiresAt,...props}:Omit<PostJobReviewCardProps,'company'|'senderReady'|'emailSettingsHref'|'customer'|'defaultMessage'> & {workspaceId:string;setup?:CustomerVisitOptions;expiresAt:string|null}) {
  const [expired,setExpired]=useState(()=>!!expiresAt&&Date.parse(expiresAt)<=Date.now());
  useEffect(()=>{if(!expiresAt||expired)return;let timer:ReturnType<typeof setTimeout>;const check=()=>{const delay=Date.parse(expiresAt)-Date.now();if(!Number.isFinite(delay)||delay<=0)setExpired(true);else timer=setTimeout(check,Math.min(delay,2147483647));};check();return()=>clearTimeout(timer);},[expiresAt,expired]);
  return <PostJobReviewCard {...props} state={expired&&props.state==='draft'?'expired':props.state} defaultMessage={defaultPostJobMessage} company={setup?.company??{name:'',phone:'',email:''}} senderReady={setup?.senderReady??false} companySetupAccess={setup?.canConfigureCompany??false}
    customer={{name:'Example customer',email:'customer@example.test'}} emailSettingsHref={`/settings/work-orders?workspace=${workspaceId}`}/>;
}
