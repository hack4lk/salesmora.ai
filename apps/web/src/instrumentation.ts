// Runs once per server start. Flags owner-level database credentials (admin console step 0a).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) return;
  const { assertRuntimeDatabaseRole, createDatabase } = await import("@salesmora/data");
  const db = createDatabase(process.env.DATABASE_URL);
  try {
    await assertRuntimeDatabaseRole(db, "Web");
  } finally {
    await db.destroy();
  }
}
