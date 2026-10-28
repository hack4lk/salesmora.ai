function proposalTime(value: string): number | null {
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value ? time : null;
}

/** Presentation check only; stored proposal deadlines must also be enforced by the server. */
export function reviewAssistantProposalWindow(createdAt: string, expiresAt: string, now: number) {
  const created = proposalTime(createdAt), expires = proposalTime(expiresAt);
  return {
    valid: Number.isFinite(now) && created !== null && expires !== null
      && expires > created && expires - created <= 900000 && created <= now,
    expired: expires === null || expires <= now,
    expires,
  };
}
