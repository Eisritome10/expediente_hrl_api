-- CreateTable
CREATE TABLE "protocols" (
    "id" TEXT NOT NULL,
    "nroExpediente" TEXT NOT NULL,
    "fechaRecepcion" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "disenoEstudio" TEXT NOT NULL,
    "lugarEjecucion" TEXT NOT NULL,
    "esInstitucional" BOOLEAN NOT NULL DEFAULT true,
    "investigadorPrincipalId" TEXT NOT NULL,
    "institucionId" TEXT,
    "facultadId" TEXT,
    "lineaHrlId" TEXT NOT NULL,
    "lineaMeta2030Id" TEXT NOT NULL,
    "modalidadId" TEXT NOT NULL,
    "propositoRevision" TEXT NOT NULL,
    "fechaRevision" TIMESTAMP(3),
    "tipoComprobante" TEXT,
    "comprobanteRevision" TEXT,
    "pagoRevision" DECIMAL(10,2),
    "esEnmienda" BOOLEAN NOT NULL DEFAULT false,
    "esConvenio" BOOLEAN NOT NULL DEFAULT false,
    "nombreConvenio" TEXT,
    "requiereRevisionHc" BOOLEAN NOT NULL DEFAULT false,
    "montoHc" DECIMAL(10,2),
    "tipoComprobanteHc" TEXT,
    "nroComprobanteHc" TEXT,
    "certificadoBuenasPracticas" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_coinvestigadores" (
    "protocolId" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,

    CONSTRAINT "protocol_coinvestigadores_pkey" PRIMARY KEY ("protocolId","researcherId")
);

-- CreateTable
CREATE TABLE "protocol_asesores" (
    "protocolId" TEXT NOT NULL,
    "researcherId" TEXT NOT NULL,

    CONSTRAINT "protocol_asesores_pkey" PRIMARY KEY ("protocolId","researcherId")
);

-- CreateTable
CREATE TABLE "protocol_destinos" (
    "protocolId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,

    CONSTRAINT "protocol_destinos_pkey" PRIMARY KEY ("protocolId","destinationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "protocols_nroExpediente_key" ON "protocols"("nroExpediente");

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_investigadorPrincipalId_fkey" FOREIGN KEY ("investigadorPrincipalId") REFERENCES "researchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_facultadId_fkey" FOREIGN KEY ("facultadId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_lineaHrlId_fkey" FOREIGN KEY ("lineaHrlId") REFERENCES "research_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_lineaMeta2030Id_fkey" FOREIGN KEY ("lineaMeta2030Id") REFERENCES "research_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_modalidadId_fkey" FOREIGN KEY ("modalidadId") REFERENCES "modalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_coinvestigadores" ADD CONSTRAINT "protocol_coinvestigadores_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_coinvestigadores" ADD CONSTRAINT "protocol_coinvestigadores_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "researchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_asesores" ADD CONSTRAINT "protocol_asesores_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_asesores" ADD CONSTRAINT "protocol_asesores_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "researchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_destinos" ADD CONSTRAINT "protocol_destinos_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_destinos" ADD CONSTRAINT "protocol_destinos_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
