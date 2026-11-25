import {emailBrandData as brand} from './email-brand.data';
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function appOrigin(baseURL:string){const url=new URL(baseURL);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('Invalid app origin.');return url.origin;}
/** Same approved palette and embedded logo as existing notification emails. */
export function brandedWorkflowEmail(input:{subject:string;body:string;footerLabel:string;footerURL:string;action?:{label:string;url:string}},logoSrc:string){
 const action=input.action;
 return {subject:input.subject,text:['SalesMora.ai',input.subject,input.body,...(action?[action.label,action.url]:[]),input.footerLabel,input.footerURL].join('\n\n'),
 html:`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(input.subject)}</title></head>
<body style="margin:0;background:${brand.canvas};color:${brand.ink};font-family:${brand.font};line-height:1.5;overflow-wrap:anywhere"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;max-width:${brand.contentWidth}px;background:${brand.paper};border:1px solid ${brand.line};border-radius:16px"><tr><td style="padding:24px"><main>
<img src="${escape(logoSrc)}" alt="SalesMora.ai" width="${brand.logoWidth}" height="${brand.logoHeight}" style="display:block;width:${brand.logoWidth}px;max-width:100%;height:auto;margin:0 0 24px">
<h1 style="margin:0 0 24px;font-size:28px;line-height:1.2;overflow-wrap:anywhere">${escape(input.subject)}</h1><p style="margin:0 0 24px;overflow-wrap:anywhere;word-break:break-word">${escape(input.body).replace(/\r?\n/g,'<br>')}</p>
${action?`<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr><td bgcolor="${brand.primary}" style="border-radius:8px"><a href="${escape(action.url)}" style="display:inline-block;padding:12px 24px;background:${brand.primary};color:${brand.paper};border:1px solid ${brand.primary};border-radius:8px;font-weight:bold;text-decoration:none">${escape(action.label)}</a></td></tr></table>`:''}
<hr style="border:0;border-top:1px solid ${brand.line};margin:0 0 24px"><p style="margin:0;font-size:14px"><a href="${escape(input.footerURL)}" style="color:${brand.primary};overflow-wrap:anywhere">${escape(input.footerLabel)}</a></p>
${action?`<p style="margin:16px 0 0;color:${brand.muted};font-size:14px">If the button does not work, copy and paste this link into your browser:</p><p style="margin:8px 0 0;font-size:14px;word-break:break-all"><a href="${escape(action.url)}" style="color:${brand.primary}">${escape(action.url)}</a></p>`:''}
</main></td></tr></table></td></tr></table></body></html>`};
}
