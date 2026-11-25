import { expect, it } from 'vitest';
import { renderCustomerScheduleChange } from './customer-schedule-change';
const input={baseURL:'http://127.0.0.1:3000',token:'a'.repeat(64),company:'Example & Co',phone:'555-010-0100',email:'office@example.test',name:'<Customer>',timezone:'America/New_York',snapshot:{before:{date:'2026-11-27',arrivalWindow:'09:00-11:00'},after:{date:'2026-11-30',arrivalWindow:'13:00-15:00'}}};
it('renders isolated, branded before/after information and a distinct operational opt-out',()=>{
 const mail=renderCustomerScheduleChange(input);expect(mail.html).toContain('cid:salesmora-logo');expect(mail.html).toContain('&lt;Customer&gt;');expect(mail.text).toContain('Previously:');expect(mail.text).toContain('Now:');expect(mail.text).toContain('1 PM – 3 PM');expect(mail.text).toContain('call 555-010-0100 or email office@example.test');expect(mail.text).toContain('/schedule-change-emails/unsubscribe?token=');expect(mail.text).not.toMatch(/reply to|\/jobs\//i);
});
it('uses removed-schedule language and an explicit unknown-window fallback',()=>{
 const removed=renderCustomerScheduleChange({...input,snapshot:{...input.snapshot,after:null}});expect(removed.subject).toContain('no longer scheduled');expect(removed.text).not.toMatch(/job.*cancel|Now:/i);
 const unknown=renderCustomerScheduleChange({...input,snapshot:{...input.snapshot,after:{date:'2026-11-30',arrivalWindow:null}}});expect(unknown.text).toContain('Arrival window to be confirmed');
 expect(()=>renderCustomerScheduleChange({...input,token:'bad'})).toThrow();expect(()=>renderCustomerScheduleChange({...input,baseURL:'javascript:alert(1)'})).toThrow();
});
