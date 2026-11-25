'use client';
import {useId,useRef,useState} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import MuiTextField from '@mui/material/TextField';
import {SideDrawer,FormFeedback,SubmitButton,fieldClasses} from '@salesmora/ui';
import {useFormReady} from '../../auth/use-form-ready';
import {serviceWorkersEditorData as copy} from './service-workers-editor.data';

export type ServiceWorker = {id:string;name:string;available:boolean};
export type SaveServiceWorkers = {serviceId:string;expectedVersion:number;workerIds:string[]};
export type ServiceWorkersEditorProps = {
  open:boolean;service:{id:string;name:string};version:number;selectedIds:readonly string[];
  members:readonly ServiceWorker[];canManage:boolean;pending?:boolean;conflict?:boolean;state?:'ready'|'loading'|'error';
  onClose:()=>void;onReload:()=>void;onSave:(command:SaveServiceWorkers)=>Promise<void>;
};
const action='inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-40';
export function ServiceWorkersEditor(props:ServiceWorkersEditorProps){
  return <Editor key={`${props.open}:${props.service.id}:${props.version}:${props.canManage}`} {...props}/>;
}
/** One controlled host boundary; worker selection and ordering stay local until explicit Save. */
function Editor({open,service,version,selectedIds,members,canManage,pending=false,conflict=false,state='ready',onClose,onReload,onSave}:ServiceWorkersEditorProps){
  const id=useId(),formId=`${id}-form`,interactive=useFormReady(),lock=useRef(false);
  const [selected,setSelected]=useState([...selectedIds]),[saving,setSaving]=useState(false),[failed,setFailed]=useState(false);
  const [search,setSearch]=useState('');
  const busy=pending||saving,allowed=interactive&&canManage&&!busy&&!conflict&&state==='ready';
  const changed=JSON.stringify(selected)!==JSON.stringify(selectedIds);
  const unavailable=selected.some(personId=>!members.some(member=>member.id===personId&&member.available));
  const options=members.filter(member=>member.available&&!selected.includes(member.id));
  const change=(next:string[])=>{if(allowed){setSelected(next);setFailed(false);}};
  const move=(index:number,delta:number)=>{if(!allowed||index+delta<0||index+delta>=selected.length)return;const next=[...selected];[next[index],next[index+delta]]=[next[index+delta],next[index]];change(next);};
  async function save(){if(!allowed||!changed||unavailable||lock.current)return;lock.current=true;setSaving(true);setFailed(false);
    try{await onSave({serviceId:service.id,expectedVersion:version,workerIds:[...selected]});onClose();}
    catch{setFailed(true);}finally{lock.current=false;setSaving(false);}
  }
  return <SideDrawer open={open} title={copy.title} description={copy.description(service.name)} busy={busy} onClose={onClose}
    footer={<div className="flex flex-wrap justify-end gap-3"><button type="button" className={action} disabled={busy} onClick={onClose}>{canManage?copy.cancel:copy.close}</button>
      {canManage&&<SubmitButton form={formId} label={copy.save} pendingLabel={copy.saving} pending={busy} fullWidth={false} disabled={!allowed||!changed||unavailable}/>}</div>}>
    <form id={formId} onSubmit={event=>{event.preventDefault();void save();}} className="grid min-w-0 gap-5">
      {!canManage&&<p className="m-0 text-sm text-muted">{copy.readOnly}</p>}
      {state==='loading'?<p role="status" className="m-0 text-sm text-muted">{copy.loading}</p>:state==='error'?<div className="grid justify-items-start gap-3"><FormFeedback kind="error" message={copy.loadError}/><button type="button" className={action} disabled={busy} onClick={onReload}>{copy.reload}</button></div>:<>
        {canManage&&<Autocomplete size="small" disablePortal options={options} value={null} inputValue={search} onInputChange={(_,next,reason)=>setSearch(reason==='input'?next:'')} disabled={!allowed} getOptionLabel={member=>member.name} isOptionEqualToValue={(a,b)=>a.id===b.id} noOptionsText={copy.none}
          onChange={(_,member)=>{if(member&&allowed){change([...selected,member.id]);setSearch('');}}}
          renderInput={params=><MuiTextField {...params} label={copy.add} className={fieldClasses}/>}/>}
        {!members.some(member=>member.available)&&canManage&&<p className="m-0 text-sm text-muted">{copy.noMembers}</p>}
        <section aria-labelledby={`${id}-order`} className="grid min-w-0 gap-3"><header><h3 id={`${id}-order`} className="m-0 text-base font-semibold">{copy.preferred}</h3><p className="mb-0 mt-2 text-sm leading-6 text-muted">{copy.orderHelp}</p></header>
          {!selected.length?<p role="status" className="m-0 rounded-xl border border-line bg-canvas p-4 text-sm leading-6 text-muted">{copy.empty}</p>:<ol className="m-0 grid min-w-0 list-none gap-2 p-0">{selected.map((personId,index)=>{
            const member=members.find(person=>person.id===personId),name=member?.name??copy.unavailable;
            return <li key={personId} className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3"><div className="flex min-w-0 flex-1 basis-36 items-center gap-3"><span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-sm font-semibold text-muted">{index+1}</span><span className="min-w-0 text-sm font-semibold wrap-anywhere">{name}</span>{!member?.available&&<span className="text-xs text-error">{copy.unavailable}</span>}</div>
              {canManage&&<div className="flex flex-wrap justify-end gap-2"><button type="button" className={action} aria-label={copy.up(name)} disabled={!allowed||index===0} onClick={()=>move(index,-1)}>↑</button><button type="button" className={action} aria-label={copy.down(name)} disabled={!allowed||index===selected.length-1} onClick={()=>move(index,1)}>↓</button><button type="button" className={action} aria-label={copy.remove(name)} disabled={!allowed} onClick={()=>change(selected.filter(value=>value!==personId))}>{copy.removeAction}</button></div>}
            </li>;
          })}</ol>}
        </section>
        {unavailable&&canManage&&<FormFeedback kind="error" message={copy.unavailableHelp}/>}
      </>}
      {failed&&<FormFeedback kind="error" message={copy.failed}/>}
      {conflict&&<div className="grid justify-items-start gap-3"><FormFeedback kind="error" message={copy.conflict}/><button type="button" className={action} disabled={busy} onClick={onReload}>{copy.reload}</button></div>}
    </form>
  </SideDrawer>;
}
