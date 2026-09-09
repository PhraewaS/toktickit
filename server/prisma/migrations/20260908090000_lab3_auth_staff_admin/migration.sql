-- Lab 3 is additive. Existing requester IDs, tickets, and attachments remain valid.
CREATE TYPE "UserRole" AS ENUM ('REQUESTER', 'IT_STAFF', 'ADMINISTRATOR');

ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'OPEN';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'WAITING_FOR_REQUESTER';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'RESOLVED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'CLOSED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'REOPENED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "requester_users"
  ADD COLUMN "passwordHash" VARCHAR(255) NOT NULL DEFAULT 'scrypt$lab3-migration-salt$7c309db22244160a0d1d378da8bb46a34f537f9b0c72f91994f857b0e3bb8ffa',
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'REQUESTER',
  ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "lastLoginAt" TIMESTAMPTZ(3);
ALTER TABLE "requester_users" ALTER COLUMN "passwordHash" DROP DEFAULT;
CREATE INDEX "requester_users_role_active_name_idx" ON "requester_users" ("role", "isActive", "name", "id");

ALTER TABLE "tickets"
  ADD COLUMN "itPriority" "RequestedPriority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN "ownerId" INTEGER,
  ADD COLUMN "requesterResolvedAt" TIMESTAMPTZ(3);
UPDATE "tickets" SET "itPriority" = "requestedPriority";
CREATE INDEX "tickets_staff_queue_idx" ON "tickets" ("currentStatus", "itPriority", "ownerId", "updatedAt", "id");
ALTER TABLE "tickets"
  ADD CONSTRAINT "tickets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "requester_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "sessions" (
  "id" SERIAL NOT NULL,
  "tokenHash" VARCHAR(128) NOT NULL,
  "userId" INTEGER NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions" ("tokenHash");
CREATE INDEX "sessions_user_expiry_idx" ON "sessions" ("userId", "expiresAt");
CREATE INDEX "sessions_expiry_idx" ON "sessions" ("expiresAt");
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "requester_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "public_comments" (
  "id" SERIAL NOT NULL,
  "ticketId" INTEGER NOT NULL,
  "authorId" INTEGER NOT NULL,
  "content" VARCHAR(5000) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "public_comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "public_comments_ticket_created_idx" ON "public_comments" ("ticketId", "createdAt", "id");
ALTER TABLE "public_comments" ADD CONSTRAINT "public_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public_comments" ADD CONSTRAINT "public_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "requester_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "internal_notes" (
  "id" SERIAL NOT NULL,
  "ticketId" INTEGER NOT NULL,
  "authorId" INTEGER NOT NULL,
  "content" VARCHAR(5000) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "internal_notes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "internal_notes_ticket_created_idx" ON "internal_notes" ("ticketId", "createdAt", "id");
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "requester_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
