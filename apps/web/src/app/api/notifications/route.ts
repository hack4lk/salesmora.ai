import { notificationAPI } from '../../../server/notifications/api';
export function GET(request: Request) { return notificationAPI(request,'list'); }
