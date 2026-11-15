import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import pg from 'pg';
import type { Knex } from 'knex';
/** Legacy graph tables remain migration-managed; live turns no longer use a PostgreSQL saver. */
export async function setupChatCheckpoints(db: Knex) {
  // A migration receives a transaction client; its cloned config omits hidden credentials.
  // Copy only the resolved connection parameters from that active, validated database session.
  const client = await db.client.acquireConnection();
  let saver: PostgresSaver | undefined;
  try {
    const connection = client.connectionParameters;
    if (!connection?.host || !connection.database || !connection.user) throw Error('Checkpoint database settings are incomplete');
    saver = new PostgresSaver(new pg.Pool({ host: connection.host, port: connection.port,
      user: connection.user, password: client.password, database: connection.database, ssl: connection.ssl }));
    await saver.setup();
  } finally {
    try { await saver?.end(); } finally { await db.client.releaseConnection(client); }
  }
}
