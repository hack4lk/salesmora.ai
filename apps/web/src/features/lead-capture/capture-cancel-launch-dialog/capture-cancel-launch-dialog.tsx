'use client';
import { ConfirmDialog } from '@salesmora/ui';
export type CaptureCancelLaunchDialogProps={open:boolean;source:{id:string;version:number;name:string;status:string};pendingLaunch:{at:string;timezone:string};canCancel:boolean;pending?:boolean;error?:string;onClose:()=>void;onConfirm:()=>Promise<void>};
/** One cancellation review for manual and assistant paths. Only the host sends frozen version/transition bindings. */
export function CaptureCancelLaunchDialog({open,source,pendingLaunch,canCancel,pending=false,error,onClose,onConfirm}:CaptureCancelLaunchDialogProps){
  let when='';try{when=new Intl.DateTimeFormat('en-US',{timeZone:pendingLaunch.timezone,dateStyle:'full',timeStyle:'short'}).format(new Date(pendingLaunch.at));}catch{/* Invalid metadata must not offer confirmation. */}
  return <ConfirmDialog open={open} title="Cancel scheduled launch" confirmLabel="Confirm cancellation" confirmDisabled={!canCancel||!when||!['active','scheduled'].includes(source.status)} pending={pending} error={error} onClose={onClose} onConfirm={onConfirm} description={`${source.name}: ${when} (${pendingLaunch.timezone}). ${source.status==='active'?'The current approved version stays active.':'This source stays paused.'} Pending content returns to an editable draft. Existing receipts are retained.`}/>;
}
