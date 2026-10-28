import type {
  EstimateCapabilities,
  EstimateMember,
  EstimateRole,
  EstimateRow,
  EstimateStatus,
} from "./estimate-preview.types";

/** Fictional preview data. Stories never fetch, persist or call AI. */
export const estimatePreviewData = {
  /** Fixed "today" so date-driven states are stable in stories and tests. */
  now: "2026-10-22T16:00:00Z",
  today: "2026-10-22",
  notice:
    "Interactive design preview · fictional data · changes stay in this story.",
  members: [
    { id: "member-alex", name: "Alex Morgan" },
    { id: "member-sam", name: "Sam Rivera" },
  ] satisfies EstimateMember[],
  longName:
    "Whole-home kitchen, bathroom and exterior restoration estimate for the Montgomery-Wellington residence",
  longCustomer:
    "Alexandria Montgomery-Wellington and the Riverside Community Restoration Partnership",
};

const alex = "member-alex";
const sam = "member-sam";
type Seed = Omit<EstimateRow, "revision" | "decidedAt" | "archived" | "version"> &
  Partial<Pick<EstimateRow, "revision" | "decidedAt" | "archived">>;
const seed = (row: Seed): EstimateRow => ({
  revision: 1,
  decidedAt: null,
  archived: false,
  version: 1,
  ...row,
});

export const estimateFixtures: EstimateRow[] = [
  seed({ id: "est-2048", number: "EST-2048", name: "Kitchen remodel estimate", customerName: "Jordan Lee", service: "Kitchen remodel", status: "draft", totalCents: 865556, parentType: "lead", parentId: "lead-1048", parentNumber: "LD-1048", ownerId: alex, validUntil: null, updatedAt: "2026-10-22T14:00:00Z" }),
  seed({ id: "est-2047", number: "EST-2047", name: "HVAC tune-up estimate", customerName: "Morgan Lee", service: "HVAC system tune-up", status: "sent", totalCents: 136094, parentType: "lead", parentId: "lead-2084", parentNumber: "LD-2084", ownerId: sam, validUntil: "2026-11-18", updatedAt: "2026-10-22T13:00:00Z" }),
  seed({ id: "est-2044", number: "EST-2044", name: "Gutter replacement estimate", customerName: "Elena Ruiz", service: "Gutter replacement", status: "sent", totalCents: 215000, parentType: "lead", parentId: "lead-1031", parentNumber: "LD-1031", ownerId: alex, validUntil: "2026-10-26", updatedAt: "2026-10-12T15:00:00Z" }),
  seed({ id: "est-2042", number: "EST-2042", name: "Water heater replacement estimate", customerName: "Priya Shah", service: "Water heater replacement", status: "accepted", totalCents: 329674, parentType: "job", parentId: "job-1040", parentNumber: "J-1040", ownerId: alex, validUntil: "2026-10-30", decidedAt: "2026-10-05", updatedAt: "2026-10-05T15:00:00Z" }),
  seed({ id: "est-2039", number: "EST-2039", name: "Kitchen remodel · Phase 1", customerName: "Lena Ortiz", service: "Kitchen remodel", status: "published", totalCents: 1247753, parentType: "job", parentId: "job-1038", parentNumber: "J-1038", ownerId: sam, validUntil: "2026-10-28", updatedAt: "2026-10-04T15:00:00Z" }),
  seed({ id: "est-2032", number: "EST-2032", name: "Electrical panel upgrade estimate", customerName: "Noah Patel", service: "Electrical panel upgrade", status: "declined", totalCents: 424613, parentType: "lead", parentId: "lead-1009", parentNumber: "LD-1009", ownerId: alex, validUntil: "2026-10-15", decidedAt: "2026-10-02", updatedAt: "2026-10-02T15:00:00Z" }),
  seed({ id: "est-2028", number: "EST-2028", name: "Roof repair estimate", customerName: "Dana Cruz", service: "Roof repair", status: "expired", totalCents: 289000, parentType: "lead", parentId: "lead-1002", parentNumber: "LD-1002", ownerId: sam, validUntil: "2026-09-30", updatedAt: "2026-09-20T15:00:00Z" }),
  seed({ id: "est-2026", number: "EST-2026", name: "Bathroom remodel estimate", customerName: "Chris Wu", service: "Bathroom remodel", status: "superseded", totalCents: 610000, parentType: "lead", parentId: "lead-1001", parentNumber: "LD-1001", ownerId: alex, validUntil: "2026-10-10", updatedAt: "2026-09-28T15:00:00Z" }),
  seed({ id: "est-2025", number: "EST-2025", name: "Duplicate drain estimate", customerName: "Ivy Park", service: "Drain cleaning", status: "void", totalCents: 42000, parentType: "job", parentId: "job-1021", parentNumber: "J-1021", ownerId: sam, validUntil: null, updatedAt: "2026-09-18T15:00:00Z" }),
  seed({ id: "est-2018", number: "EST-2018", name: "Fence repair estimate", customerName: "Omar Haddad", service: "Fence repair", status: "declined", totalCents: 178000, parentType: "lead", parentId: "lead-0987", parentNumber: "LD-0987", ownerId: sam, validUntil: "2026-09-05", decidedAt: "2026-09-02", archived: true, updatedAt: "2026-09-08T15:00:00Z" }),
];

const manyStatuses: EstimateStatus[] = ["draft", "sent", "published", "accepted", "declined", "expired"];
/** 60 rows for paging stories. */
export const estimateManyFixtures: EstimateRow[] = Array.from({ length: 60 }, (_, index) => {
  const n = 1900 + index;
  const status = manyStatuses[index % manyStatuses.length];
  return seed({
    id: `est-${n}`,
    number: `EST-${n}`,
    name: `Service estimate ${n}`,
    customerName: `Customer ${index + 1}`,
    service: "General service",
    status,
    totalCents: 100000 + index * 12345,
    parentType: index % 3 === 0 ? "job" : "lead",
    parentId: `parent-${n}`,
    parentNumber: index % 3 === 0 ? `J-${1100 + index}` : `LD-${2000 + index}`,
    ownerId: index % 2 ? sam : alex,
    validUntil: status === "draft" ? null : "2026-11-30",
    updatedAt: `2026-10-${String(1 + (index % 20)).padStart(2, "0")}T15:00:00Z`,
  });
});

/** Explicit fixture assignments, not all estimates whose parent happens to be a job. */
export const estimateAssignedJobIds = ["job-1040", "job-1038"];
export const estimateFieldFixtures = estimateFixtures.filter(
  (row) => row.parentType === "job" && estimateAssignedJobIds.includes(row.parentId),
);

const all: EstimateCapabilities = {
  read: true, create: true, update: true, send: true, decide: true,
  void: true, archive: true, delete: true, export: true,
};
export const estimateCapabilitiesByRole: Record<EstimateRole, EstimateCapabilities> = {
  owner: all,
  admin: all,
  office: { ...all, export: false },
  field: { ...all, void: false, archive: false, delete: false, export: false },
};
export const estimateOwnerCapabilities = estimateCapabilitiesByRole.owner;
export const estimateAdminCapabilities = estimateCapabilitiesByRole.admin;
export const estimateOfficeCapabilities = estimateCapabilitiesByRole.office;
export const estimateFieldCapabilities = estimateCapabilitiesByRole.field;
