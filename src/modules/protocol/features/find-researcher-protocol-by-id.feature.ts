import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResearcherAccountNotLinkedException } from '../exceptions/researcher-account-not-linked.exception';
import { ProtocolNotFoundException } from '../exceptions/protocol-not-found.exception';
import { RESEARCHER_PROTOCOL_DETAIL_INCLUDE, ResearcherProtocolDetail } from '../protocol.include';
import { researcherParticipationWhere } from './list-researcher-protocols.feature';

@Injectable()
export class FindResearcherProtocolByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, protocolId: string): Promise<ResearcherProtocolDetail> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { researcherId: true } });
    if (!user?.researcherId) throw new ResearcherAccountNotLinkedException();

    const researcherId = user.researcherId;

    // Solo se devuelve si el investigador participa en el protocolo; si no, se trata como inexistente.
    const protocol = await this.prisma.protocol.findFirst({
      where: { id: protocolId, ...researcherParticipationWhere(researcherId) },
      include: RESEARCHER_PROTOCOL_DETAIL_INCLUDE,
    });
    if (!protocol) throw new ProtocolNotFoundException(protocolId);

    return protocol;
  }
}
