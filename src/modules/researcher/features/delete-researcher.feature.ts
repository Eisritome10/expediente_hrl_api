import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindResearcherByIdFeature } from './find-researcher-by-id.feature';

@Injectable()
export class DeleteResearcherFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findResearcherByIdFeature: FindResearcherByIdFeature,
  ) {}

  async execute(id: string): Promise<void> {
    await this.findResearcherByIdFeature.execute(id);
    await this.prisma.researcher.delete({ where: { id } });
  }
}
