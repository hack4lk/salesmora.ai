import { describe, expect, it } from "vitest";
import { estimateCapabilitiesByRole as roles } from "../estimate-preview.data";
import { estimateStatuses } from "../estimate-preview.types";
import { estimateConvertDialogData as c, estimateConversionFixture as estimate } from "./estimate-convert-dialog.data";
import {
  estimateConversionJobHref, getEstimateConversionIssues, initialEstimateConversionReview, isEstimateConversionReviewCurrent, reviewEstimateConversion,
  type EstimateConversionInput, type EstimateConversionJobRef,
} from "./estimate-convert-dialog.preview";

const customer = { state: "ready" as const, id: estimate.customerId!, name: c.stories.customer };
const members = [{ id: "sam", name: c.stories.member, role: "owner" as const }, { id: "taylor", name: c.stories.secondMember, role: "office" as const }];
const input: EstimateConversionInput = {
  estimate, capabilities: roles.owner, canCreateJob: true, canScheduleCreation: true,
  customer, members, review: initialEstimateConversionReview(estimate, customer),
};
const job = input.review.job;
const jobRef: EstimateConversionJobRef = { id: "22222222-2222-4222-8222-222222222222", number: "J-1208", canOpen: true };

describe("Prefilled conversion review", () => {
  it("copies only customer-facing work details, without inventing dates, assignments or prices", () => {
    expect(input.review).toEqual({
      estimateId: estimate.id, expectedVersion: estimate.version,
      expectedLeadVersion: estimate.sourceLeadVersion, expectedCustomerVersion: estimate.customerVersion,
      snapshotHash: estimate.snapshotHash, sourceLeadId: estimate.parentId,
      job: {
        customerId: customer.id, customerName: customer.name, title: estimate.name,
        service: estimate.service, location: estimate.serviceAddress, description: estimate.scope,
        primaryOwnerId: null, teamUserIds: [], scheduledDate: null, arrivalWindow: null, completionDeadline: null,
      },
    });
  });
  it("does not truncate an estimate scope that exceeds Jobs' limit", () => {
    const longEstimate = { ...estimate, scope: "x".repeat(5000) };
    const review = initialEstimateConversionReview(longEstimate, customer);
    expect(review.job.description.length).toBe(5000);
    expect(reviewEstimateConversion({ ...input, estimate: longEstimate, review }).issues).toContain(c.errors.description);
  });
  it.each(["missing", "unavailable"] as const)("never invents a customer when %s", (state) => {
    expect(initialEstimateConversionReview(estimate, { state }).job).toMatchObject({ customerId: "", customerName: "" });
  });
  it("produces the exact version/snapshot/source/job request without client prices or permissions", () => {
    const result = reviewEstimateConversion(input);
    expect(result).toEqual({
      issues: [], request: {
        estimateId: estimate.id, expectedVersion: estimate.version,
        expectedLeadVersion: estimate.sourceLeadVersion, expectedCustomerVersion: estimate.customerVersion,
        snapshotHash: estimate.snapshotHash, sourceLeadId: estimate.parentId,
        job: {
          customerId: customer.id, title: estimate.name, service: estimate.service, location: estimate.serviceAddress, description: estimate.scope,
          primaryOwnerId: null, teamUserIds: [], scheduledDate: null, arrivalWindow: null, completionDeadline: null,
        },
      },
    });
    expect(result.request?.job).not.toHaveProperty("customerName");
    expect(result.request).not.toHaveProperty("totalCents");
  });
});

describe("Lead-only conversion authorization and lifecycle", () => {
  it.each(estimateStatuses)("requires Accepted, not %s", (status) => {
    expect(reviewEstimateConversion({ ...input, estimate: { ...estimate, status } }).request !== null).toBe(status === "accepted");
  });
  it.each(estimateStatuses)("blocks archived %s", (status) => {
    expect(reviewEstimateConversion({ ...input, estimate: { ...estimate, status, archived: true } }).issues).toContain(c.errors.archived);
  });
  it.each(["owner", "admin", "office"] as const)("honors explicit job/customer grants for %s", (role) => {
    expect(reviewEstimateConversion({ ...input, capabilities: roles[role] }).request).not.toBeNull();
  });
  it("requires job creation independently from estimate create/update/decide/send", () => {
    expect(reviewEstimateConversion({ ...input, canCreateJob: false }).issues).toContain(c.errors.create);
    expect(reviewEstimateConversion({ ...input, capabilities: { ...roles.owner, create: false, update: false, decide: false, send: false } }).request).not.toBeNull();
  });
  it("blocks job-linked estimates even with every capability granted", () => {
    const result = reviewEstimateConversion({ ...input, estimate: { ...estimate, parentType: "job" } });
    expect(result.issues).toContain(c.parentJob); expect(result.request).toBeNull();
  });
  it("blocks a second conversion whether or not the converted job can be opened", () => {
    for (const canOpen of [true, false]) {
      const result = reviewEstimateConversion({ ...input, estimate: {
        ...estimate, convertedJob: { ...jobRef, canOpen }, convertedJobExists: true, sourceLeadHasJob: true,
      } });
      expect(result.issues).toContain(c.converted); expect(result.request).toBeNull();
    }
  });
  it("blocks a source lead with another Job even when the estimate was not converted", () => {
    const result = reviewEstimateConversion({ ...input, estimate: { ...estimate, sourceLeadHasJob: true } });
    expect(result.issues).toContain(c.errors.leadHasJob);
    expect(result.request).toBeNull();
  });
  it("no read access returns only generic information, including with malformed private job details", () => {
    const noRead = { ...input, capabilities: { ...roles.owner, read: false } };
    expect(getEstimateConversionIssues(noRead)).toEqual([c.errors.read]);
    expect(reviewEstimateConversion(noRead, { ...job, title: "", description: "x".repeat(5000), customerId: "" }))
      .toEqual({ issues: [c.errors.read], request: null });
  });
  it.each(["missing", "unavailable"] as const)("blocks %s customer without silently creating one", (state) => {
    const result = reviewEstimateConversion({ ...input, customer: { state } });
    expect(result.issues).toContain(state === "missing" ? c.customerMissing : c.errors.customerAccess);
    expect(result.request).toBeNull();
  });
  it.each([{ id: "invalid" }, { name: "" }, { id: "33333333-3333-4333-8333-333333333333" }])("rejects stale/invalid authorized customer %j", (patch) => {
    expect(reviewEstimateConversion({ ...input, customer: { ...customer, ...patch } }).issues).toContain(c.errors.customerMismatch);
  });
  it("keeps the customer derived from the current lead and never accepts inline new-customer data", () => {
    for (const patch of [
      { customerId: "33333333-3333-4333-8333-333333333333" },
      { newCustomer: { name: "New", email: "", phone: "" } }, { allowDuplicate: true },
    ]) {
      expect(reviewEstimateConversion(input, { ...job, ...patch }).issues).toContain(c.errors.customerMismatch);
    }
  });
});

describe("Version, snapshot and saved record binding", () => {
  it.each([
    { estimateId: "other" }, { expectedVersion: 5 }, { expectedVersion: 7 }, { snapshotHash: "different" },
    { snapshotHash: "" }, { sourceLeadId: "different-lead" },
  ])("requires the exact reviewed metadata %j", (patch) => {
    const changed = { ...input, review: { ...input.review, ...patch } };
    expect(isEstimateConversionReviewCurrent(changed)).toBe(false);
    expect(reviewEstimateConversion(changed).issues).toContain(c.errors.binding);
  });
  it.each([
    { id: "" }, { number: " " }, { name: "" }, { name: "x".repeat(121) }, { revision: 0 }, { revision: 1.5 },
    { version: 0 }, { version: Infinity }, { parentId: "" }, { parentId: "not-a-uuid" }, { parentNumber: "" }, { snapshotHash: " " },
  ])("blocks invalid saved metadata %j", (patch) => {
    expect(reviewEstimateConversion({ ...input, estimate: { ...estimate, ...patch } }).issues).toContain(c.errors.record);
  });
  it.each([null, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid accepted amount %j", (totalCents) => {
    expect(reviewEstimateConversion({ ...input, estimate: { ...estimate, totalCents } }).issues).toContain(c.errors.total);
  });
  it.each([0, 2_000_000_000])("allows legitimate zero/maximum snapshot amount %s", (totalCents) => {
    expect(reviewEstimateConversion({ ...input, estimate: { ...estimate, totalCents } }).request).not.toBeNull();
  });
});

describe("Reusing Jobs field contracts", () => {
  it.each([
    { title: "", issue: c.errors.title }, { title: "x".repeat(201), issue: c.errors.title },
    { service: "x".repeat(201), issue: c.errors.service }, { location: "x".repeat(501), issue: c.errors.location },
    { description: "x".repeat(4001), issue: c.errors.description },
  ])("rejects invalid job field $issue", ({ issue, ...patch }) => {
    expect(reviewEstimateConversion(input, { ...job, ...patch }).issues).toContain(issue);
  });
  it("normalizes job text without copying internal fields or changing the estimate", () => {
    const result = reviewEstimateConversion(input, { ...job, title: "  Work  ", description: `  ${c.stories.literal}  ` });
    expect(result.request?.job).toMatchObject({ title: "Work", description: c.stories.literal });
    expect(estimate.name).toBe(c.stories.name);
  });
  it("allows explicitly selected available owner/team and copies the team array", () => {
    const teamUserIds = ["taylor"];
    const result = reviewEstimateConversion(input, { ...job, primaryOwnerId: "sam", teamUserIds });
    expect(result.request?.job).toMatchObject({ primaryOwnerId: "sam", teamUserIds: ["taylor"] });
    expect(result.request?.job.teamUserIds).not.toBe(teamUserIds);
  });
  it.each([
    { primaryOwnerId: "missing" }, { primaryOwnerId: "" }, { teamUserIds: ["missing"] }, { teamUserIds: ["sam", "sam"] },
    { primaryOwnerId: "sam", teamUserIds: ["sam"] }, { teamUserIds: Array.from({ length: 101 }, (_, i) => `member-${i}`) },
  ])("rejects unavailable/duplicate assignment %j", (patch) => {
    expect(reviewEstimateConversion(input, { ...job, ...patch }).issues).toContain(c.errors.members);
  });
  it.each([
    { scheduledDate: "2026-02-30" }, { scheduledDate: "0000-01-01" }, { completionDeadline: "2026-02-30" },
    { arrivalWindow: "08:00-10:00" }, { scheduledDate: "2026-10-23", arrivalWindow: "not-a-window" },
  ])("rejects invalid scheduling %j", (patch) => {
    expect(reviewEstimateConversion(input, { ...job, ...patch }).issues).toContain(c.errors.dates);
  });
  it("allows valid scheduled dates/windows/deadlines with schedule permission", () => {
    expect(reviewEstimateConversion(input, { ...job, scheduledDate: "2026-11-01", arrivalWindow: "08:00-10:00", completionDeadline: "2026-11-08" }).request)
      .toMatchObject({ job: { scheduledDate: "2026-11-01", arrivalWindow: "08:00-10:00", completionDeadline: "2026-11-08" } });
  });
  it("permits unscheduled creation but never dates without scheduling permission", () => {
    expect(reviewEstimateConversion({ ...input, canScheduleCreation: false }).request).not.toBeNull();
    for (const patch of [{ scheduledDate: "2026-11-01" }, { completionDeadline: "2026-11-08" }]) {
      expect(reviewEstimateConversion({ ...input, canScheduleCreation: false }, { ...job, ...patch }).issues).toContain(c.errors.schedule);
    }
  });
  it("does not mutate inputs, snapshot work or grants", () => {
    const before = structuredClone(input); reviewEstimateConversion(input); expect(input).toEqual(before);
  });
});

describe("Authorized existing-job links", () => {
  it("only exposes a local job URL for an authorized well-formed reference", () => {
    expect(estimateConversionJobHref(jobRef)).toBe(`/jobs/${jobRef.id}`);
    expect(estimateConversionJobHref({ ...jobRef, canOpen: false })).toBeNull();
    expect(estimateConversionJobHref({ ...jobRef, number: " " })).toBeNull();
  });
  it.each(["", "../settings", "https://other.example", "javascript:alert(1)", "job-id"])("never turns malformed job ID %j into navigation", (id) => {
    expect(estimateConversionJobHref({ ...jobRef, id })).toBeNull();
  });
});
