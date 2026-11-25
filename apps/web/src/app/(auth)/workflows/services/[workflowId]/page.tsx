import {renderWorkflowsPage} from '../../../../../server/workflows/read-page';
export default async function ServiceDuePage({params,searchParams}:{params:Promise<{workflowId:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){return renderWorkflowsPage(await searchParams,undefined,undefined,(await params).workflowId);}
