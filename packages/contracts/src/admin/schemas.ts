import { z } from 'zod';
import { adminPermissionIds, staffRoleIds } from './catalog';

export const staffRoleIdSchema = z.enum(staffRoleIds);
export const adminPermissionIdSchema = z.enum(adminPermissionIds);

export type StaffRole = z.infer<typeof staffRoleIdSchema>;
export type AdminPermission = z.infer<typeof adminPermissionIdSchema>;
