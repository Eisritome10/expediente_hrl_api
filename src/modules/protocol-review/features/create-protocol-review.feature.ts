import { Injectable } from '@nestjs/common';
import { ProtocolStatus, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProtocolNotFoundException } from '../../protocol/exceptions/protocol-not-found.exception';
import { ProtocolReviewInvalidReviewerException } from '../exceptions/protocol-review-invalid-reviewer.exception';
import { ProtocolReviewObservationsRequiredException } from '../exceptions/protocol-review-observations-required.exception';
import { ProtocolReviewProtocolAlreadyFinalizedException } from '../exceptions/protocol-review-protocol-already-finalized.exception';
import { PROTOCOL_REVIEW_INCLUDE, ProtocolReviewWithRelations } from '../protocol-review.include';
import { ProtocolReviewStatus } from '../dtos/request/create-protocol-review.request.dto';

export type CreateProtocolReviewInput = {
  protocolId: string;
  reviewerId: string;
  status: ProtocolReviewStatus;
  observations: string | null;
};

@Injectable()
export class CreateProtocolReviewFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateProtocolReviewInput): Promise<ProtocolReviewWithRelations> {
    const observations = input.observations?.trim() || null;
    if (input.status === ProtocolStatus.OBSERVED && !observations) {
      throw new ProtocolReviewObservationsRequiredException();
    }

    const reviewer = await this.prisma.user.findUnique({ where: { id: input.reviewerId } });
    if (!reviewer || reviewer.status !== UserStatus.ACTIVE) {
      throw new ProtocolReviewInvalidReviewerException(input.reviewerId);
    }

    const protocol = await this.prisma.protocol.findUnique({
      where: { id: input.protocolId },
      select: { id: true, status: true },
    });
    if (!protocol) throw new ProtocolNotFoundException(input.protocolId);
    if (protocol.status === ProtocolStatus.FINALIZED) {
      throw new ProtocolReviewProtocolAlreadyFinalizedException(input.protocolId);
    }

    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.protocol.updateMany({
        where: { id: input.protocolId, status: { not: ProtocolStatus.FINALIZED } },
        data: { status: input.status },
      });

      if (count === 0) throw new ProtocolReviewProtocolAlreadyFinalizedException(input.protocolId);

      return tx.protocolReview.create({
        data: {
          protocolId: input.protocolId,
          reviewerId: input.reviewerId,
          status: input.status,
          observations,
        },
        include: PROTOCOL_REVIEW_INCLUDE,
      });
    });
  }
}
