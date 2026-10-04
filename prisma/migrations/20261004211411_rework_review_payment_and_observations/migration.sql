/*
  Warnings:

  - You are about to drop the column `comprobanteRevision` on the `protocol_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `pagoRevision` on the `protocol_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `tipoComprobante` on the `protocol_reviews` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ObservationType" AS ENUM ('INFORMED_CONSENT', 'ETHICS_CONSTANCE', 'ADMINISTRATIVE', 'METHODOLOGICAL', 'LEGAL_INSTITUTIONAL');

-- AlterTable
ALTER TABLE "protocol_reviews" DROP COLUMN "comprobanteRevision",
DROP COLUMN "pagoRevision",
DROP COLUMN "tipoComprobante";

-- AlterTable
ALTER TABLE "protocols" ALTER COLUMN "propositoRevision" DROP NOT NULL;

-- CreateTable
CREATE TABLE "protocol_review_observations" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "type" "ObservationType" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_review_observations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "protocol_review_observations_reviewId_idx" ON "protocol_review_observations"("reviewId");

-- AddForeignKey
ALTER TABLE "protocol_review_observations" ADD CONSTRAINT "protocol_review_observations_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "protocol_reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
