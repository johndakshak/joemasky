import "dotenv/config";
import { defineConfig } from "prisma/config";

// dotenv/config loads .env in local development.
// In production containers (Render) there is no .env file; DIRECT_URL must be
// set as an environment variable on the service.  We guard explicitly so the
// error message is clear and actionable rather than Prisma's generic
// "datasource.url property is required".
const directUrl = process.env["DIRECT_URL"];
if (!directUrl) {
  throw new Error(
    "DIRECT_URL environment variable is not set. " +
    "Add it to your .env file for local development or to your Render environment variables for production."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: directUrl,
  },
});
