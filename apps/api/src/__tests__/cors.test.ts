/**
 * CORS policy — integration tests
 *
 * Verifies that the configured CORS middleware:
 *   1. Allows the production frontend origin.
 *   2. Allows localhost for local development.
 *   3. Blocks unrelated origins.
 *   4. Handles preflight OPTIONS requests with the expected methods/headers.
 *
 * The Prisma client and Cloudinary are mocked so no external services are needed.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// ── Module mocks — must be declared before any imports that trigger them ─────

vi.mock("../lib/cloudinary", () => ({
  cloudinary: {},
  upload: { single: () => (_req: unknown, _res: unknown, next: () => void) => next() },
  uploadImageBuffer: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
  prisma: {
    product: { findMany: vi.fn(), findUnique: vi.fn() },
    admin: { findUnique: vi.fn() },
    adminInvite: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

import app from "../app";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CORS policy", () => {
  it("allows the production frontend origin", async () => {
    const res = await request(app)
      .get("/products")
      .set("Origin", "https://joemasky.vercel.app");

    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://joemasky.vercel.app"
    );
  });

  it("allows localhost:3000 for local development", async () => {
    const res = await request(app)
      .get("/products")
      .set("Origin", "http://localhost:3000");

    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000"
    );
  });

  it("blocks an unrelated origin", async () => {
    const res = await request(app)
      .get("/products")
      .set("Origin", "https://evil.example.com");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("handles preflight OPTIONS with Authorization and Content-Type", async () => {
    const res = await request(app)
      .options("/login/admin")
      .set("Origin", "https://joemasky.vercel.app")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Authorization, Content-Type");

    expect(res.status).toBeLessThan(400);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://joemasky.vercel.app"
    );
    expect(res.headers["access-control-allow-headers"]).toContain(
      "Authorization"
    );
    expect(res.headers["access-control-allow-headers"]).toContain(
      "Content-Type"
    );
    expect(res.headers["access-control-allow-methods"]).toContain("POST");
  });

  it("does not set Access-Control-Allow-Credentials", async () => {
    const res = await request(app)
      .get("/products")
      .set("Origin", "https://joemasky.vercel.app");

    expect(res.headers["access-control-allow-credentials"]).toBeUndefined();
  });
});
