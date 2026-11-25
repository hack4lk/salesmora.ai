import type { NotificationResult } from '@salesmora/contracts';

export const notificationScope = {
  viewerId: 'notification-viewer',
  workspaceId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
};
export const notificationFixture: NotificationResult = {
  items: [{
    kind: 'lead', id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    leadId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', leadNumber: 'LD-1042',
    leadName: 'Jordan Lee', service: 'Kitchen sink repair', assignerName: 'Alex Rivera',
    createdAt: '2026-10-15T14:30:00Z', read: false,
  }],
  unreadCount: 2, hasMore: true, page: 1,
};
export const olderNotificationFixture: NotificationResult = {
  items: [{
    ...notificationFixture.items[0], id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    createdAt: '2026-10-14T09:00:00Z', read: false,
  }],
  unreadCount: 2, hasMore: false, page: 2,
};
