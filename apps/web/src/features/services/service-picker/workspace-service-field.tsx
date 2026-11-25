'use client';
import {workspaceServiceChoicesSchema} from '@salesmora/contracts';
import {useApiQuery} from '../../api/use-api-query';
import {apiReadOptions} from '../../api/api-read-options';
import {useApiQueryScope} from '../../api/api-query-provider';
import {ServicePicker} from './service-picker';
/** Lead classification preserves the original external request elsewhere; choices share one scoped cache. */
export function WorkspaceServiceField({workspaceId,value,onChange,disabled,required,allowRetainedValue=false,label}:{workspaceId:string;value:string;onChange:(value:string)=>void;disabled?:boolean;required?:boolean;allowRetainedValue?:boolean;label?:string}) {
  const scope=useApiQueryScope();if(scope.workspaceId!==workspaceId)throw Error('Service choices require the current workspace.');
  const query=useApiQuery(apiReadOptions(scope,'service-choices',{},`/api/services?workspace=${encodeURIComponent(workspaceId)}`,raw=>workspaceServiceChoicesSchema.parse(raw),'Services could not be loaded.'));
  const services=query.data?.services??[],selected=services.find(s=>s.id===value||s.key===value||s.name===value);
  return <div className="grid gap-2"><ServicePicker services={services} value={selected?.id??null} legacyValue={!selected?value:undefined} disabled={disabled||!query.data} required={required} allowRetainedValue={allowRetainedValue} label={label}
    error={query.isError?'Services could not be loaded.':undefined} onChange={id=>onChange(services.find(s=>s.id===id)?.name??'')}/>
    {query.isPending&&<p role="status" className="m-0 text-sm text-muted">Loading services…</p>}
    {query.isError&&<button type="button" className="min-h-11 cursor-pointer justify-self-start rounded-lg px-2 text-sm font-semibold text-primary focus-visible:focus-ring" onClick={()=>void query.refetch()}>Try again</button>}
  </div>;
}
