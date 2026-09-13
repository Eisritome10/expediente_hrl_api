import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PROTOCOL_INCLUDE, ProtocolWithRelations } from '../protocol.include';
import { ProtocolNotFoundException } from '../exceptions/protocol-not-found.exception';

@Injectable()
export class FindProtocolByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<ProtocolWithRelations> {
    const protocol = await this.prisma.protocol.findUnique({ where: { id }, include: PROTOCOL_INCLUDE });

    if (!protocol) {
      throw new ProtocolNotFoundException(id);
    }

    return protocol;
  }
}
