import { Injectable } from '@nestjs/common';
import { Prisma, ResearchLine } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindResearchLineByIdFeature } from './find-research-line-by-id.feature';
import { ResearchLineInUseByProtocolException } from '../exceptions/research-line-in-use-by-protocol.exception';

@Injectable()
export class DeleteResearchLineFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findResearchLineByIdFeature: FindResearchLineByIdFeature,
  ) {}

  async execute(id: string): Promise<ResearchLine> {
    await this.findResearchLineByIdFeature.execute(id);

    try {
      return await this.prisma.researchLine.delete({
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ResearchLineInUseByProtocolException();
      }

      throw e;
    }
  }
}