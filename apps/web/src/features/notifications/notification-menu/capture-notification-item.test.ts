import { expect, it } from 'vitest';
import { captureNotificationItem } from './capture-notification-item';
it('preserves an authorized capture notice and its workspace destination',()=>{
 const result=captureNotificationItem({kind:'capture',id:'notice',sourceId:'source/id',sourceName:'Website requests',reason:'source_capacity',createdAt:'2026-10-31T12:00:00.000Z',read:false},'workspace/id');
 expect(result.href).toBe('/lead-capture/source%2Fid?workspace=workspace%2Fid');expect(result.description).toContain('Archive excess sources');expect(result.title).toBe('Lead Capture needs attention');expect(result.read).toBe(false);
});
