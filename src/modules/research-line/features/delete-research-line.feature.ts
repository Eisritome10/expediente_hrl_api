import { Injectable } from '@nestjs/common';
import { ResearchLine } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindResearchLineByIdFeature } from './find-research-line-by-id.feature';

@Injectable()
export class DeleteResearchLineFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findResearchLineByIdFeature: FindResearchLineByIdFeature,
  ) {}

  async execute(id: string): Promise<ResearchLine> {
    await this.findResearchLineByIdFeature.execute(id);

    return this.prisma.researchLine.delete({
      where: { id },
    });
  }
}