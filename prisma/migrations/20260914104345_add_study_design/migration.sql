-- AlterTable
ALTER TABLE "protocols" DROP COLUMN "disenoEstudio";

-- CreateTable
CREATE TABLE "study_designs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_study_designs" (
    "protocolId" TEXT NOT NULL,
    "studyDesignId" TEXT NOT NULL,

    CONSTRAINT "protocol_study_designs_pkey" PRIMARY KEY ("protocolId","studyDesignId")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_designs_name_key" ON "study_designs"("name");

-- AddForeignKey
ALTER TABLE "protocol_study_designs" ADD CONSTRAINT "protocol_study_designs_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_study_designs" ADD CONSTRAINT "protocol_study_designs_studyDesignId_fkey" FOREIGN KEY ("studyDesignId") REFERENCES "study_designs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

