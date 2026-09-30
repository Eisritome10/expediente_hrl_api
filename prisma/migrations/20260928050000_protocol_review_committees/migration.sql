-- CreateEnum
CREATE TYPE "Committee" AS ENUM ('CIC', 'CIEI');

-- CreateEnum
CREATE TYPE "ReviewOutcome" AS ENUM ('OBSERVED', 'APPROVED', 'FINALIZED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NO_RISK', 'MINIMAL_RISK', 'MODERATE_RISK', 'HIGH_RISK');

-- Backfill: all pre-existing protocol history belonged to the CIC stage (CIEI did not exist yet).
UPDATE "protocols" SET "status" = 'CIC_OBSERVED' WHERE "status" = 'OBSERVED';
UPDATE "protocols" SET "status" = 'CIC_CORRECTED' WHERE "status" = 'CORRECTED';

-- AlterTable: add the new review columns as nullable so we can backfill before enforcing NOT NULL.
ALTER TABLE "protocol_reviews" ADD COLUMN "committee" "Committee";
ALTER TABLE "protocol_reviews" ADD COLUMN "outcome" "ReviewOutcome";

-- Backfill: every existing review was produced by the CIC committee (the only one that existed);
-- ProtocolReview.status only ever held OBSERVED or FINALIZED (see PROTOCOL_REVIEW_STATUSES), which
-- map 1:1 onto the corresponding ReviewOutcome labels.
UPDATE "protocol_reviews" SET "committee" = 'CIC', "outcome" = "status"::text::"ReviewOutcome";

-- Guard: abort the migration if any row was left without a committee/outcome (unexpected legacy status).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "protocol_reviews" WHERE "committee" IS NULL OR "outcome" IS NULL) THEN
    RAISE EXCEPTION 'protocol_review_committees backfill left rows without committee/outcome; aborting migration';
  END IF;
  IF EXISTS (SELECT 1 FROM "protocols" WHERE "status"::text IN ('OBSERVED', 'CORRECTED')) THEN
    RAISE EXCEPTION 'protocol_review_committees backfill left protocols with legacy status; aborting migration';
  END IF;
END $$;

ALTER TABLE "protocol_reviews" ALTER COLUMN "committee" SET NOT NULL;
ALTER TABLE "protocol_reviews" ALTER COLUMN "outcome" SET NOT NULL;
ALTER TABLE "protocol_reviews" DROP COLUMN "status";

-- Replace the ProtocolStatus enum with its final set of values (drops the now-unused legacy labels).
ALTER TYPE "ProtocolStatus" RENAME TO "ProtocolStatus_old";
CREATE TYPE "ProtocolStatus" AS ENUM ('CREATED', 'CIC_OBSERVED', 'CIC_CORRECTED', 'CIEI_OBSERVED', 'CIEI_CORRECTED', 'FINALIZED');
ALTER TABLE "protocols" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "protocols" ALTER COLUMN "status" TYPE "ProtocolStatus" USING ("status"::text::"ProtocolStatus");
ALTER TABLE "protocols" ALTER COLUMN "status" SET DEFAULT 'CREATED';
DROP TYPE "ProtocolStatus_old";

-- AlterTable: ethics fields, written only by a CIEI FINALIZED/OBSERVED review.
ALTER TABLE "protocols" ADD COLUMN "tieneConstanciaEtica" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "protocols" ADD COLUMN "idConstanciaEtica" TEXT;
ALTER TABLE "protocols" ADD COLUMN "fechaConstancia" TIMESTAMP(3);
ALTER TABLE "protocols" ADD COLUMN "catalogadoRiesgo" "RiskLevel";
ALTER TABLE "protocols" ADD COLUMN "consentimientoInformado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "protocols" ADD COLUMN "departamentoDirigidoPermiso" TEXT;
