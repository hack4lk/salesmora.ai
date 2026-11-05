import { expect, it } from 'vitest';
import type { CaptureDetailView } from '@salesmora/contracts';
import { captureReviewFrom } from './capture-review-adapter';
import { captureInitialConfiguration } from './capture-adapters';
const business = { businessName:'Fixture', businessEmail:'', businessPhone:'', services:[], serviceArea:'', timezone:'America/New_York', gmailAccess:'upgrade-required' as const, teammates:[] };
const view: CaptureDetailView = { canEdit:true, policyRevision:1, business, detail:{ source:{ id:'00000000-0000-4000-8000-000000000001', workspaceId:'00000000-0000-4000-8000-000000000002', name:'Source',type:'website',version:1,status:'draft',block:'none',approvedVersion:null,draftVersion:1,lastActivityAt:null,scheduledAt:null,timezone:null,metrics:{captured:0,approved:0,awaitingReview:0}},approved:null,draft:{id:'00000000-0000-4000-8000-000000000003',version:1,baseApprovedVersion:null,configuration:captureInitialConfiguration('website',business)}} };
const review = { sourceId:view.detail.source.id,sourceVersion:1,draftVersion:1,baseApprovedVersion:null,configurationVersion:1,canActivate:true,ready:false,plan:'free' as const,used:0,limit:1,pending:null,checks: (['configuration','fields','workflow','access','capacity','delivery','permission','pending','workspace'] as const).map(code=>({code,ready:code!=='delivery'&&code!=='workflow'})) };
it('shows distinct server-derived field/capacity successes and workflow/delivery failures',()=>{
 const result=captureReviewFrom(view,review); expect(result.checks.find(check=>check.id==='fields')?.status).toBe('ready'); expect(result.checks.find(check=>check.id==='capacity')?.detail).toContain('0 of 1'); expect(result.checks.find(check=>check.id==='workflow')?.status).toBe('blocked'); expect(result.checks.find(check=>check.id==='source')?.detail).toContain('delivery is not enabled');
});
it('does not reuse checks after draft/source changes or from another source',()=>{
 for(const stale of [{...review,sourceVersion:2},{...review,draftVersion:2},{...review,sourceId:'another-source'}]) expect(captureReviewFrom(view,stale).checks.every(check=>check.status==='checking')).toBe(true);
});
