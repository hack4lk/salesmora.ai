import { activityExportHttp } from '../../../../../server/reports/activity-export-http';

export const runtime = 'nodejs';
export const maxDuration = 40;
export function POST(request: Request) { return activityExportHttp(request, 'download'); }
