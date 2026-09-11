import { Injectable } from '@nestjs/common';
import { Researcher } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResearcherNotFoundException } from '../exceptions/researcher-not-found.exception';

@Injectable()
export class FindResearcherByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<Researcher> {
    const researcher = await this.prisma.researcher.findUnique({ where: { id } });

    if (!researcher) {
      throw new ResearcherNotFoundException(id);
    }

    return researcher;
  }
}
