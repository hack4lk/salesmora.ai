import type { Knex } from 'knex';
import { setupChatCheckpoints } from '../checkpoints';
// Repair databases that applied the first runtime migration before URL normalization was handled.
export async function up(db: Knex) { await setupChatCheckpoints(db); }
export async function down() { /* Execution tables are shared; preserve them on rollback. */ }
