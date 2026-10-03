-- Additive idempotency token for safely retrying Action Taken creates.
ALTER TABLE "actions_taken" ADD COLUMN "idempotencyKey" UUID;
ALTER TABLE "actions_taken" ADD COLUMN "idempotencyFingerprint" VARCHAR(64);
CREATE UNIQUE INDEX "actions_taken_idempotencyKey_key" ON "actions_taken"("idempotencyKey");
