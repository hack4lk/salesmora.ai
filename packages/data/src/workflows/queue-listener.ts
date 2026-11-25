import pg from "pg";

/** Dedicated connection: notifications only wake the durable outbox drain. Recovery does not depend on LISTEN. */
export function workflowQueueListener(connectionString: string, wake: () => void) {
  let client: pg.Client | undefined, connecting: Promise<void> | undefined, stopped = false;
  async function connect() {
    if (stopped || client) return;
    if (connecting) return connecting;
    connecting = (async () => {
      const next = new pg.Client({ connectionString, connectionTimeoutMillis: 5000, query_timeout: 5000 });
      next.on("error", () => { if (client === next) client = undefined; void next.end().catch(() => {}); });
      next.on("end", () => { if (client === next) client = undefined; });
      next.on("notification", notice => { if (!stopped && notice.channel === "salesmora_workflow_queue") wake(); });
      try {
        await next.connect();
        await next.query("LISTEN salesmora_workflow_queue");
        if (stopped) { await next.end(); return; }
        client = next;
        wake(); // Close the startup/reconnection race by draining after LISTEN commits.
      } catch { await next.end().catch(() => {}); }
    })().finally(() => { connecting = undefined; });
    return connecting;
  }
  return { connect, async close() { stopped = true; await connecting; const previous = client; client = undefined; await previous?.end(); } };
}
