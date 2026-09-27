import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';
import { ProtocolNotFoundException } from '../../protocol/exceptions/protocol-not-found.exception';
import { PROTOCOL_REVIEW_INCLUDE, ProtocolReviewWithRelations } from '../protocol-review.include';

export type ListProtocolReviewsResult = {
  data: ProtocolReviewWithRelations[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListProtocolReviewsFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(protocolId: string, page?: number, limit?: number): Promise<ListProtocolReviewsResult> {
    const protocol = await this.prisma.protocol.findUnique({ where: { id: protocolId }, select: { id: true } });
    if (!protocol) throw new ProtocolNotFoundException(protocolId);

    const { skip, take } = resolvePagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.protocolReview.findMany({
        where: { protocolId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: PROTOCOL_REVIEW_INCLUDE,
      }),
      this.prisma.protocolReview.count({ where: { protocolId } }),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
