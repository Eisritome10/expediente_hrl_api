import { Injectable } from '@nestjs/common';
import { Prisma, ProtocolStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { applyProtocoloRules } from '../protocolo.rules';
import { validateProtocolReferences } from '../protocol.references';
import { PROTOCOL_INCLUDE, ProtocolWithRelations } from '../protocol.include';
import { ProtocolNroExpedienteAlreadyExistsException } from '../exceptions/protocol-nro-expediente-already-exists.exception';
import { ProtocolNotObservedException } from '../exceptions/protocol-not-observed.exception';
import { FindProtocolByIdFeature } from './find-protocol-by-id.feature';
import { CreateProtocolInput } from './create-protocol.feature';

export type UpdateProtocolInput = Partial<CreateProtocolInput>;

@Injectable()
export class UpdateProtocolFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findProtocolByIdFeature: FindProtocolByIdFeature,
  ) {}

  async execute(id: string, patch: UpdateProtocolInput): Promise<ProtocolWithRelations> {
    const current = await this.findProtocolByIdFeature.execute(id);

    let nextStatus: ProtocolStatus;
    if (current.status === ProtocolStatus.CIC_OBSERVED) {
      nextStatus = ProtocolStatus.CIC_CORRECTED;
    } else if (current.status === ProtocolStatus.CIEI_OBSERVED) {
      nextStatus = ProtocolStatus.CIEI_CORRECTED;
    } else {
      throw new ProtocolNotObservedException(id);
    }

    const merged = this.toEffectiveInput(current, patch);
    const rules = applyProtocoloRules(merged);
    await validateProtocolReferences(this.prisma, merged);

    const data: Prisma.ProtocolUpdateInput = {
      nroExpediente: merged.nroExpediente,
      fechaRecepcion: merged.fechaRecepcion,
      titulo: merged.titulo,
      lugarEjecucion: merged.lugarEjecucion,
      esInstitucional: merged.esInstitucional,
      investigadorPrincipal: { connect: { id: merged.investigadorPrincipalId } },
      institucion: merged.institucionId ? { connect: { id: merged.institucionId } } : { disconnect: true },
      facultad: merged.facultadId ? { connect: { id: merged.facultadId } } : { disconnect: true },
      convenio: merged.convenioId ? { connect: { id: merged.convenioId } } : { disconnect: true },
      lineaHrl: { connect: { id: merged.lineaHrlId } },
      lineaMeta2030: { connect: { id: merged.lineaMeta2030Id } },
      modalidad: { connect: { id: merged.modalidadId } },
      propositoRevision: merged.propositoRevision,
      fechaRevision: merged.fechaRevision,
      tipoComprobante: merged.tipoComprobante,
      comprobanteRevision: merged.comprobanteRevision,
      pagoRevision: rules.pagoRevision,
      esEnmienda: merged.esEnmienda,
      requiereRevisionHc: merged.requiereRevisionHc,
      montoHc: rules.montoHc,
      tipoComprobanteHc: rules.tipoComprobanteHc,
      nroComprobanteHc: rules.nroComprobanteHc,
      certificadoBuenasPracticas: merged.certificadoBuenasPracticas,
    };

    if (patch.coinvestigadorIds !== undefined) {
      data.coinvestigadores = {
        deleteMany: {},
        create: merged.coinvestigadorIds.map((researcherId) => ({ researcherId })),
      };
    }
    if (patch.asesorIds !== undefined) {
      data.asesores = { deleteMany: {}, create: merged.asesorIds.map((researcherId) => ({ researcherId })) };
    }
    if (patch.destinoIds !== undefined) {
      data.destinos = { deleteMany: {}, create: rules.destinoIds.map((destinationId) => ({ destinationId })) };
    }
    if (patch.studyDesignIds !== undefined) {
      data.disenosEstudio = {
        deleteMany: {},
        create: merged.studyDesignIds.map((studyDesignId) => ({ studyDesignId })),
      };
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const { count } = await tx.protocol.updateMany({
          where: { id, status: current.status },
          data: { status: nextStatus },
        });

        if (count === 0) throw new ProtocolNotObservedException(id);

        return tx.protocol.update({ where: { id }, data, include: PROTOCOL_INCLUDE });
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('nroExpediente') || target.includes('nro_expediente')) {
          throw new ProtocolNroExpedienteAlreadyExistsException(merged.nroExpediente);
        }
      }
      throw e;
    }
  }

  private toEffectiveInput(current: ProtocolWithRelations, patch: UpdateProtocolInput): CreateProtocolInput {
    return {
      nroExpediente: patch.nroExpediente !== undefined ? patch.nroExpediente : current.nroExpediente,
      fechaRecepcion: patch.fechaRecepcion !== undefined ? patch.fechaRecepcion : current.fechaRecepcion,
      titulo: patch.titulo !== undefined ? patch.titulo : current.titulo,
      lugarEjecucion: patch.lugarEjecucion !== undefined ? patch.lugarEjecucion : current.lugarEjecucion,
      esInstitucional: patch.esInstitucional !== undefined ? patch.esInstitucional : current.esInstitucional,
      investigadorPrincipalId:
        patch.investigadorPrincipalId !== undefined
          ? patch.investigadorPrincipalId
          : current.investigadorPrincipalId,
      coinvestigadorIds:
        patch.coinvestigadorIds !== undefined
          ? patch.coinvestigadorIds
          : current.coinvestigadores.map((c) => c.researcherId),
      asesorIds: patch.asesorIds !== undefined ? patch.asesorIds : current.asesores.map((a) => a.researcherId),
      institucionId: patch.institucionId !== undefined ? patch.institucionId : current.institucionId,
      facultadId: patch.facultadId !== undefined ? patch.facultadId : current.facultadId,
      convenioId: patch.convenioId !== undefined ? patch.convenioId : current.convenioId,
      destinoIds:
        patch.destinoIds !== undefined ? patch.destinoIds : current.destinos.map((d) => d.destinationId),
      studyDesignIds:
        patch.studyDesignIds !== undefined
          ? patch.studyDesignIds
          : current.disenosEstudio.map((d) => d.studyDesignId),
      lineaHrlId: patch.lineaHrlId !== undefined ? patch.lineaHrlId : current.lineaHrlId,
      lineaMeta2030Id: patch.lineaMeta2030Id !== undefined ? patch.lineaMeta2030Id : current.lineaMeta2030Id,
      modalidadId: patch.modalidadId !== undefined ? patch.modalidadId : current.modalidadId,
      propositoRevision: patch.propositoRevision !== undefined ? patch.propositoRevision : current.propositoRevision,
      fechaRevision: patch.fechaRevision !== undefined ? patch.fechaRevision : current.fechaRevision,
      tipoComprobante: patch.tipoComprobante !== undefined ? patch.tipoComprobante : current.tipoComprobante,
      comprobanteRevision:
        patch.comprobanteRevision !== undefined ? patch.comprobanteRevision : current.comprobanteRevision,
      pagoRevision:
        patch.pagoRevision !== undefined
          ? patch.pagoRevision
          : current.pagoRevision !== null
            ? Number(current.pagoRevision)
            : null,
      esEnmienda: patch.esEnmienda !== undefined ? patch.esEnmienda : current.esEnmienda,
      requiereRevisionHc: patch.requiereRevisionHc !== undefined ? patch.requiereRevisionHc : current.requiereRevisionHc,
      montoHc:
        patch.montoHc !== undefined
          ? patch.montoHc
          : current.montoHc !== null
            ? Number(current.montoHc)
            : null,
      tipoComprobanteHc: patch.tipoComprobanteHc !== undefined ? patch.tipoComprobanteHc : current.tipoComprobanteHc,
      nroComprobanteHc: patch.nroComprobanteHc !== undefined ? patch.nroComprobanteHc : current.nroComprobanteHc,
      certificadoBuenasPracticas:
        patch.certificadoBuenasPracticas !== undefined
          ? patch.certificadoBuenasPracticas
          : current.certificadoBuenasPracticas,
    };
  }
}
