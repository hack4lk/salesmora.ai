import {workflowRequest} from '../../../../server/workflows/http';
export function GET(request:Request){return workflowRequest(request,'post-job-options');}

export function POST(request:Request){return workflowRequest(request,'post-job-options');}
