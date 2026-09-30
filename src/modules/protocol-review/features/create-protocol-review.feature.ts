import { Injectable } from '@nestjs/common';
import { Committee, ProtocolStatus, ReviewOutcome, RiskLevel, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProtocolNotFoundException } from '../../protocol/exceptions/protocol-not-found.exception';
import { ProtocolReviewConcurrentUpdateException } from '../exceptions/protocol-review-concurrent-update.exception';
import { ProtocolReviewInvalidReviewerException } from '../exceptions/protocol-review-invalid-reviewer.exception';
import { ProtocolReviewProtocolAlreadyFinalizedException } from '../exceptions/protocol-review-protocol-already-finalized.exception';
import { PROTOCOL_REVIEW_INCLUDE, ProtocolReviewWithRelations } from '../protocol-review.include';
import { assertReviewRequest, resolveEthicsUpdate, resolveNextProtocolStatus } from '../protocol-review.rules';

export type CreateProtocolReviewInput = {
  protocolId: string;
  reviewerId: string;
  committee: Committee;
  outcome: ReviewOutcome;
  observations: string | null;
  tieneConstanciaEtica?: boolean;
  idConstanciaEtica?: string | null;
  fechaConstancia?: Date | null;
  catalogadoRiesgo?: RiskLevel | null;
  consentimientoInformado?: boolean;
  departamentoDirigidoPermiso?: string | null;
};

@Injectable()
export class CreateProtocolReviewFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateProtocolReviewInput): Promise<ProtocolReviewWithRelations> {
    const observations = input.observations?.trim() || null;

    assertReviewRequest({
      committee: input.committee,
      outcome: input.outcome,
      observations,
      tieneConstanciaEtica: input.tieneConstanciaEtica,
      idConstanciaEtica: input.idConstanciaEtica,
      fechaConstancia: input.fechaConstancia,
      catalogadoRiesgo: input.catalogadoRiesgo,
      consentimientoInformado: input.consentimientoInformado,
      departamentoDirigidoPermiso: input.departamentoDirigidoPermiso,
    });

    const reviewer = await this.prisma.user.findUnique({ where: { id: input.reviewerId } });
    if (!reviewer || reviewer.status !== UserStatus.ACTIVE) {
      throw new ProtocolReviewInvalidReviewerException(input.reviewerId);
    }

    const protocol = await this.prisma.protocol.findUnique({
      where: { id: input.protocolId },
      select: { id: true, status: true, updatedAt: true },
    });
    if (!protocol) throw new ProtocolNotFoundException(input.protocolId);
    if (protocol.status === ProtocolStatus.FINALIZED) {
      throw new ProtocolReviewProtocolAlreadyFinalizedException(input.protocolId);
    }

    const lastCicReview = await this.prisma.protocolReview.findFirst({
      where: { protocolId: input.protocolId, committee: Committee.CIC },
      orderBy: { createdAt: 'desc' },
    });
    const lastCicOutcome = lastCicReview?.outcome ?? null;

    const nextStatus = resolveNextProtocolStatus(
      protocol.status,
      input.committee,
      input.outcome,
      lastCicOutcome,
      input.protocolId,
    );

    const ethicsUpdate = resolveEthicsUpdate(input.committee, input);

    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.protocol.updateMany({
        where: { id: input.protocolId, status: protocol.status, updatedAt: protocol.updatedAt },
        data: { status: nextStatus, ...ethicsUpdate },
      });

      if (count === 0) throw new ProtocolReviewConcurrentUpdateException(input.protocolId);

      return tx.protocolReview.create({
        data: {
          protocolId: input.protocolId,
          reviewerId: input.reviewerId,
          committee: input.committee,
          outcome: input.outcome,
          observations,
        },
        include: PROTOCOL_REVIEW_INCLUDE,
      });
    });
  }
}
