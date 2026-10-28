import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configuredEstimateSharingAvailable } from "./sharing-availability";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ read: vi.fn(), logo: vi.fn() }));
vi.mock("@salesmora/data", () => ({
  createStorageAdapter: vi.fn(),
  readPublicEstimate: mocks.read,
  readPublicEstimateLogo: mocks.logo,
}));
vi.mock("../workspaces/store", () => ({ database: vi.fn() }));
import { publicEstimateHeaders, publicEstimateLogo, publicEstimateSource } from "./public";

beforeEach(() => {
  vi.stubEnv("BETTER_AUTH_URL", "http://127.0.0.1:3000");
  vi.stubEnv("ESTIMATE_EMAIL_ENABLED", "false");
  vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("local sharing rollout", () => {
  it("enables scoped public reads only for the explicitly enabled HTTPS staging deployment", async () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://staging.example.test");
    vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", "staging");
    vi.stubEnv("ESTIMATE_EMAIL_ENABLED", "true");
    mocks.read.mockResolvedValue({ state: "not-found" });
    mocks.logo.mockResolvedValue({ state: "not-found" });
    expect(await publicEstimateSource("fictional-token")).toEqual({ source: { state: "not-found" }, status: 404 });
    expect(await publicEstimateLogo("fictional-token")).toEqual({ state: "not-found", status: 404 });
    expect(mocks.read).toHaveBeenCalledOnce(); expect(mocks.logo).toHaveBeenCalledOnce();
    mocks.read.mockClear(); mocks.logo.mockClear();
    vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", "production");
    expect(await publicEstimateSource("fictional-token")).toEqual({ source: { state: "unavailable" }, status: 503 });
    expect(await publicEstimateLogo("fictional-token")).toEqual({ state: "unavailable", status: 503 });
    expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.logo).not.toHaveBeenCalled();
  });
  it("enables only explicitly configured loopback origins", () => {
    for (const origin of ["http://127.0.0.1:3000", "http://localhost:3002", "http://[::1]:3000"]) {
      expect(configuredEstimateSharingAvailable(origin)).toBe(true);
    }
    for (const origin of ["", "https://salesmora.example", "https://localhost.example", "ftp://localhost"]) {
      expect(configuredEstimateSharingAvailable(origin)).toBe(false);
    }
  });

  it("keeps nonlocal public page and logo reads disabled without consulting data", async () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://salesmora.example");
    expect(await publicEstimateSource("private-token")).toEqual({ source: { state: "unavailable" }, status: 503 });
    expect(await publicEstimateLogo("private-token")).toEqual({ state: "unavailable", status: 503 });
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.logo).not.toHaveBeenCalled();
  });
});

describe("public estimate boundary", () => {
  it.each([
    ["not-found", 404], ["expired", 410], ["revoked", 410], ["withdrawn", 410],
    ["replaced", 410], ["rate-limited", 429], ["unavailable", 503],
  ])("maps inactive %s without exposing a snapshot", async (state, status) => {
    mocks.read.mockResolvedValue({ state });
    expect(await publicEstimateSource("fictional-token")).toEqual({ source: { state }, status });
    expect(mocks.read).toHaveBeenCalledWith(undefined, "fictional-token", "estimate-public-local");
  });

  it("reports unexpected failure without logging the token, customer content or raw error", async () => {
    mocks.read.mockRejectedValue(new Error("TOKEN_AND_CUSTOMER_DETAILS"));
    expect(await publicEstimateSource("TOKEN_AND_CUSTOMER_DETAILS")).toEqual({ source: { state: "error" }, status: 500 });
    expect(console.error).toHaveBeenCalledWith("Public estimate read failed.");
    mocks.logo.mockRejectedValue(new Error("TOKEN_AND_CUSTOMER_DETAILS"));
    expect(await publicEstimateLogo("TOKEN_AND_CUSTOMER_DETAILS")).toEqual({ state: "error", status: 500 });
    expect(console.error).toHaveBeenLastCalledWith("Public estimate logo read failed.");
  });

  it("sets private no-store, no-referrer and noindex protections", () => {
    expect(publicEstimateHeaders).toMatchObject({
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Content-Type-Options": "nosniff",
    });
  });
});
