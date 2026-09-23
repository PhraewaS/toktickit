-- Lab 4 additive Actions Taken model. Existing Lab 1-3 rows remain intact.
CREATE TABLE "actions_taken" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "actionDateTime" TIMESTAMPTZ(3) NOT NULL,
    "description" VARCHAR(5000) NOT NULL,
    "result" VARCHAR(5000) NOT NULL,
    "performedById" INTEGER NOT NULL,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpNote" VARCHAR(5000),
    "attachmentNotes" VARCHAR(2000),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "actions_taken_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "actions_taken_ticket_datetime_idx" ON "actions_taken"("ticketId", "actionDateTime", "id");
CREATE INDEX "actions_taken_performer_datetime_idx" ON "actions_taken"("performedById", "actionDateTime", "id");

ALTER TABLE "actions_taken" ADD CONSTRAINT "actions_taken_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "actions_taken" ADD CONSTRAINT "actions_taken_performedById_fkey"
  FOREIGN KEY ("performedById") REFERENCES "requester_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
