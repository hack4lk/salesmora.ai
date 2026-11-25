import {renderWorkflowsPage} from "../../../../../server/workflows/read-page";
export default async function OpeningPage({params,searchParams}:{params:Promise<{openingId:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){return renderWorkflowsPage(await searchParams,undefined,(await params).openingId);}
