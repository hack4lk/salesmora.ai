import { randomUUID } from 'node:crypto';
import type { EstimateFrozenSnapshot } from '@salesmora/contracts';
import type { Knex } from 'knex';
import { estimateSnapshotHash, verifiedEstimateFrozenSnapshot } from '../estimates/sharing-paper';

type DemoSeedContext = {
  workspaces: { main: string; free: string; standard: string };
  users: Record<string, string>;
  timezone: string;
};

const day = 86_400_000;
const atDay = (now: Date, offset: number) => new Date(now.getTime() + offset * day);

export async function seedDemoCrm(db: Knex, context: DemoSeedContext, now: Date) {
  if (!Number.isFinite(now.getTime())) throw new Error('A valid demo seed time is required.');
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: context.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const dateAt = (_now: Date, offset: number) =>
    atDay(new Date(`${today}T12:00:00Z`), offset).toISOString().slice(0, 10);
  const businesses = [
    { workspaceId: context.workspaces.main, owner: context.users.DEMO_OWNER_PASSWORD, assignee: context.users.DEMO_FIELD_PASSWORD, count: 8, name: 'Evergreen Home Services' },
    { workspaceId: context.workspaces.free, owner: context.users.DEMO_FREE_OWNER_PASSWORD, assignee: context.users.DEMO_FREE_OWNER_PASSWORD, count: 4, name: 'Cedar Handyman' },
    { workspaceId: context.workspaces.standard, owner: context.users.DEMO_STANDARD_OWNER_PASSWORD, assignee: context.users.DEMO_STANDARD_OWNER_PASSWORD, count: 4, name: 'Harbor Property Care' },
  ];
  if (businesses.some(business => !business.owner || !business.assignee)) throw new Error('Demo workspace users are missing.');
  await db.transaction(async trx => {
    for (const business of businesses) {
      const { workspaceId, owner, assignee } = business;
      const materials = [
        { id: randomUUID(), name: 'Faucet repair kit', sku: 'FIX-101', costCents: 3200, priceCents: 6400 },
        { id: randomUUID(), name: 'LED light fixture', sku: 'ELE-201', costCents: 4800, priceCents: 9200 },
        { id: randomUUID(), name: 'Exterior sealant', sku: 'SEA-301', costCents: 1800, priceCents: 3600 },
      ];
      await trx('materialCatalog').insert(materials.map(item => ({
        ...item, workspaceId, unit: 'each', category: 'Service supplies',
        supplier: 'Fictional Supply Co.', status: 'active', createdBy: owner,
        createdAt: atDay(now, -90), updatedAt: atDay(now, -90),
      })));
      const offsets = [-15, -5, 0, 1, 3, 7, 14, 21];
      for (let index = 0; index < business.count; index++) {
        const customerId = randomUUID(), leadId = randomUUID(), jobId = randomUUID();
        const workOrderId = randomUUID(), visitId = randomUUID(), estimateId = randomUUID();
        const customer = ['Avery Brooks', 'Quinn Foster', 'Drew Morgan', 'Robin Hayes',
          'Jamie Rivers', 'Cameron Bell', 'Skyler Grant', 'Peyton Lane'][index];
        const service = ['Fixture repair', 'Lighting installation', 'Preventive maintenance', 'Exterior sealing'][index % 4];
        const address = `${100 + index} Demo Lane, Example City`;
        const email = `customer${index + 1}-${workspaceId.slice(0, 8)}@example.test`;
        const createdAt = atDay(now, -70 + index);
        const completed = index < 2;
        const scheduledDate = dateAt(now, offsets[index]);
        const status = completed ? 'completed' : index === 2 ? 'in-progress' : 'scheduled';
        const material = materials[index % materials.length];
        const total = 25000 + index * 5000;
        await trx('customers').insert({
          id: customerId, workspaceId, name: customer, type: 'person', companyName: '', email,
          phone: `202-555-${String(100 + index).padStart(4, '0')}`, location: address,
          internalNotes: 'Fictional demo customer.', ownerId: owner,
          createdAt, updatedAt: createdAt, lastActivityAt: createdAt,
        });
        await trx('leads').insert({
          id: leadId, workspaceId, createdBy: owner, submissionId: randomUUID(), submissionHash: 'demo',
          name: customer, email, phone: `202-555-${String(100 + index).padStart(4, '0')}`,
          service, address, details: `Customer requested ${service.toLowerCase()}.`,
          notes: 'Fictional demo lead.', source: index % 2 ? 'referral' : 'website',
          stage: completed ? 'won' : index === 2 ? 'estimate-sent' : 'contacted',
          ownerId: owner, customerId, createdAt,
        });
        await trx('jobs').insert({
          id: jobId, workspaceId, customerId, customerName: customer, sourceLeadId: leadId,
          title: service, service, location: address, description: `Complete ${service.toLowerCase()}.`,
          status, primaryOwnerId: assignee, createdBy: owner, scheduledDate,
          arrivalWindow: '09:00-11:00', completionDeadline: dateAt(now, index === 2 ? -2 : offsets[index] + 2),
          createdAt, updatedAt: createdAt, lastActivityAt: createdAt,
        });
        await trx('jobTeamMembers').insert({ workspaceId, jobId, userId: assignee });
        await trx('jobActivity').insert({
          id: randomUUID(), workspaceId, jobId, actorId: owner, actorName: 'Demo owner',
          source: 'ui', type: 'created', changes: '{}', createdAt,
        });
        await trx('workOrders').insert({
          id: workOrderId, workspaceId, jobId, title: service,
          status: completed ? 'completed' : index === 2 ? 'in-progress' : 'issued',
          instructions: `Perform ${service.toLowerCase()} and clean the work area.`,
          scheduledDate, arrivalWindow: '09:00-11:00', primaryAssigneeId: assignee, createdBy: owner,
          issuedAt: atDay(now, -40), startedAt: completed ? atDay(now, offsets[index]) : null,
          completedAt: completed ? atDay(now, offsets[index]) : null, createdAt, updatedAt: createdAt,
        });
        await trx('workOrderTasks').insert({
          id: randomUUID(), workspaceId, workOrderId, position: 0,
          label: `Complete ${service.toLowerCase()}`, required: true, done: completed,
          doneBy: completed ? assignee : null, doneAt: completed ? atDay(now, offsets[index]) : null,
        });
        await trx('workOrderCrew').insert({ workspaceId, workOrderId, userId: assignee });
        await trx('workOrderMaterials').insert({
          id: randomUUID(), workspaceId, workOrderId, position: 0, catalogId: material.id,
          name: material.name, quantity: 1, unit: 'each', status: completed ? 'used' : 'on-hand',
          customerPriceCents: material.priceCents, costCents: material.costCents,
        });
        if (completed) {
          await trx('workOrderCompletions').insert({
            id: randomUUID(), workspaceId, workOrderId, summary: 'Work completed and site cleaned.',
            completedBy: assignee, completedByName: 'Demo team member', completedAt: atDay(now, offsets[index]),
          });
        }
        await trx('calendarVisits').insert({
          id: visitId, workspaceId, scheduledDate, arrivalWindow: '09:00-11:00',
          createdAt, updatedAt: createdAt,
        });
        await trx('calendarVisitRecords').insert([
          { id: randomUUID(), workspaceId, visitId, jobId, linkedAt: createdAt },
          { id: randomUUID(), workspaceId, visitId, workOrderId, linkedAt: createdAt },
        ]);
        const [estimate] = await trx('estimates').insert({
          id: estimateId, workspaceId, name: service, parentType: 'job', jobId, customerId,
          status: completed ? 'accepted' : 'draft', ownerId: owner, createdBy: owner,
          recipientName: customer, recipientEmail: email, serviceAddress: address,
          subtotalCents: total, discountCents: 0, taxCents: 0, totalCents: total,
          depositCents: 0, balanceCents: total, acceptedTotalCents: completed ? total : null,
          publishedAt: completed ? atDay(now, -35) : null,
          validUntil: dateAt(now, 30), createdAt, updatedAt: createdAt,
        }).returning(['estimateNumber']);
        await trx('estimate_items').insert({
          id: randomUUID(), workspaceId, estimateId, position: 0, description: service,
          quantity: 1, unitPriceCents: total, taxable: false, included: false, amountCents: total,
        });
        if (completed) {
          const snapshot: EstimateFrozenSnapshot = {
            formatVersion: 1,
            content: {
              number: `EST-${String(estimate.estimateNumber).padStart(4, '0')}`, revision: 1, name: service,
              business: { name: business.name, address: '10 Demo Lane, Example City', phone: '202-555-0100',
                email: 'office@demo.example.test', licenseLine: '', logoPath: null, requireServiceAddress: false },
              recipientName: customer, recipientEmail: email, serviceAddress: address,
              estimateDate: dateAt(now, -35), validUntil: dateAt(now, 30), preparedBy: 'Demo owner',
              relatedRecord: '', scope: service, message: '', paymentTerms: '', termsNote: '',
              items: [{ description: service, quantity: '1', unitPrice: (total / 100).toFixed(2), taxable: false, included: false, unit: '' }],
              discount: { type: 'none' }, taxRate: '0', deposit: { type: 'none' },
            },
            amounts: { lineAmountsCents: [total], subtotalCents: total, discountCents: 0,
              taxCents: 0, totalCents: total, depositCents: 0, balanceCents: total },
          };
          const hash = estimateSnapshotHash(snapshot), snapshotId = randomUUID();
          if (!verifiedEstimateFrozenSnapshot(snapshot, hash)) throw new Error('Demo estimate snapshot is invalid.');
          await trx('estimate_snapshots').insert({
            id: snapshotId, workspaceId, estimateId, content: JSON.stringify(snapshot),
            contentHash: hash, estimateVersion: 1, createdAt: atDay(now, -35),
          });
          await trx('estimate_decisions').insert({
            id: randomUUID(), workspaceId, estimateId, snapshotId, estimateVersion: 1,
            outcome: 'accepted', decisionDate: dateAt(now, -30), channel: 'phone', note: '',
            snapshotTotalCents: total, actorId: owner, createdAt: atDay(now, -30),
          });
          await trx('jobs').where({ workspaceId, id: jobId }).update({ acceptedEstimateId: estimateId });
        }
      }
      for (const [index, stage] of ['new', 'estimate-sent', 'lost'].entries()) {
        await trx('leads').insert({
          id: randomUUID(), workspaceId, createdBy: owner, submissionId: randomUUID(), submissionHash: 'demo',
          name: ['Shannon Wells', 'Reese Lane', 'Blair Woods'][index],
          email: `prospect${index + 1}-${workspaceId.slice(0, 8)}@example.test`,
          phone: `202-555-${String(110 + index).padStart(4, '0')}`,
          service: 'General repairs', address: `${200 + index} Demo Lane, Example City`,
          details: 'Fictional request for a repair estimate.', notes: '',
          source: ['phone', 'referral', 'other'][index], stage,
          ownerId: index === 0 ? null : owner, createdAt: atDay(now, -index * 10),
        });
      }
    }
  });
}
