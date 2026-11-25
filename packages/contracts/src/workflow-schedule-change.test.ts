import { expect, it } from 'vitest';
import { workflowPrepareSchema, workflowDefinitionSchema, workflowPublishDecisionSchema } from './workflows';
it('prepares fixed five-minute email-only changes idempotently',()=>{
 const input={kind:'customer_schedule_change',operation:'create',name:null,businessDays:null,recipient:'me',localTime:null,notifications:null};
 const first=workflowPrepareSchema.parse(input);expect(first.name).toBe('Customer schedule-change notices');expect(first.notifications).toEqual({inApp:false,email:true});expect(workflowPrepareSchema.parse(first)).toEqual(first);
 for(const patch of [{localTime:'09:00'},{businessDays:2},{notifications:{inApp:true,email:true}},{recipient:'Other teammate'}])expect(workflowPrepareSchema.safeParse({...input,...patch}).success).toBe(false);
});
it('rejects invented timing, channels and editable template fields',()=>{
 const definition={kind:'customer_schedule_change',quietMinutes:5,maxBurstMinutes:15,recipientId:'owner',recipientName:'Owner',timezone:'America/New_York',notifications:{inApp:false,email:true}};
 expect(workflowDefinitionSchema.safeParse(definition).success).toBe(true);
 for(const patch of [{quietMinutes:0},{maxBurstMinutes:60},{localTime:'09:00'},{notifications:{inApp:true,email:true}},{template:'invented'}])expect(workflowDefinitionSchema.safeParse({...definition,...patch}).success).toBe(false);
 const decision={workspaceId:'00000000-0000-4000-8000-000000000001',id:'00000000-0000-4000-8000-000000000002',inputHash:'a'.repeat(64),decision:'confirm',scheduleChangeValues:{name:'Visit changes'}};
 expect(workflowPublishDecisionSchema.safeParse(decision).success).toBe(true);expect(workflowPublishDecisionSchema.safeParse({...decision,scheduleChangeValues:{name:'Visit changes',quietMinutes:0}}).success).toBe(false);
});
