-- Lab 2 requester foundation. This migration is additive to the Lab 1 schema.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE "RequestedPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "TicketStatus" AS ENUM ('NEW');

ALTER TABLE "categories"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "updatedAt" TIMESTAMPTZ(3);

UPDATE "categories"
SET "updatedAt" = CURRENT_TIMESTAMP
WHERE "updatedAt" IS NULL;

ALTER TABLE "categories"
  ALTER COLUMN "updatedAt" SET NOT NULL;

CREATE TABLE "requester_users" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "email" VARCHAR(254) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "requester_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "related_systems" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "related_systems_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tickets" (
  "id" SERIAL NOT NULL,
  "ticketNumber" VARCHAR(21) NOT NULL,
  "requesterId" INTEGER NOT NULL,
  "categoryId" INTEGER NOT NULL,
  "relatedSystemId" INTEGER NOT NULL,
  "summary" VARCHAR(150) NOT NULL,
  "requestedPriority" "RequestedPriority" NOT NULL,
  "description" TEXT NOT NULL,
  "currentStatus" "TicketStatus" NOT NULL DEFAULT 'NEW',
  "submissionKey" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attachments" (
  "id" SERIAL NOT NULL,
  "ticketId" INTEGER NOT NULL,
  "originalFilename" VARCHAR(255) NOT NULL,
  "storedFilename" UUID NOT NULL,
  "mimeType" VARCHAR(100) NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "uploadedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "removedAt" TIMESTAMPTZ(3),
  "removalReason" VARCHAR(500),
  CONSTRAINT "attachments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "attachments_sizeBytes_check" CHECK ("sizeBytes" BETWEEN 1 AND 5242880),
  CONSTRAINT "attachments_removal_state_check" CHECK (
    ("removedAt" IS NULL AND "removalReason" IS NULL)
    OR
    ("removedAt" IS NOT NULL AND char_length(btrim("removalReason")) BETWEEN 3 AND 500)
  )
);

CREATE UNIQUE INDEX "requester_users_email_key" ON "requester_users"("email");
CREATE INDEX "requester_users_active_name_idx" ON "requester_users"("isActive", "name", "id");
CREATE INDEX "categories_active_name_idx" ON "categories"("isActive", "name", "id");
CREATE UNIQUE INDEX "related_systems_name_key" ON "related_systems"("name");
CREATE INDEX "related_systems_active_name_idx" ON "related_systems"("isActive", "name", "id");
CREATE UNIQUE INDEX "tickets_ticketNumber_key" ON "tickets"("ticketNumber");
CREATE UNIQUE INDEX "tickets_requester_submission_key" ON "tickets"("requesterId", "submissionKey");
CREATE INDEX "tickets_requester_created_idx" ON "tickets"("requesterId", "createdAt", "id");
CREATE INDEX "tickets_requester_updated_idx" ON "tickets"("requesterId", "updatedAt", "id");
CREATE INDEX "tickets_requester_number_idx" ON "tickets"("requesterId", "ticketNumber", "id");
CREATE INDEX "tickets_requester_category_idx" ON "tickets"("requesterId", "categoryId");
CREATE INDEX "tickets_requester_system_idx" ON "tickets"("requesterId", "relatedSystemId");
CREATE INDEX "tickets_requester_priority_idx" ON "tickets"("requesterId", "requestedPriority");
CREATE INDEX "tickets_requester_status_idx" ON "tickets"("requesterId", "currentStatus");
CREATE INDEX "tickets_ticketNumber_trgm_idx" ON "tickets" USING GIN (lower("ticketNumber") gin_trgm_ops);
CREATE INDEX "tickets_summary_trgm_idx" ON "tickets" USING GIN (lower("summary") gin_trgm_ops);
CREATE UNIQUE INDEX "attachments_storedFilename_key" ON "attachments"("storedFilename");
CREATE INDEX "attachments_ticket_state_idx" ON "attachments"("ticketId", "removedAt", "uploadedAt", "id");

ALTER TABLE "tickets"
  ADD CONSTRAINT "tickets_requesterId_fkey"
  FOREIGN KEY ("requesterId") REFERENCES "requester_users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tickets"
  ADD CONSTRAINT "tickets_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tickets"
  ADD CONSTRAINT "tickets_relatedSystemId_fkey"
  FOREIGN KEY ("relatedSystemId") REFERENCES "related_systems"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attachments"
  ADD CONSTRAINT "attachments_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "tickets"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
