import { workflowRequest } from "../../../../server/workflows/http";

export function POST(request: Request) { return workflowRequest(request, "run"); }
