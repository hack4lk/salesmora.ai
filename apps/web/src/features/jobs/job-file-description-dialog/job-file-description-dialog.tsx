'use client';
import {useState} from 'react';import type {JobFile} from '../job-preview.types';import {JobDialog} from '../job-dialog/job-dialog';import {jobInput,jobLabel} from '../job-ui';import {copy} from './job-file-description-dialog.data';
export function JobFileDescriptionDialog({open,file,onClose,onConfirm,pending,error}:{open:boolean;file:JobFile;onClose:()=>void;onConfirm:(description:string)=>void|Promise<void>;pending?:boolean;error?:string}){
 const [description,setDescription]=useState(file.description);
 return <JobDialog open={open} title={copy.title} description={copy.description} confirmLabel={copy.save} confirmDisabled={!file.canRemove||file.state!=='ready'} pending={pending} error={error} onClose={onClose} onSubmit={()=>onConfirm(description)}><p className="text-sm font-semibold wrap-anywhere">{file.name}</p><label className={jobLabel}>{copy.label}<textarea className={jobInput} rows={4} maxLength={500} value={description} onChange={e=>setDescription(e.target.value)}/></label></JobDialog>;
}
