import { expect, it } from 'vitest';
import { renderCustomerVisitReminder } from './customer-visit-reminder';
const input={baseURL:'http://127.0.0.1:3000',token:'a'.repeat(43),company:'Example & Co',phone:'555-010-0142',email:'office@example.test',name:'<Customer>',date:'2027-03-15',arrivalWindow:'09:00-11:00',timezone:'America/New_York'};
it('renders branded customer-safe reminders with contact instructions and a distinct operational opt-out',()=>{
 const mail=renderCustomerVisitReminder(input);
 expect(mail.text).toContain('March 15, 2027');expect(mail.text).toContain('9 AM – 11 AM');expect(mail.text).toContain('call 555-010-0142 or email office@example.test');
 expect(mail.html).toContain('cid:salesmora-logo');expect(mail.html).toContain('&lt;Customer&gt;');expect(mail.html).toContain('Example &amp; Co');
 expect(mail.text).toContain('/visit-reminders/unsubscribe?');expect(mail.text).not.toContain('/jobs/');expect(mail.text).not.toMatch(/reply to/i);
});
it('rejects malformed opt-out tokens and unsafe app origins',()=>{
 expect(()=>renderCustomerVisitReminder({...input,token:'bad'})).toThrow();expect(()=>renderCustomerVisitReminder({...input,baseURL:'javascript:alert(1)'})).toThrow();
});
