import { Injectable } from '@nestjs/common';
import { ResearchLine } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResearchLineNotFoundException } from '../exceptions/research-line-not-found.exception';

@Injectable()
export class FindResearchLineByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<ResearchLine> {
    const researchLine = await this.prisma.researchLine.findUnique({ where: { id } });

    if (!researchLine) {
      throw new ResearchLineNotFoundException(id);
    }

    return researchLine;
  }
}
