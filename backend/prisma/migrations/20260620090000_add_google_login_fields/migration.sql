-- Allow accounts created through Google OAuth to exist without a local password.
ALTER TABLE "users" ADD COLUMN "googleId" TEXT;
ALTER TABLE "users" ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'LOCAL';
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

