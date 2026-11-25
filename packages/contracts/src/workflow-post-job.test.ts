import { expect, it } from 'vitest';
import { defaultPostJobMessage, postJobValuesSchema } from './workflow-post-job';
import { workflowPrepareSchema, workflowDefinitionSchema } from './workflows';
it('prepares email-only future follow-up with an idempotent tool shape',()=>{
 const input={operation:'create',kind:'post_job_thank_you',name:null,businessDays:null,recipient:'me',notifications:null,postJobRules:null};
 const first=workflowPrepareSchema.parse(input);expect(first.name).toBe('Post-job thank-you');expect(first.notifications).toEqual({inApp:false,email:true});expect(workflowPrepareSchema.parse(first)).toEqual(first);
 expect(workflowPrepareSchema.safeParse({...input,notifications:{inApp:true,email:true}}).success).toBe(false);
});
it('requires an explicit wording choice to publish and validates optional destinations',()=>{
 const value={name:'Thanks',calendarDays:2,localTime:'09:00',reviewUrl:'',messageChoice:'default',thankYouMessage:defaultPostJobMessage};
 expect(postJobValuesSchema.safeParse(value).success).toBe(true);
 for(const reviewUrl of ['http://example.test','javascript:alert(1)','https://user:password@example.test'])expect(postJobValuesSchema.safeParse({...value,reviewUrl}).success).toBe(false);
 expect(postJobValuesSchema.safeParse({...value,reviewUrl:'https://example.test/review?a=1&b=2'}).success).toBe(true);
 for(const patch of [{messageChoice:null},{calendarDays:0},{calendarDays:31},{thankYouMessage:'   '},{thankYouMessage:'a'.repeat(2001)},{localTime:'25:00'}])expect(postJobValuesSchema.safeParse({...value,...patch}).success).toBe(false);
 const {name,localTime,...rules}=value;expect(workflowDefinitionSchema.safeParse({kind:'post_job_thank_you',localTime,rules,timezone:'America/New_York',recipientId:'owner',recipientName:name,notifications:{inApp:false,email:true}}).success).toBe(true);
});
