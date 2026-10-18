import "dotenv/config";
import { defineConfig } from "prisma/config";

// datasource.url is only needed when running `prisma migrate deploy` at container
// start-up.  During `prisma generate` (Docker build) the value is not used, so we
// fall back to a local placeholder that keeps the build from failing.
// The real DIRECT_URL must be supplied as a Render environment variable; the
// Dockerfile CMD checks for it explicitly before invoking migrate deploy.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? "postgresql://localhost:5432/placeholder_for_build",
  },
});
