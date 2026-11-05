import { expect, it } from 'vitest';
import { capturePublishCommandSchema, capturePublicationReviewSchema } from './publication';
const id='00000000-0000-4000-8000-000000000001';
const command={workspaceId:id,sourceId:id,requestId:id,expectedVersion:1,draftVersion:1,configurationVersion:1,baseApprovedVersion:null,confirmed:true,timing:{kind:'now'}};
it('requires explicit confirmation and rejects client authority/configuration',()=>{
 expect(capturePublishCommandSchema.safeParse(command).success).toBe(true);
 for(const altered of [{...command,confirmed:false},{...command,actorId:'forged'},{...command,configuration:{}},{...command,readiness:{ready:true}},{...command,baseApprovedVersion:0}])expect(capturePublishCommandSchema.safeParse(altered).success).toBe(false);
});
it('requires an exact instant and recognized business timezone for scheduling',()=>{
 expect(capturePublishCommandSchema.safeParse({...command,timing:{kind:'scheduled',at:'2026-11-03T14:00:00.000Z',timezone:'America/New_York'}}).success).toBe(true);
 expect(capturePublishCommandSchema.safeParse({...command,timing:{kind:'scheduled',at:'tomorrow',timezone:'local'}}).success).toBe(false);
});
it('review projections expose checked capacity and readiness without transport URLs',()=>{
 const review={sourceId:id,sourceVersion:1,draftVersion:1,baseApprovedVersion:null,configurationVersion:1,canActivate:true,ready:false,plan:'free',used:1,limit:1,checks:[{code:'delivery',ready:false}],pending:null};
 expect(capturePublicationReviewSchema.safeParse(review).success).toBe(true);
 expect(capturePublicationReviewSchema.safeParse({...review,publicURL:'https://example.test'}).success).toBe(false);
});
