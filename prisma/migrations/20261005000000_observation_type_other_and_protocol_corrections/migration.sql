-- Tipo de observación "Otro".
ALTER TYPE "ObservationType" ADD VALUE 'OTHER';

-- Comentarios de corrección de un protocolo observado.
CREATE TABLE "protocol_corrections" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_corrections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "protocol_corrections_protocolId_idx" ON "protocol_corrections"("protocolId");

ALTER TABLE "protocol_corrections"
  ADD CONSTRAINT "protocol_corrections_protocolId_fkey"
  FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
