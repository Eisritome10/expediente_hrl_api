-- DropForeignKey
ALTER TABLE "protocol_corrections" DROP CONSTRAINT "protocol_corrections_protocolId_fkey";

-- DropForeignKey
ALTER TABLE "protocol_review_observations" DROP CONSTRAINT "protocol_review_observations_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "protocol_reviews" DROP CONSTRAINT "protocol_reviews_protocolId_fkey";

-- DropForeignKey
ALTER TABLE "protocols" DROP CONSTRAINT "protocols_protocoloOriginalId_fkey";

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_protocoloOriginalId_fkey" FOREIGN KEY ("protocoloOriginalId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_corrections" ADD CONSTRAINT "protocol_corrections_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_reviews" ADD CONSTRAINT "protocol_reviews_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_review_observations" ADD CONSTRAINT "protocol_review_observations_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "protocol_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
