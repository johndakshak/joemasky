import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to mock global.fetch and then import the module under test.
// Set the env var BEFORE importing the module.
beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "https://test-api.example.com";
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function importClient() {
  const mod = await import("@/lib/api/client");
  return mod;
}

describe("apiClient", () => {
  it("returns body.data on a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [{ id: 1 }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    global.fetch = fetchMock;

    const { apiClient } = await importClient();
    const result = await apiClient("/products");

    expect(result).toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-api.example.com/products",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("throws ApiError with the server message on non-2xx", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { apiClient, ApiError } = await importClient();
    await expect(apiClient("/product/999")).rejects.toThrow("Not found");

    try {
      await apiClient("/product/999");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as InstanceType<typeof ApiError>).status).toBe(404);
    }
  });

  it("provides a clear message for 503 (cold start) responses", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("", { status: 503 }),
    );

    const { apiClient } = await importClient();
    await expect(apiClient("/products")).rejects.toThrow(
      /starting up/i,
    );
  });

  it("provides a clear message for 502 (bad gateway) responses", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("", { status: 502 }),
    );

    const { apiClient } = await importClient();
    await expect(apiClient("/products")).rejects.toThrow(
      /temporarily unavailable/i,
    );
  });

  it("handles non-JSON responses gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("<html>Bad Gateway</html>", {
        status: 502,
        headers: { "Content-Type": "text/html" },
      }),
    );

    const { apiClient } = await importClient();
    await expect(apiClient("/products")).rejects.toThrow(
      /temporarily unavailable/i,
    );
  });

  it("handles empty response body on error", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("", { status: 500 }),
    );

    const { apiClient } = await importClient();
    await expect(apiClient("/products")).rejects.toThrow(/Request failed|server/i);
  });

  it("wraps network failures in an ApiError with status 0", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    const { apiClient, ApiError } = await importClient();
    try {
      await apiClient("/products");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as InstanceType<typeof ApiError>).status).toBe(0);
      expect((err as Error).message).toMatch(/unable to reach the server/i);
    }
  });

  it("throws on a 200 response with no data field (malformed)", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { apiClient } = await importClient();
    await expect(apiClient("/products")).rejects.toThrow(/invalid response/i);
  });

  it("throws on a 200 response with data: null (null is valid, undefined is not)", async () => {
    // null is a valid data value (e.g., no product found) — should NOT throw
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { apiClient } = await importClient();
    const result = await apiClient("/product/999");
    expect(result).toBeNull();
  });

  it("passes through custom headers and options", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    global.fetch = fetchMock;

    const { apiClient } = await importClient();
    await apiClient("/login/admin", {
      method: "POST",
      headers: { Authorization: "Bearer xyz" },
      body: JSON.stringify({ email: "a@b.com", password: "x" }),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-api.example.com/login/admin",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer xyz",
        }),
      }),
    );
  });
});
