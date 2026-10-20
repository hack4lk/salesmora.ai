import assert from 'node:assert/strict';
import { createDatabase } from '../../../../packages/data/src/index.ts';
const testURL=process.env.TEST_DATABASE_URL;
if(!testURL || !new URL(testURL).pathname.endsWith('_test') || testURL===process.env.DATABASE_URL)throw Error('Expected separate test database.');
process.env.DATABASE_URL=testURL;
// Match the E2E server's explicit billing opt-in rather than the developer's local flag.
process.env.BILLING_SANDBOX_ENABLED=process.env.SALESMORA_BILLING_TEST==='1'?'true':'false';
const db=createDatabase(testURL);
const { deliverOwnerInvitations }=await import('../../src/server/invitations/store.ts');
const ownerId=process.argv[2];
try {
 let calls=0;
 const fakeMail=async()=>{calls++;};
 assert.equal(await deliverOwnerInvitations(ownerId,fakeMail),0);
 assert.equal(calls,0);
 await db('users').where({id:ownerId}).update({emailVerified:true});
 await deliverOwnerInvitations(ownerId,async()=>{throw Error('Fictional SMTP outage');});
 let rows=await db('workspaceInvitations');
 assert.ok(rows.every(row=>row.status==='queued' && row.deliveryAttempts===1 && row.tokenHash===null));
 assert.equal(await deliverOwnerInvitations(ownerId,fakeMail),0);
 await db('workspaceInvitations').update({lastAttemptAt:new Date(Date.now()-61000)});
 const results=await Promise.all([deliverOwnerInvitations(ownerId,fakeMail),deliverOwnerInvitations(ownerId,fakeMail)]);
 assert.equal(results.reduce((sum,value)=>sum+value,0),2);
 assert.equal(calls,2);
 rows=await db('workspaceInvitations');assert.ok(rows.every(row=>row.status==='sent' && row.tokenHash.length===64 && row.deliveryAttempts===2));
 assert.equal(await deliverOwnerInvitations(ownerId,fakeMail),0);
 console.log('PASS verified-owner gate, failed delivery retry, cooldown, concurrent delivery and sent idempotency');
}finally{await db.destroy();}
// Close the store's separate pool so the helper exits promptly.
const { database }=await import('../../src/server/workspaces/store.ts');await database().destroy();
