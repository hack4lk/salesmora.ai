import { calendarExportHttp } from '../../../../../server/reports/calendar-export-http';

export const runtime = 'nodejs';
export const maxDuration = 40;
export function POST(request: Request) { return calendarExportHttp(request, 'download'); }
