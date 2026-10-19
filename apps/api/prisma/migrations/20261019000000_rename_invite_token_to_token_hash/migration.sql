-- Rename the raw-token column to tokenHash.
-- The application now generates a 32-byte random token,
-- stores only its SHA-256 hex digest here, and returns
-- the raw token to the Super Admin once (never persisted).

-- The original migration created the uniqueness guarantee as a unique INDEX
-- (not a named CONSTRAINT), so we must DROP INDEX, not DROP CONSTRAINT.
DROP INDEX "AdminInvite_token_key";
ALTER TABLE "AdminInvite" RENAME COLUMN "token" TO "tokenHash";
CREATE UNIQUE INDEX "AdminInvite_tokenHash_key" ON "AdminInvite"("tokenHash");
