import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { createDatabase, initializeWorkspacePolicy } from '@salesmora/data';
import { workspacePlanCatalogVersion } from '@salesmora/domain';

export const demoAccounts = [
  { key: 'DEMO_OWNER_PASSWORD', email: 'owner@demo.example.test', name: 'Morgan Ellis', role: 'owner' },
  { key: 'DEMO_ADMIN_PASSWORD', email: 'admin@demo.example.test', name: 'Alex Parker', role: 'admin' },
  { key: 'DEMO_OFFICE_PASSWORD', email: 'office@demo.example.test', name: 'Jordan Lee', role: 'office' },
  { key: 'DEMO_FIELD_PASSWORD', email: 'field@demo.example.test', name: 'Taylor Reed', role: 'field' },
  { key: 'DEMO_FREE_OWNER_PASSWORD', email: 'free@demo.example.test', name: 'Casey Blake', role: 'owner' },
  { key: 'DEMO_STANDARD_OWNER_PASSWORD', email: 'standard@demo.example.test', name: 'Riley Stone', role: 'owner' },
] as const;

export type DemoCredentials = Record<(typeof demoAccounts)[number]['key'], string>;
export type DemoSeedPreservation = {
  users: Partial<Record<(typeof demoAccounts)[number]['key'], string>>;
  workspaces: Partial<Record<'main' | 'free' | 'standard', string>>;
  timezones: Partial<Record<'main' | 'free' | 'standard', string>>;
  services: { workspaceId: string; id: string; service: string; name: string; archivedAt: string | Date | null }[];
};

export async function seedDemoAccounts(
  db: ReturnType<typeof createDatabase>, credentials: DemoCredentials, now: Date,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  preserved?: DemoSeedPreservation,
) {
  if (!Number.isFinite(now.getTime())) throw new Error('A valid demo seed time is required.');
  new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(now);
  const users = await Promise.all(demoAccounts.map(async account => {
    const password = credentials[account.key];
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      throw new Error(`Invalid ${account.key}.`);
    }
    return { ...account, id: preserved?.users[account.key] ?? randomUUID(), hash: await hashPassword(password) };
  }));
  const main = preserved?.workspaces.main ?? randomUUID();
  const free = preserved?.workspaces.free ?? randomUUID();
  const standard = preserved?.workspaces.standard ?? randomUUID();
  const createdAt = new Date(now.getTime() - 180 * 86400_000);
  const paidThrough = new Date(now.getTime() + 365 * 86400_000);

  await db.transaction(async trx => {
    for (const user of users) {
      await trx('users').insert({
        id: user.id, name: user.name, email: user.email, emailVerified: true,
        termsVersion: 'demo-local', termsAcceptedAt: createdAt, onboardingStatus: 'complete',
        registrationPlan: user.key === 'DEMO_FREE_OWNER_PASSWORD' ? 'free' :
          user.key === 'DEMO_STANDARD_OWNER_PASSWORD' ? 'standard' : 'premium',
        createdAt, updatedAt: createdAt,
      });
      await trx('accounts').insert({
        id: randomUUID(), userId: user.id, accountId: user.id, providerId: 'credential',
        password: user.hash, createdAt, updatedAt: createdAt,
      });
    }
    const businesses = [
      { key: 'main', id: main, owner: users[0], name: 'Evergreen Home Services', plan: 'premium' },
      { key: 'free', id: free, owner: users[4], name: 'Cedar Handyman', plan: 'free' },
      { key: 'standard', id: standard, owner: users[5], name: 'Harbor Property Care', plan: 'standard' },
    ] as const;
    for (const business of businesses) {
      await trx('workspaces').insert({
        id: business.id, ownerId: business.owner.id, businessName: business.name,
        businessType: 'handyman', postalCode: '00000', serviceRange: '20',
        timezone: preserved?.timezones[business.key] ?? timezone, createdAt,
      });
      await trx('workspaceMemberships').insert({
        workspaceId: business.id, userId: business.owner.id, role: 'owner',
      });
      await initializeWorkspacePolicy(trx, { workspaceId: business.id, userId: business.owner.id });
      const savedServices = preserved?.services.filter(service => service.workspaceId === business.id) ?? [];
      const defaults = ['repairs', 'maintenance', 'installation']
        .filter(service => !savedServices.some(saved => saved.service === service))
        .map(service => ({ workspaceId: business.id, service }));
      await trx('workspaceServices').insert([...savedServices, ...defaults]);
      await trx('workspaceSubscriptions').insert({
        workspaceId: business.id, plan: business.plan, intendedPlan: business.plan,
        catalogVersion: workspacePlanCatalogVersion,
        status: business.plan === 'free' ? 'free' : 'active',
        paidThrough: business.plan === 'free' ? null : paidThrough, updatedAt: now,
      });
    }
    await trx('workspaceMemberships').insert(users.slice(1, 4).map(user => ({
      workspaceId: main, userId: user.id, role: user.role,
    })));
  });
  return {
    workspaces: { main, free, standard },
    users: Object.fromEntries(users.map(user => [user.key, user.id])),
    timezone: preserved?.timezones.main ?? timezone,
  };
}
