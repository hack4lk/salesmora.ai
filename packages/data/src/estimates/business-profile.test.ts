import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  EstimateBusinessProfileInvalid,
  prepareEstimateBusinessLogo,
} from "./business-profile";

describe("estimate business logo preparation", () => {
  it("decodes accepted image content and stores a normalized WebP asset", async () => {
    const png = await sharp({
      create: {
        width: 32,
        height: 24,
        channels: 4,
        background: { r: 20, g: 80, b: 120, alpha: 1 },
      },
    }).png().toBuffer();
    const prepared = await prepareEstimateBusinessLogo({ type: "image/png", data: png });

    await expect(sharp(prepared).metadata()).resolves.toMatchObject({
      format: "webp",
      width: 32,
      height: 24,
    });
  });

  it("rejects mismatched MIME types and unreadable image bytes", async () => {
    await expect(prepareEstimateBusinessLogo({
      type: "image/jpeg",
      data: Buffer.from("not an image"),
    })).rejects.toBeInstanceOf(EstimateBusinessProfileInvalid);

    const png = await sharp({
      create: {
        width: 8,
        height: 8,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    }).png().toBuffer();
    await expect(prepareEstimateBusinessLogo({
      type: "image/jpeg",
      data: png,
    })).rejects.toBeInstanceOf(EstimateBusinessProfileInvalid);
  });

  it("rejects unsupported and oversized uploads before decoding", async () => {
    await expect(prepareEstimateBusinessLogo({
      type: "image/svg+xml",
      data: Buffer.from("<svg />"),
    })).rejects.toBeInstanceOf(EstimateBusinessProfileInvalid);
    await expect(prepareEstimateBusinessLogo({
      type: "image/png",
      data: Buffer.alloc(2 * 1024 * 1024 + 1),
    })).rejects.toBeInstanceOf(EstimateBusinessProfileInvalid);
  });
});
