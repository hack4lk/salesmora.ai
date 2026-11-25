import { expect, it } from 'vitest';
import { renderPostJobThankYou } from './post-job-thank-you';
const input={baseURL:'http://127.0.0.1:3000',token:'a'.repeat(43),company:'Example & Co',phone:'555-010-0100',email:'office@example.test',name:'<Customer>',message:'Thank you <again>!\nWe appreciate your business.',reviewUrl:''};
it('brands and escapes custom text with a purpose-specific confirmed opt-out',()=>{
 const mail=renderPostJobThankYou(input);expect(mail.html).toContain('cid:salesmora-logo');expect(mail.html).toContain('&lt;again&gt;');expect(mail.html).toContain('&lt;Customer&gt;');expect(mail.text).toContain('call 555-010-0100 or email office@example.test');expect(mail.text).toContain('/thank-you-emails/unsubscribe?token=');expect(mail.text).not.toMatch(/reply to/i);expect(mail.text).not.toContain('Leave a review');expect(mail.text).not.toContain('hear about your experience');
});
it('adds only the explicitly supplied external review destination',()=>{
 const mail=renderPostJobThankYou({...input,reviewUrl:'https://example.test/review?a=1&b=2'});expect(mail.html).toContain('href="https://example.test/review?a=1&amp;b=2"');expect(mail.text).toContain('Leave a review');
 for(const patch of [{token:'bad'},{baseURL:'javascript:alert(1)'},{reviewUrl:'http://example.test'}])expect(()=>renderPostJobThankYou({...input,...patch})).toThrow();
});
