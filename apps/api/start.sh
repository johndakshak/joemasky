#!/bin/sh
# start.sh — container entrypoint for the JoeMasky API
#
# Responsibilities:
#   1. Validate required environment variables.
#   2. Apply pending database migrations.
#   3. Start the API server only if migrations succeed.

set -e

# ── 1. Require DIRECT_URL ────────────────────────────────────────────────────

if [ -z "$DIRECT_URL" ]; then
  echo "ERROR: DIRECT_URL is not set. Set it in the Render service environment."
  exit 1
fi

# ── 2. Apply pending migrations ──────────────────────────────────────────────

echo "INFO: Running prisma migrate deploy..."
npx prisma migrate deploy

# ── 3. Start the API server ──────────────────────────────────────────────────

echo "INFO: Starting API server..."
exec node dist/server.js
