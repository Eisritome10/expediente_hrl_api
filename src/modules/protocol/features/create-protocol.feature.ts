import { Injectable } from '@nestjs/common';
import { LineType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { applyProtocoloRules } from '../protocolo.rules';
import { PROTOCOL_INCLUDE, ProtocolWithRelations } from '../protocol.include';
import { ProtocolNroExpedienteAlreadyExistsException } from '../exceptions/protocol-nro-expediente-already-exists.exception';
import { ProtocolInvalidReferenceException } from '../exceptions/protocol-invalid-reference.exception';
import { ProtocolInvalidResearchLineException } from '../exceptions/protocol-invalid-research-line.exception';
import { ProtocoloFacultadRequiereUniversidadException } from '../exceptions/protocolo-facultad-requiere-universidad.exception';

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
  propositoRevision: string;
  fechaRevision: Date | null;
  tipoComprobante: string | null;
  comprobanteRevision: string | null;
  pagoRevision: number | null;
  esEnmienda: boolean;
  esConvenio: boolean;
  nombreConvenio: string | null;
  requiereRevisionHc: boolean;
  montoHc: number | null;
  tipoComprobanteHc: string | null;
  nroComprobanteHc: string | null;
  certificadoBuenasPracticas: boolean;
};

@Injectable()
export class CreateProtocolFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateProtocolInput): Promise<ProtocolWithRelations> {
    const rules = applyProtocoloRules(input);
    await this.validateReferences(input);

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
          lineaHrl: { connect: { id: input.lineaHrlId } },
          lineaMeta2030: { connect: { id: input.lineaMeta2030Id } },
          modalidad: { connect: { id: input.modalidadId } },
          propositoRevision: input.propositoRevision,
          fechaRevision: input.fechaRevision,
          tipoComprobante: input.tipoComprobante,
          comprobanteRevision: input.comprobanteRevision,
          pagoRevision: rules.pagoRevision,
          esEnmienda: input.esEnmienda,
          esConvenio: input.esConvenio,
          nombreConvenio: rules.nombreConvenio,
          requiereRevisionHc: input.requiereRevisionHc,
          montoHc: rules.montoHc,
          tipoComprobanteHc: rules.tipoComprobanteHc,
          nroComprobanteHc: rules.nroComprobanteHc,
          certificadoBuenasPracticas: input.certificadoBuenasPracticas,
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

  private async validateReferences(input: CreateProtocolInput): Promise<void> {
    const [
      investigador,
      institucion,
      facultad,
      lineaHrl,
      lineaMeta2030,
      modalidad,
      coinvestigadoresCount,
      asesoresCount,
      destinosCount,
      studyDesignsCount,
    ] = await Promise.all([
      this.prisma.researcher.findUnique({ where: { id: input.investigadorPrincipalId } }),
      input.institucionId ? this.prisma.institution.findUnique({ where: { id: input.institucionId } }) : null,
      input.facultadId ? this.prisma.faculty.findUnique({ where: { id: input.facultadId } }) : null,
      this.prisma.researchLine.findUnique({ where: { id: input.lineaHrlId } }),
      this.prisma.researchLine.findUnique({ where: { id: input.lineaMeta2030Id } }),
      this.prisma.modality.findUnique({ where: { id: input.modalidadId } }),
      input.coinvestigadorIds.length
        ? this.prisma.researcher.count({ where: { id: { in: input.coinvestigadorIds } } })
        : 0,
      input.asesorIds.length ? this.prisma.researcher.count({ where: { id: { in: input.asesorIds } } }) : 0,
      input.destinoIds.length ? this.prisma.destination.count({ where: { id: { in: input.destinoIds } } }) : 0,
      input.studyDesignIds.length
        ? this.prisma.studyDesign.count({ where: { id: { in: input.studyDesignIds } } })
        : 0,
    ]);

    if (!investigador) throw new ProtocolInvalidReferenceException('Researcher', input.investigadorPrincipalId);
    if (input.institucionId && !institucion) {
      throw new ProtocolInvalidReferenceException('Institution', input.institucionId);
    }
    if (input.facultadId && !facultad) throw new ProtocolInvalidReferenceException('Faculty', input.facultadId);

    if (!lineaHrl) throw new ProtocolInvalidReferenceException('ResearchLine', input.lineaHrlId);
    if (lineaHrl.type !== LineType.HRL) throw new ProtocolInvalidResearchLineException('lineaHrlId', LineType.HRL);

    if (!lineaMeta2030) throw new ProtocolInvalidReferenceException('ResearchLine', input.lineaMeta2030Id);
    if (lineaMeta2030.type !== LineType.META_2030) {
      throw new ProtocolInvalidResearchLineException('lineaMeta2030Id', LineType.META_2030);
    }

    if (!modalidad) throw new ProtocolInvalidReferenceException('Modality', input.modalidadId);

    if (input.facultadId && (!institucion || !institucion.esUniversidad)) {
      throw new ProtocoloFacultadRequiereUniversidadException();
    }

    if (coinvestigadoresCount !== new Set(input.coinvestigadorIds).size) {
      throw new ProtocolInvalidReferenceException('Researcher', 'coinvestigadorIds');
    }
    if (asesoresCount !== new Set(input.asesorIds).size) {
      throw new ProtocolInvalidReferenceException('Researcher', 'asesorIds');
    }
    if (destinosCount !== new Set(input.destinoIds).size) {
      throw new ProtocolInvalidReferenceException('Destination', 'destinoIds');
    }
    if (studyDesignsCount !== new Set(input.studyDesignIds).size) {
      throw new ProtocolInvalidReferenceException('StudyDesign', 'studyDesignIds');
    }
  }
}
