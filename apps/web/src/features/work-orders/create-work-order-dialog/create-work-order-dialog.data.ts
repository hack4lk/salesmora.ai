export const titleLimit=120;
export const copy={
 title:'Add work order',
 description:'Create a draft for the crew. You can add tasks, materials and instructions next.',
 job:'Job',
 customer:'Customer',
 address:'Address',
 titleLabel:'Title',
 titlePlaceholder:'e.g. Water heater replacement',
 assignee:'Primary assignee',
 unassigned:'Leave unassigned',
 assigneeHint:'Defaults to the job owner. You can change it later.',
 start:'Start from',
 blank:'Blank work order',
 sourceHint:{blank:'An empty draft with the job details filled in.',duplicate:'Copies tasks, materials and instructions. Progress, photos and sign-off are not copied.',estimate:'Copies line items as tasks and materials without prices. Review before issuing.'},
 draftNote:'The work order is created as a draft. The crew cannot see it until you issue it.',
 create:'Create draft',
 counter:(used:number,max:number)=>`${used} of ${max} characters`,
 noPermission:'You do not have permission to add work orders.',
 jobClosed:'This job is closed. New work orders cannot be added.'
};
