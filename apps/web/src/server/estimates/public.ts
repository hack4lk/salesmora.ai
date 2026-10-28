import "server-only";
import { createStorageAdapter, readPublicEstimate, readPublicEstimateLogo } from "@salesmora/data";
import type { PublicEstimateSource } from "../../features/estimates/public-estimate-view/public-estimate-view.preview";
import { database } from "../workspaces/store";
import { configuredEstimateSharingAvailable } from "./sharing-availability";

export const publicEstimateHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
};

// Public requests share a server-owned bucket. Forwarded headers are not a trusted client identity.
const requesterKey = "estimate-public-local";

function publicStatus(state: PublicEstimateSource["state"]) {
  if (state === "ready") return 200;
  if (state === "not-found") return 404;
  if (state === "rate-limited") return 429;
  if (state === "error") return 500;
  return state === "unavailable" ? 503 : 410;
}

export async function publicEstimateSource(token: string): Promise<{ source: PublicEstimateSource; status: number }> {
  if (!configuredEstimateSharingAvailable()) return { source: { state: "unavailable" }, status: 503 };
  try {
    const read = await readPublicEstimate(database(), token, requesterKey);
    if (read.state !== "ready") return { source: read, status: publicStatus(read.state) };
    const paper = read.snapshot;
    const source: PublicEstimateSource = {
      state: "ready",
      snapshot: {
        ...paper,
        content: {
          ...paper.content,
          business: {
            ...paper.content.business,
            logoPath: paper.content.business.logoPath ? `/api/public/estimates/${token}/logo` : null,
          },
        },
      },
    };
    return { source, status: 200 };
  } catch {
    // Never log the token-bearing URL, customer paper or raw database/storage error.
    console.error("Public estimate read failed.");
    return { source: { state: "error" }, status: 500 };
  }
}

export async function publicEstimateLogo(token: string) {
  if (!configuredEstimateSharingAvailable()) return { state: "unavailable", status: 503 } as const;
  try {
    const result = await readPublicEstimateLogo(database(), createStorageAdapter(), token, requesterKey);
    return result.state === "ready"
      ? { state: "ready" as const, image: result.image, status: 200 }
      : { state: result.state, status: publicStatus(result.state) };
  } catch {
    console.error("Public estimate logo read failed.");
    return { state: "error", status: 500 } as const;
  }
}
