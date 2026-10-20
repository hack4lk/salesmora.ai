import type {WorkOrderCapabilities,WorkOrderView,WorkOrderInstructions,WorkOrderMember,WorkOrderAssignment,WorkOrderContact,WorkOrderPhoto,WorkOrderCompletion,WorkOrderPrintData,JobWorkOrderRow,CreateWorkOrderJob,CreateWorkOrderSourceOption} from './work-order-preview.types';
export const workOrderPreviewData={workspace:'Harbor Home Services work orders',longTitle:'Whole-home plumbing repipe, water heater relocation, fixture replacement and final inspection walkthrough with the homeowner'};
export const officeCapabilities:WorkOrderCapabilities={update:true,issue:true,start:true,progress:true,complete:true,cancel:true,reopen:true,archive:true,remove:true,print:true,duplicate:true};
export const crewCapabilities:WorkOrderCapabilities={update:false,issue:false,start:true,progress:true,complete:true,cancel:false,reopen:false,archive:false,remove:false,print:true,duplicate:false};
export const readOnlyCapabilities:WorkOrderCapabilities={update:false,issue:false,start:false,progress:false,complete:false,cancel:false,reopen:false,archive:false,remove:false,print:true,duplicate:false};
const base={customerName:'Priya Shah',address:'41 Cedar Lane, Brooklyn, NY 11201',jobId:'job-1040',jobNumber:'J-1040',crewNames:['Jamie Cole'],archived:false,updatedAt:'2026-10-18',changedAfterIssue:false,overdue:false,capabilities:officeCapabilities};
export const workOrderFixtures:WorkOrderView[]=[
 {...base,id:'wo-1013',number:'WO-1013',title:'Kitchen finish and punch list',status:'draft',customerName:'Lena Ortiz',jobId:'job-1038',jobNumber:'J-1038',assigneeName:null,crewNames:[],scheduledDate:null,scheduledWindow:null,tasksDone:0,tasksTotal:5},
 {...base,id:'wo-1012',number:'WO-1012',title:'Kitchen demo and cabinet install',status:'issued',customerName:'Lena Ortiz',jobId:'job-1038',jobNumber:'J-1038',assigneeName:'Sam Rivera',scheduledDate:'2026-10-21',scheduledWindow:'09:00-11:00',tasksDone:0,tasksTotal:7},
 {...base,id:'wo-1011',number:'WO-1011',title:'Water heater replacement',status:'in-progress',assigneeName:'Sam Rivera',scheduledDate:'2026-10-19',scheduledWindow:'09:00-11:00',tasksDone:3,tasksTotal:6,changedAfterIssue:true},
 {...base,id:'wo-1009',number:'WO-1009',title:'Electrical panel rough-in',status:'in-progress',customerName:'Noah Patel',jobId:'job-1036',jobNumber:'J-1036',assigneeName:'Jamie Cole',crewNames:[],scheduledDate:'2026-10-16',scheduledWindow:null,tasksDone:5,tasksTotal:8,overdue:true},
 {...base,id:'wo-1008',number:'WO-1008',title:'Bathroom tile phase',status:'completed',customerName:'Chris Wu',jobId:'job-1032',jobNumber:'J-1032',assigneeName:'Sam Rivera',scheduledDate:'2026-10-14',scheduledWindow:null,tasksDone:6,tasksTotal:6},
 {...base,id:'wo-1006',number:'WO-1006',title:'Drain cleaning',status:'canceled',customerName:'Ivy Park',jobId:'job-1021',jobNumber:'J-1021',assigneeName:'Sam Rivera',crewNames:[],scheduledDate:'2026-10-08',scheduledWindow:null,tasksDone:0,tasksTotal:3},
];
export const workOrderTaskFixtures:{id:string;title:string;tasks:import('./work-order-preview.types').WorkOrderTask[]}[]=[
 {id:'mixed',title:'In progress',tasks:[
  {id:'t1',label:'Shut off water and drain tank',required:true,done:true,doneByName:'Sam Rivera',doneAt:'2026-10-19T09:20:00'},
  {id:'t2',label:'Remove old water heater',required:true,done:true,doneByName:'Sam Rivera',doneAt:'2026-10-19T09:55:00'},
  {id:'t3',label:'Install new unit and connect lines',required:true,done:false,doneByName:null,doneAt:null},
  {id:'t4',label:'Check for leaks and test pressure',required:true,done:false,doneByName:null,doneAt:null},
  {id:'t5',label:'Haul away old unit',required:false,done:false,doneByName:null,doneAt:null}]},
 {id:'allDone',title:'All done',tasks:[
  {id:'a1',label:'Demo old cabinets',required:true,done:true,doneByName:'Jamie Cole',doneAt:'2026-10-14T10:00:00'},
  {id:'a2',label:'Install new cabinets',required:true,done:true,doneByName:'Jamie Cole',doneAt:'2026-10-14T14:30:00'}]},
 {id:'empty',title:'Empty',tasks:[]}];
export const workOrderMaterialFixtures:import('./work-order-preview.types').WorkOrderMaterial[]=[
 {id:'m1',imageUrl:'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="%23c97b3c"/></svg>',catalogId:'c1',name:'50-gallon water heater',quantity:1,unit:'each',status:'used',note:'',customerPriceCents:69900,costCents:48000},
 {id:'m2',imageUrl:'',catalogId:'c2',name:'3/4 in copper pipe',quantity:10,unit:'ft',status:'on-hand',note:'Truck stock',customerPriceCents:600,costCents:310},
 {id:'m3',imageUrl:'',catalogId:'c3',name:'Dielectric unions',quantity:2,unit:'each',status:'ordered',note:'Pickup at supply house by 8am',customerPriceCents:1400,costCents:650},
 {id:'m4',imageUrl:'',catalogId:null,name:'Custom wall bracket',quantity:1,unit:'each',status:'needed',note:'',customerPriceCents:null,costCents:null}];
export const materialAccess={crew:{prices:false,costs:false},office:{prices:true,costs:false},owner:{prices:true,costs:true}};
export const workOrderInstructionFixtures:Record<'full'|'empty'|'safetyOnly',WorkOrderInstructions>={
 full:{instructions:'Replace the 40-gallon water heater in the basement utility room.\n\nKeep the existing gas line and update the shut-off valve. Test for leaks before leaving.',accessNotes:'Side gate code is 4821. Park in the driveway. The customer has a dog that stays upstairs.',safetyNotes:'Shut off gas and water before disconnecting. Wear gloves and eye protection. Ventilate the room when soldering.'},
 empty:{instructions:'',accessNotes:'',safetyNotes:''},
 safetyOnly:{instructions:'',accessNotes:'',safetyNotes:'Attic hatch is weak. Use a ladder, not the shelving.'}
};
export const workOrderMembers:WorkOrderMember[]=[{id:'u1',name:'Sam Rivera'},{id:'u2',name:'Jamie Cole'},{id:'u3',name:'Alex Morgan'},{id:'u4',name:'Dana Brooks'}];
export const workOrderContact:WorkOrderContact={name:'Priya Shah',phone:'(718) 555-0142',address:'41 Cedar Lane, Brooklyn, NY 11201'};
export const workOrderAssignmentFixtures:Record<'team'|'solo'|'unassigned',WorkOrderAssignment>={
 team:{assigneeId:'u1',crewIds:['u2','u3']},
 solo:{assigneeId:'u1',crewIds:[]},
 unassigned:{assigneeId:null,crewIds:[]}
};
export const workOrderPhotoFixtures:Record<'mixed'|'empty',WorkOrderPhoto[]>={
 mixed:[
  {id:'p1',name:'utility-room-before.jpg',kind:'image',category:'before',caption:'Old unit and corroded fittings',uploader:'Sam Rivera',uploadedAt:'2026-10-19T09:05:00',state:'ready',thumbnailUrl:null,canRemove:true},
  {id:'p2',name:'gas-valve-before.jpg',kind:'image',category:'before',caption:'',uploader:'Sam Rivera',uploadedAt:'2026-10-19T09:07:00',state:'ready',thumbnailUrl:null,canRemove:true},
  {id:'p3',name:'new-unit-installed.jpg',kind:'image',category:'after',caption:'New unit, pressure tested',uploader:'Jamie Cole',uploadedAt:'2026-10-19T11:40:00',state:'scanning',thumbnailUrl:null,canRemove:false},
  {id:'p4',name:'permit-copy.pdf',kind:'document',category:'other',caption:'City permit',uploader:'Alex Morgan',uploadedAt:'2026-10-18T16:20:00',state:'ready',thumbnailUrl:null,canRemove:false},
  {id:'p5',name:'damaged-upload.heic',kind:'image',category:'after',caption:'',uploader:'Sam Rivera',uploadedAt:'2026-10-19T11:50:00',state:'failed',thumbnailUrl:null,canRemove:true}
 ],
 empty:[]
};
export const workOrderCompletionFixture:WorkOrderCompletion={summary:'Replaced the 40-gallon water heater, updated the gas shut-off valve and pressure tested. No leaks found.',followUp:'job-note',followUpNote:'Customer wants a quote for a recirculation pump.',completedByName:'Sam Rivera',completedAt:'2026-10-19T11:55:00',signerName:'Priya Shah',signedAt:'2026-10-19T11:52:00',signatureUrl:null,overrideReason:''};
export const workOrderPrintFixture:WorkOrderPrintData={businessName:'Brightside Plumbing & Heating',businessPhone:'(718) 555-0100',number:'WO-1011',title:'Water heater replacement',status:'issued',jobNumber:'J-1040',customerName:'Priya Shah',customerPhone:'(718) 555-0142',address:'41 Cedar Lane, Brooklyn, NY 11201',assigneeName:'Sam Rivera',crewNames:['Jamie Cole','Alex Morgan'],scheduledDate:'2026-10-21',scheduledWindow:'09:00-11:00',instructions:workOrderInstructionFixtures.full,
 tasks:workOrderTaskFixtures[0].tasks.map(t=>({id:t.id,label:t.label,required:t.required,done:false})),
 materials:workOrderMaterialFixtures.map(m=>({id:m.id,name:m.name,quantity:m.quantity,unit:m.unit,note:m.note})),printedAt:'2026-10-19T13:50:00'};
export const jobWorkOrderFixtures:Record<'mixed'|'single'|'allDone',JobWorkOrderRow[]>={
 mixed:[
  {id:'wo-1012',number:'WO-1012',title:'Kitchen demo and cabinet install',status:'in-progress',assigneeName:'Sam Rivera',scheduledDate:'2026-10-21',tasksDone:3,tasksTotal:7,overdue:false},
  {id:'wo-1009',number:'WO-1009',title:'Electrical panel rough-in',status:'issued',assigneeName:'Jamie Cole',scheduledDate:'2026-10-16',tasksDone:0,tasksTotal:8,overdue:true},
  {id:'wo-1013',number:'WO-1013',title:'Kitchen finish and punch list',status:'draft',assigneeName:null,scheduledDate:null,tasksDone:0,tasksTotal:5,overdue:false},
  {id:'wo-1008',number:'WO-1008',title:'Demolition',status:'completed',assigneeName:'Sam Rivera',scheduledDate:'2026-10-14',tasksDone:6,tasksTotal:6,overdue:false},
  {id:'wo-1006',number:'WO-1006',title:'Drain cleaning',status:'canceled',assigneeName:'Sam Rivera',scheduledDate:'2026-10-08',tasksDone:0,tasksTotal:3,overdue:false}
 ],
 single:[{id:'wo-1011',number:'WO-1011',title:'Water heater replacement',status:'issued',assigneeName:'Sam Rivera',scheduledDate:'2026-10-21',tasksDone:0,tasksTotal:6,overdue:false}],
 allDone:[
  {id:'wo-1008',number:'WO-1008',title:'Demolition',status:'completed',assigneeName:'Sam Rivera',scheduledDate:'2026-10-14',tasksDone:6,tasksTotal:6,overdue:false},
  {id:'wo-1010',number:'WO-1010',title:'Cabinet install',status:'completed',assigneeName:'Jamie Cole',scheduledDate:'2026-10-17',tasksDone:7,tasksTotal:7,overdue:false}
 ]
};
export const createWorkOrderJob:CreateWorkOrderJob={id:'job-1040',number:'J-1040',title:'Water heater replacement',customerName:'Priya Shah',address:'41 Cedar Lane, Brooklyn, NY 11201',ownerId:'u1'};
export const createWorkOrderSources:CreateWorkOrderSourceOption[]=[
 {value:'duplicate:wo-1011',label:'Duplicate WO-1011',detail:'6 tasks, 4 materials and the instructions are copied. Progress, photos and sign-off are not.'},
 {value:'estimate:est-2041',label:'Accepted estimate EST-2041',detail:'7 line items become tasks and materials. Prices are not copied. Review before issuing.'}
];

const listAssignees=['Sam Rivera','Jamie Cole','Alex Morgan',null] as const;
const listStatuses=['draft','issued','in-progress','completed','canceled'] as const;
export const workOrderListMany:WorkOrderView[]=Array.from({length:60},(_,i)=>({...base,id:`wo-m${i}`,number:`WO-${2000+i}`,title:`Service visit ${i+1}`,status:listStatuses[i%5],customerName:['Priya Shah','Lena Ortiz','Noah Patel','Chris Wu'][i%4],jobId:`job-${1000+(i%6)}`,jobNumber:`J-${1000+(i%6)}`,assigneeName:listAssignees[i%4],crewNames:[],scheduledDate:i%5===0?null:`2026-10-${String(1+(i%28)).padStart(2,'0')}`,scheduledWindow:null,tasksDone:i%5===3?4:i%4,tasksTotal:4,overdue:i%9===0&&i%5!==3,updatedAt:`2026-10-${String(1+(i%18)).padStart(2,'0')}`}));
