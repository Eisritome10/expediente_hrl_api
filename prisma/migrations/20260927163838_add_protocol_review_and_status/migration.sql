-- CreateEnum
CREATE TYPE "ProtocolStatus" AS ENUM ('CREATED', 'OBSERVED', 'CORRECTED', 'FINALIZED');

-- AlterTable
ALTER TABLE "protocols" ADD COLUMN     "status" "ProtocolStatus" NOT NULL DEFAULT 'CREATED';

-- CreateTable
CREATE TABLE "protocol_reviews" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ProtocolStatus" NOT NULL,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "protocol_reviews" ADD CONSTRAINT "protocol_reviews_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_reviews" ADD CONSTRAINT "protocol_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
