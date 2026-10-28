/** UI-facing estimate types; server contracts and authorization live in their respective packages. */
export const estimateStatuses = [
  "draft",
  "sent",
  "published",
  "accepted",
  "declined",
  "expired",
  "superseded",
  "void",
] as const;
export type EstimateStatus = (typeof estimateStatuses)[number];
export { estimateDecisionOutcomes, estimateDecisionChannels } from "@salesmora/contracts";
export type { EstimateDecisionOutcome, EstimateDecisionChannel } from "@salesmora/contracts";
export type EstimateParentType = "lead" | "job";
export type EstimateRole = "owner" | "admin" | "office" | "field";
export type EstimateRow = {
  id: string;
  /** Shown as EST-####; revisions share the number. */
  number: string;
  revision: number;
  name: string;
  customerName: string;
  service: string;
  status: EstimateStatus;
  /** Integer cents. */
  totalCents: number | null;
  parentType: EstimateParentType;
  parentId: string;
  parentNumber: string;
  ownerId: string | null;
  ownerName?: string | null;
  /** Local date (YYYY-MM-DD), null for drafts that have none. */
  validUntil: string | null;
  updatedAt: string;
  decidedAt: string | null;
  archived: boolean;
  version: number;
  /** Current server-owned list grants; omitted by static prototypes. */
  capabilities?: Pick<EstimateCapabilities, "create" | "update" | "delete">;
};
export type EstimateCapabilities = {
  read: boolean;
  create: boolean;
  update: boolean;
  send: boolean;
  decide: boolean;
  void: boolean;
  archive: boolean;
  delete: boolean;
  export: boolean;
};
export type EstimateMember = { id: string; name: string };
export type EstimateDetailsValues = {
  name: string;
  recipientName: string;
  recipientEmail: string;
  serviceAddress: string;
  ownerId: string;
};
export type EstimateViewState =
  "ready" | "loading" | "error" | "forbidden" | "not-found";
