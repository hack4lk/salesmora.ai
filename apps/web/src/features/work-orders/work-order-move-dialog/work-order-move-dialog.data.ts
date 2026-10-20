export const reasonLimit=500;
export const copy={
 title:(number:string)=>`Change status of ${number}`,description:'Review the change before it is applied. The crew and office see it right away.',
 current:'Current status',target:'Move to',reason:'Reason for canceling',reasonCount:(n:number,max:number)=>`${n} of ${max} characters`,
 confirm:{issued:'Issue to crew','in-progress':'Start work',completed:'Continue to completion',canceled:'Cancel work order',draft:'Move to draft'},
 hints:{
  issued:'The crew can see this work order once it is issued. The assignee is notified.',
  'in-progress':'Marks the work as started on site.',
  completed:'Completing needs a summary and, if your workspace requires it, a customer signature. This opens the completion form on the work order.',
  canceled:'Canceling keeps the record but removes it from the crew\u2019s list. It cannot be undone from the board.',
  draft:'',
 },
 noAssignee:'No assignee is set, so nobody will be notified.',
 openTasks:(n:number)=>`${n} ${n===1?'task is':'tasks are'} still open.`,
 none:'No status changes are available for this work order.',
};
