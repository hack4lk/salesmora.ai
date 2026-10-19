import { notificationAPI } from '../../../../server/notifications/api';
export function GET(request: Request) { return notificationAPI(request,'preferences'); }
export function PUT(request: Request) { return notificationAPI(request,'save'); }
