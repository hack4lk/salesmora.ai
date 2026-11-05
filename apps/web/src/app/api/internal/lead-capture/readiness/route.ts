import { captureReadiness } from '../../../../../server/lead-capture/readiness';
export const dynamic = 'force-dynamic';
export const POST = (request: Request) => captureReadiness(request);
