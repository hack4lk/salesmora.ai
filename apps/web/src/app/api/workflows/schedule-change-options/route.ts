import {workflowRequest} from '../../../../server/workflows/http';
export function GET(request:Request){return workflowRequest(request,'schedule-change-options');}

export function POST(request:Request){return workflowRequest(request,'schedule-change-options');}
