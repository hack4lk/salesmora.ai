export const copy={
 title:'Work orders',
 add:'Add work order',
 empty:'No work orders yet. Add one to give the crew tasks, materials and a sign-off.',
 emptyReadOnly:'No work orders for this job.',
 open:(number:string,title:string)=>`Open ${number}: ${title}`,
 progress:(done:number,total:number)=>`${done}/${total} tasks`,
 unassigned:'Unassigned',
 overdue:'Overdue',
 notScheduled:'Not scheduled',
 summary:(open:number,done:number)=>`${open} open · ${done} completed`,
 allDone:'All work orders are completed. You can complete this job.',
 allDoneHint:'Completing the last work order only suggests completing the job.',
 info:'Work orders carry the crew tasks, materials and sign-off. They never show prices.',
 viewAll:'View all work orders',
 jobClosed:'This job is closed. New work orders cannot be added.'
};
