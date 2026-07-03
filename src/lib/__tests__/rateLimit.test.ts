import { checkRateLimit, resetRateLimitStore } from "../rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit("user-a", 0);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("blocks the 11th request within the same window", () => {
    for (let i = 0; i < 10; i += 1) {
      expect(checkRateLimit("user-b", 0).allowed).toBe(true);
    }
    const eleventh = checkRateLimit("user-b", 0);
    expect(eleventh.allowed).toBe(false);
    expect(eleventh.remaining).toBe(0);
  });

  it("resets once the window elapses", () => {
    for (let i = 0; i < 10; i += 1) {
      checkRateLimit("user-c", 0);
    }
    expect(checkRateLimit("user-c", 0).allowed).toBe(false);
    expect(checkRateLimit("user-c", 61_000).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    for (let i = 0; i < 10; i += 1) {
      checkRateLimit("user-d", 0);
    }
    expect(checkRateLimit("user-d", 0).allowed).toBe(false);
    expect(checkRateLimit("user-e", 0).allowed).toBe(true);
  });
});
