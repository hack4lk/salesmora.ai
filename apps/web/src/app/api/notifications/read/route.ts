import { notificationAPI } from '../../../../server/notifications/api';
export function POST(request: Request) { return notificationAPI(request,'read'); }
