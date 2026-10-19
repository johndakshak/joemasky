-- Rename the raw-token column to tokenHash.
-- The application now generates a 32-byte random token,
-- stores only its SHA-256 hex digest here, and returns
-- the raw token to the Super Admin once (never persisted).

-- Drop the old unique constraint and column, then add the new one.
ALTER TABLE "AdminInvite" DROP CONSTRAINT "AdminInvite_token_key";
ALTER TABLE "AdminInvite" RENAME COLUMN "token" TO "tokenHash";
CREATE UNIQUE INDEX "AdminInvite_tokenHash_key" ON "AdminInvite"("tokenHash");
