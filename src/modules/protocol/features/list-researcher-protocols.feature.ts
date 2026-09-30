import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';
import { ResearcherAccountNotLinkedException } from '../exceptions/researcher-account-not-linked.exception';
import type { ProtocolSummarySource } from '../dtos/response/protocol-summary.response.dto';

export type ListResearcherProtocolsResult = {
  data: ProtocolSummarySource[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListResearcherProtocolsFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, page?: number, limit?: number): Promise<ListResearcherProtocolsResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { researcherId: true } });
    if (!user?.researcherId) throw new ResearcherAccountNotLinkedException();

    const researcherId = user.researcherId;
    const { skip, take } = resolvePagination(page, limit);

    // "Sus protocolos": donde participa como investigador principal, coinvestigador o asesor.
    const where: Prisma.ProtocolWhereInput = {
      OR: [
        { investigadorPrincipalId: researcherId },
        { coinvestigadores: { some: { researcherId } } },
        { asesores: { some: { researcherId } } },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.protocol.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { investigadorPrincipal: true },
      }),
      this.prisma.protocol.count({ where }),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
