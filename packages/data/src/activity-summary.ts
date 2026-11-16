/** Shared safe action summaries for native Lead/Job histories; never select note bodies. */
export const leadActivityActionSQL = `CASE WHEN jsonb_typeof(h.changes) = 'object' THEN CASE h.type
  WHEN 'created' THEN 'created' WHEN 'edited' THEN 'updated' WHEN 'restored' THEN 'updated'
  WHEN 'archived' THEN 'archived' WHEN 'stage' THEN 'stage-changed'
  WHEN 'assigned' THEN 'assignment-changed' END END`;
export const jobActivityActionSQL = `CASE WHEN jsonb_typeof(h.changes) = 'object' THEN CASE h.type
  WHEN 'created' THEN 'created' WHEN 'edit' THEN 'updated' WHEN 'assign' THEN 'assignment-changed'
  WHEN 'deadline' THEN 'deadline-changed' WHEN 'schedule' THEN 'visit-changed'
  WHEN 'status' THEN CASE WHEN h.changes->>'to' = 'completed' THEN 'completed'
    WHEN h.changes->>'to' IN ('needs-scheduling','scheduled','in-progress','waiting','canceled') THEN 'status-changed' END END END`;
