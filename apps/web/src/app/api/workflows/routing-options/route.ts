import { workflowRequest } from "../../../../server/workflows/http";
export function GET(request: Request) { return workflowRequest(request, "routing-options"); }
