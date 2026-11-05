import { describe, expect, it } from "vitest";
import { Readable, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import {
  adminWorkspaceExportLimits,
  assertAdminExportByteLimit,
  assertAdminExportRowLimit,
  createAdminExportByteLimitTransform,
} from "./admin-workspace-exports.js";

describe("Admin workspace export limits", () => {
  it("uses the reviewed row and byte caps", () => {
    expect(adminWorkspaceExportLimits).toEqual({
      rowsPerDataset: 50_000,
      csvBytes: 500 * 1024 * 1024,
      archiveBytes: 500 * 1024 * 1024,
    });
    expect(Object.isFrozen(adminWorkspaceExportLimits)).toBe(true);
  });

  it("allows exactly the byte limit and rejects the first byte over it", async () => {
    const csvLimit = adminWorkspaceExportLimits.csvBytes;
    expect(() => assertAdminExportByteLimit(csvLimit, csvLimit)).not.toThrow();
    expect(() => assertAdminExportByteLimit(csvLimit + 1, csvLimit)).toThrow("export_limit_exceeded");

    let counted = 0;
    await pipeline(
      Readable.from([Buffer.alloc(2), Buffer.alloc(2)]),
      createAdminExportByteLimitTransform(4, bytes => { counted += bytes; }),
      new Writable({ write(_chunk, _encoding, callback) { callback(); } }),
    );
    expect(counted).toBe(4);

    await expect(pipeline(
      Readable.from([Buffer.alloc(4), Buffer.alloc(1)]),
      createAdminExportByteLimitTransform(4),
      new Writable({ write(_chunk, _encoding, callback) { callback(); } }),
    )).rejects.toThrow("export_limit_exceeded");
  });

  it("allows 50,000 rows per dataset and rejects row 50,001", () => {
    expect(() => assertAdminExportRowLimit(50_000)).not.toThrow();
    expect(() => assertAdminExportRowLimit(50_001)).toThrow("export_limit_exceeded");
  });

  it("rejects invalid limits instead of silently disabling the bound", () => {
    expect(() => createAdminExportByteLimitTransform(0)).toThrow("positive safe integer");
    expect(() => createAdminExportByteLimitTransform(Number.POSITIVE_INFINITY)).toThrow("positive safe integer");
  });
});
