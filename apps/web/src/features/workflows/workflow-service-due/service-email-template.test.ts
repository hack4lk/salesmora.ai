import {expect,it} from 'vitest';
import {previewServiceEmail,validServiceEmail} from './service-email-template';
import {dueCustomers,dueTemplate} from './workflow-service-due.fixtures';
it('personalizes only approved fields and uses a neutral greeting when a personal name is unknown',()=>{
 expect(previewServiceEmail(dueTemplate,'Gutter cleaning',{...dueCustomers[0],firstName:null}).body).toContain('Hi there,');
 expect(previewServiceEmail(dueTemplate,'Gutter cleaning',dueCustomers[0]).subject).toBe('Time for your next Gutter cleaning?');
});
it('rejects unknown or unfinished fields and header newlines before a shared draft is saved',()=>{
 expect(validServiceEmail(dueTemplate)).toBe(true);
 for(const subject of ['Reminder {Price}','Reminder {First name','Reminder\nBcc: someone@example.test',''])expect(validServiceEmail({...dueTemplate,subject})).toBe(false);
});
it('does not interpret customer text as additional merge fields or change saved customer facts',()=>{
 const customer={...dueCustomers[0],firstName:'{Service}'};
 expect(previewServiceEmail(dueTemplate,'Gutter cleaning',customer).body).toContain('Hi {Service},');
 expect(customer.firstName).toBe('{Service}');
});
