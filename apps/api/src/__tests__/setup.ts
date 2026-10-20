/**
 * Vitest global setup
 *
 * Sets stub environment variables required by modules that validate env at
 * import time (cloudinary, prisma lib).  These stubs are never used for
 * real requests — the Prisma client and Cloudinary client are mocked in
 * individual test files.
 */

// Cloudinary (throws at import if any of these are missing)
process.env.CLOUDINARY_CLOUD_NAME   = process.env.CLOUDINARY_CLOUD_NAME   ?? "test-cloud";
process.env.CLOUDINARY_API_KEY      = process.env.CLOUDINARY_API_KEY      ?? "test-key";
process.env.CLOUDINARY_API_SECRET   = process.env.CLOUDINARY_API_SECRET   ?? "test-secret";

// Database (used by the real Prisma lib constructor; mocked in tests)
process.env.DATABASE_URL            = process.env.DATABASE_URL            ?? "postgresql://test:test@localhost:5432/test";

// JWT (used by auth middleware and tests)
process.env.JWT_SECRET              = process.env.JWT_SECRET              ?? "vitest-jwt-secret";
process.env.JWT_EXPIRES_IN          = process.env.JWT_EXPIRES_IN          ?? "15m";

// FRONTEND_URL — used by CORS to whitelist the production frontend origin.
process.env.FRONTEND_URL           = process.env.FRONTEND_URL           ?? "https://joemasky.vercel.app";
