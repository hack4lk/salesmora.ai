import type {JobStatus} from '@salesmora/contracts';
export type {JobMember, JobCapabilities, JobView} from '@salesmora/contracts';
export type JobAction='open'|'status'|'schedule'|'deadline'|'team'|'note'|'edit';
export type JobActivityEntry={id:string;actor:string;at:string;title:string;body:string;kind:'status'|'assignment'|'schedule'|'note'|'file'|'created'};
export type JobFile={id:string;name:string;type:string;bytes:number;description:string;uploader:string;uploadedAt:string;state:'ready'|'scanning'|'failed'|'removed';canRemove:boolean};
export type JobChatMessage={id:string;authorId:string;author:string;at:string;text:string;assistant?:boolean;unread?:boolean};
export type JobFilters={search:string;status:JobStatus|'all';owner:string;customer:string;service:string;deadline:'all'|'overdue'|'upcoming'|'unset';createdAfter:string;closed:boolean;mine:boolean};
export type JobDraft={id:string;title:string;description:string;changes:{label:string;before:string;after:string}[];state:'review'|'confirming'|'confirmed'|'canceled'|'expired'|'stale'|'superseded'|'error';warnings?:string[]};
