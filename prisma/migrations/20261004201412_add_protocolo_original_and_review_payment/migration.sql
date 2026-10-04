-- AlterTable
ALTER TABLE "protocol_reviews" ADD COLUMN     "comprobanteRevision" TEXT,
ADD COLUMN     "pagoRevision" DECIMAL(10,2),
ADD COLUMN     "tipoComprobante" TEXT;

-- AlterTable
ALTER TABLE "protocols" ADD COLUMN     "protocoloOriginalId" TEXT;

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_protocoloOriginalId_fkey" FOREIGN KEY ("protocoloOriginalId") REFERENCES "protocols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
