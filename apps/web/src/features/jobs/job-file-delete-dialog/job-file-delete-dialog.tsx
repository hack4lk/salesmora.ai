'use client';
import {ConfirmDialog} from '@salesmora/ui';import type {JobFile} from '../job-preview.types';import {copy} from './job-file-delete-dialog.data';
export function JobFileDeleteDialog({open,file,pending,error,onClose,onConfirm}:{open:boolean;file:JobFile;pending?:boolean;error?:string;onClose:()=>void;onConfirm:()=>void|Promise<void>}){
 return <ConfirmDialog open={open} title={copy.title(file.name)} description={copy.description} confirmLabel={copy.confirm} destructive confirmDisabled={!file.canRemove||file.state!=='ready'} pending={pending} error={error} onClose={onClose} onConfirm={onConfirm}/>;
}
