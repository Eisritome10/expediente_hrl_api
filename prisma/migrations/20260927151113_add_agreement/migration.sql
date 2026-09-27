-- AlterTable
ALTER TABLE "protocols" DROP COLUMN "esConvenio",
DROP COLUMN "nombreConvenio",
ADD COLUMN     "convenioId" TEXT;

-- CreateTable
CREATE TABLE "agreements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agreements_name_key" ON "agreements"("name");

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
