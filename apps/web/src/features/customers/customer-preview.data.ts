import type {
  CustomerCapabilities,
  CustomerRecord,
  CustomerValues,
  LinkedCustomerRecord,
  CustomerEvent,
  CustomerNote,
} from "./customer-preview.types";
export const customerPreviewData = {
  now: "2026-10-18T12:00:00Z",
  notice:
    "Interactive design preview · fictional data · changes stay in this story.",
  future: "Future Jobs module preview · fictional data only.",
  title: "Customers",
  description:
    "Keep customer relationships, contact details and linked leads in one place.",
  eyebrow: "Customer relationships",
  add: "Add customer",
  edit: "Edit contact",
  export: "Export CSV",
  back: "Back to customers",
  close: "Close",
  saved: "Customer saved in this preview.",
  changed: "Change applied in this preview.",
  opened: "Record selected in this preview.",
  forbidden: "You do not have access to Customers.",
  missing: "Customer not found.",
  loading: "Loading customer…",
  error: "Customer could not be loaded.",
  retry: "Try again",
  newCustomerName: "Casey Ellis",
  emptyName: "Taylor Brooks",
  emptyEmail: "taylor.brooks@example.com",
  emptyPhone: "(212) 555-0172",
  searchMissing: "No matching person",
  longName:
    "Alexandria Montgomery-Wellington and the Riverside Community Restoration Partnership",
  longEmail:
    "alexandria.montgomery-wellington@riverside-restoration.example.com",
  mockFailure:
    "The preview could not save this change. Your input is preserved.",
  conflict:
    "This customer changed since you opened it. Reload the latest version before saving.",
  note: "Prefers a phone call after 3 pm.",
  newNote: "Customer asked for a follow-up next week.",
  linkedElsewhere: "Morgan Reed",
  candidate: "Jordan Lee",
  groupLabel: "Customer designs",
  tabs: {
    overview: "Overview",
    leads: "Leads",
    activity: "Activity",
    notes: "Notes",
  },
};
export const customerMembers = [
  { id: "ava", name: "Ava Morgan" },
  { id: "sam", name: "Sam Rivera" },
  { id: "jo", name: "Jo Chen" },
];
export const customerOwnerCapabilities: CustomerCapabilities = {
  read: true,
  create: true,
  update: true,
  archive: true,
  delete: true,
  export: true,
  link: true,
  note: true,
};
export const customerOfficeCapabilities: CustomerCapabilities = {
  ...customerOwnerCapabilities,
  archive: false,
  delete: false,
  export: false,
};
export const customerReadOnlyCapabilities: CustomerCapabilities = {
  read: true,
  create: false,
  update: false,
  archive: false,
  delete: false,
  export: false,
  link: false,
  note: false,
};
export const customerFieldCapabilities: CustomerCapabilities = {
  ...customerReadOnlyCapabilities,
  read: false,
};
export const emptyCustomer: CustomerValues = {
  name: "",
  type: "person",
  companyName: "",
  email: "",
  phone: "",
  location: "",
  internalNotes: "",
  ownerId: "",
};
const names = [
  "Jordan Lee",
  "Taylor Brooks",
  "Priya Shah",
  "Mateo Rivera",
  "Avery Johnson",
  "Noah Kim",
  "Rosa Martinez",
  "Eli Turner",
];
export const customerFixtures: CustomerRecord[] = names.map((name, i) => ({
  ...emptyCustomer,
  id: `customer-${i + 1}`,
  number: `CU-${2018 + i}`,
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
  phone: `(212) 555-01${String(34 + i).padStart(2, "0")}`,
  location: i % 2 ? "Queens, NY" : "Brooklyn, NY",
  ownerId: i === 6 ? "" : customerMembers[i % 3].id,
  internalNotes: i === 0 ? customerPreviewData.note : "",
  type: i === 2 ? "business" : "person",
  companyName: i === 2 ? "Shah Design Studio" : "",
  createdAt: "2026-09-01T12:00:00Z",
  lastActivityAt: `2026-10-${String(18 - i).padStart(2, "0")}T12:00:00Z`,
  archived: i === 7,
  openLeadCount: [1, 2, 0, 1, 0, 1, 0, 0][i],
  version: 1,
}));
export const customerManyFixtures: CustomerRecord[] = Array.from(
  { length: 103 },
  (_, i) => ({
    ...customerFixtures[i % 8],
    id: `many-${i}`,
    number: `CU-${3000 + i}`,
    name: `${customerFixtures[i % 8].name} ${String(i + 1).padStart(3, "0")}`,
    archived: false,
  }),
);
export const customerLinkedLeads: LinkedCustomerRecord[] = [
  { id: "lead-1", number: "LD-0001", name: "Kitchen remodel", status: "New" },
  {
    id: "lead-2",
    number: "LD-0002",
    name: "Furnace repair",
    status: "Contacted",
  },
  {
    id: "lead-3",
    number: "LD-0003",
    name: "Drain cleaning",
    status: "Estimate sent",
    customerId: "elsewhere",
    customerName: customerPreviewData.linkedElsewhere,
  },
];
export const customerFutureJobs: LinkedCustomerRecord[] = [
  {
    id: "future-job-1",
    number: "JB-0001",
    name: "Replace hallway fixtures",
    status: "In progress",
  },
];
export const customerEvents: CustomerEvent[] = [
  {
    id: "event-1",
    text: "Contact details updated",
    actor: "Ava Morgan",
    createdAt: "2026-10-18T12:00:00Z",
    source: "customer",
  },
  {
    id: "event-2",
    text: "Lead linked · LD-0001",
    actor: "Sam Rivera",
    createdAt: "2026-10-17T12:00:00Z",
    source: "lead",
  },
  {
    id: "event-3",
    text: "Customer created",
    actor: "Ava Morgan",
    createdAt: "2026-09-01T12:00:00Z",
    source: "customer",
  },
];
export const customerNotes: CustomerNote[] = [
  {
    id: "note-1",
    body: customerPreviewData.note,
    author: "Ava Morgan",
    createdAt: "2026-10-18T12:00:00Z",
  },
];

export const customerPagedLeads = Array.from({ length: 42 }, (_, i) => ({
  ...customerLinkedLeads[i % 2],
  id: `paged-lead-${i}`,
  number: `LD-${String(i + 1).padStart(4, "0")}`,
}));
