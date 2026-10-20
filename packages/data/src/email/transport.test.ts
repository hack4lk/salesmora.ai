import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('nodemailer',()=>({default:{createTransport:()=>({verify:vi.fn(),sendMail:vi.fn()})}}));
import { sendEmail } from './transport';
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe('shared assignment email transport',()=>{
  it('uses a stable provider idempotency header without adding internal metadata to the message',async()=>{
    vi.stubEnv('EMAIL_PROVIDER','resend');vi.stubEnv('EMAIL_FROM','SalesMora <no-reply@example.test>');vi.stubEnv('RESEND_API_KEY','fictional-test-key');
    const fetcher=vi.fn<typeof fetch>(async()=>new Response(JSON.stringify({id:'fictional-message'}),{status:200}));vi.stubGlobal('fetch',fetcher);
    await sendEmail({to:'recipient@example.test',subject:'Assigned',text:'Example',html:'<p>Example</p>',idempotencyKey:'lead-assigned-test'},'https://app.example.test');
    const options=fetcher.mock.calls[0]![1] as RequestInit;
    expect(options.headers).toMatchObject({'Idempotency-Key':'lead-assigned-test'});
    const body=JSON.parse(options.body as string);expect(body.to).toEqual(['recipient@example.test']);expect(body).not.toHaveProperty('idempotencyKey');
  });
  it('rejects external origins with local transport and masks provider response details',async()=>{
    vi.stubEnv('EMAIL_PROVIDER','mailpit');await expect(sendEmail({to:'recipient@example.test',subject:'Assigned',text:'Example',html:''},'https://app.example.test')).rejects.toThrow('not configured');
    vi.stubEnv('EMAIL_PROVIDER','resend');vi.stubEnv('EMAIL_FROM','SalesMora <no-reply@example.test>');vi.stubEnv('RESEND_API_KEY','fictional-test-key');
    vi.stubGlobal('fetch',vi.fn(async()=>({ok:false,text:async()=>'sensitive-provider-body'})));
    await expect(sendEmail({to:'recipient@example.test',subject:'Assigned',text:'Example',html:''},'https://app.example.test')).rejects.toThrow('temporarily unavailable');
  });
});
