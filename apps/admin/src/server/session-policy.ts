export const ADMIN_SESSION_ABSOLUTE_SECONDS = 60 * 60 * 8;
export const ADMIN_SESSION_IDLE_SECONDS = 60 * 30;

export function isAdminSessionWithinLimits(createdAt: Date, updatedAt: Date, now = Date.now()) {
  const absoluteAge = now - createdAt.getTime();
  const idleAge = now - updatedAt.getTime();
  return absoluteAge <= ADMIN_SESSION_ABSOLUTE_SECONDS * 1000 &&
    idleAge <= ADMIN_SESSION_IDLE_SECONDS * 1000;
}
