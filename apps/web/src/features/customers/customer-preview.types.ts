/** Presentation DTOs only. Server contracts and authorization are a later slice. */
export type CustomerValues = {
  name: string;
  type: "person" | "business";
  companyName: string;
  email: string;
  phone: string;
  location: string;
  internalNotes: string;
  ownerId: string;
};
export type CustomerRecord = CustomerValues & {
  id: string;
  number: string;
  createdAt: string;
  lastActivityAt: string;
  archived: boolean;
  openLeadCount: number;
  activeJobCount?: number;
  version: number;
};
export type CustomerCapabilities = {
  read: boolean;
  create: boolean;
  update: boolean;
  archive: boolean;
  delete: boolean;
  export: boolean;
  link: boolean;
  note: boolean;
};
export type CustomerMember = { id: string; name: string };
export type LinkedCustomerRecord = {
  id: string;
  number: string;
  name: string;
  status: string;
  customerName?: string;
  customerId?: string | null;
  canUnlink?: boolean;
};
export type CustomerEvent = {
  id: string;
  text: string;
  actor: string;
  createdAt: string;
  source: "customer" | "lead" | "job";
};
export type CustomerNote = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
};
export type CustomerViewState =
  "ready" | "loading" | "error" | "forbidden" | "not-found";
