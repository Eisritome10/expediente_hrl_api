import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { applyProtocoloRules } from '../protocolo.rules';
import { validateProtocolReferences } from '../protocol.references';
import { PROTOCOL_INCLUDE, ProtocolWithRelations } from '../protocol.include';
import { ProtocolNroExpedienteAlreadyExistsException } from '../exceptions/protocol-nro-expediente-already-exists.exception';

export type CreateProtocolInput = {
  nroExpediente: string;
  fechaRecepcion: Date;
  titulo: string;
  lugarEjecucion: string;
  esInstitucional: boolean;
  investigadorPrincipalId: string;
  coinvestigadorIds: string[];
  asesorIds: string[];
  institucionId: string | null;
  facultadId: string | null;
  destinoIds: string[];
  studyDesignIds: string[];
  lineaHrlId: string;
  lineaMeta2030Id: string;
  modalidadId: string;
  convenioId: string | null;
  pagoRevision: number | null;
  tipoComprobante: string | null;
  comprobanteRevision: string | null;
  protocoloOriginalId: string | null;
  requiereRevisionHc: boolean;
  montoHc: number | null;
  tipoComprobanteHc: string | null;
  nroComprobanteHc: string | null;
  tieneConstanciaEtica: boolean;
  idConstanciaEtica: string | null;
  fechaConstancia: Date | null;
  consentimientoInformado: boolean;
  departamentoDirigidoPermiso: string | null;
  certificadoBuenasPracticas: boolean;
};

@Injectable()
export class CreateProtocolFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateProtocolInput): Promise<ProtocolWithRelations> {
    // Una enmienda es un protocolo que referencia a otro protocolo finalizado.
    const esEnmienda = input.protocoloOriginalId !== null;
    const rules = applyProtocoloRules({ ...input, esEnmienda });
    await validateProtocolReferences(this.prisma, input);

    try {
      return await this.prisma.protocol.create({
        data: {
          nroExpediente: input.nroExpediente,
          fechaRecepcion: input.fechaRecepcion,
          titulo: input.titulo,
          lugarEjecucion: input.lugarEjecucion,
          esInstitucional: input.esInstitucional,
          investigadorPrincipal: { connect: { id: input.investigadorPrincipalId } },
          institucion: input.institucionId ? { connect: { id: input.institucionId } } : undefined,
          facultad: input.facultadId ? { connect: { id: input.facultadId } } : undefined,
          convenio: input.convenioId ? { connect: { id: input.convenioId } } : undefined,
          lineaHrl: { connect: { id: input.lineaHrlId } },
          lineaMeta2030: { connect: { id: input.lineaMeta2030Id } },
          modalidad: { connect: { id: input.modalidadId } },
          pagoRevision: rules.pagoRevision,
          tipoComprobante: rules.tipoComprobante,
          comprobanteRevision: rules.comprobanteRevision,
          esEnmienda,
          protocoloOriginal: input.protocoloOriginalId
            ? { connect: { id: input.protocoloOriginalId } }
            : undefined,
          requiereRevisionHc: input.requiereRevisionHc,
          montoHc: rules.montoHc,
          tipoComprobanteHc: rules.tipoComprobanteHc,
          nroComprobanteHc: rules.nroComprobanteHc,
          tieneConstanciaEtica: input.tieneConstanciaEtica,
          idConstanciaEtica: rules.idConstanciaEtica,
          fechaConstancia: rules.fechaConstancia,
          consentimientoInformado: input.consentimientoInformado,
          departamentoDirigidoPermiso: input.departamentoDirigidoPermiso,
          certificadoBuenasPracticas: rules.certificadoBuenasPracticas,
          coinvestigadores: { create: input.coinvestigadorIds.map((researcherId) => ({ researcherId })) },
          asesores: { create: input.asesorIds.map((researcherId) => ({ researcherId })) },
          destinos: { create: rules.destinoIds.map((destinationId) => ({ destinationId })) },
          disenosEstudio: { create: input.studyDesignIds.map((studyDesignId) => ({ studyDesignId })) },
        },
        include: PROTOCOL_INCLUDE,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('nroExpediente') || target.includes('nro_expediente')) {
          throw new ProtocolNroExpedienteAlreadyExistsException(input.nroExpediente);
        }
      }
      throw e;
    }
  }
}
