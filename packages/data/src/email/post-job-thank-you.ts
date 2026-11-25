import { postJobReviewUrlSchema } from '@salesmora/contracts';
import { appOrigin, brandedWorkflowEmail } from './branded-workflow';
export function renderPostJobThankYou(input:{baseURL:string;token:string;company:string;phone:string;email:string;name:string;message:string;reviewUrl:string}) {
  if(!/^[A-Za-z0-9_-]{43}$/.test(input.token))throw Error('Invalid unsubscribe token.');
  const reviewUrl=postJobReviewUrlSchema.parse(input.reviewUrl);
  const url=new URL('/thank-you-emails/unsubscribe',appOrigin(input.baseURL));url.searchParams.set('token',input.token);
  return brandedWorkflowEmail({subject:`Thank you for choosing ${input.company}`.replace(/[\r\n]/g,' '),
    body:`Hi ${input.name},\n\n${input.message}${reviewUrl?'\n\nWe’d love to hear about your experience.':''}\n\nIf you need anything else, call ${input.phone} or email ${input.email}.\n\n${input.company}`,
    ...(reviewUrl?{action:{label:'Leave a review',url:reviewUrl}}:{}),footerLabel:'Stop thank-you and review emails',footerURL:url.href},'cid:salesmora-logo');
}
