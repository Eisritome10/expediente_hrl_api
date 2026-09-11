import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindModalityByIdFeature } from './find-modality-by-id.feature';

@Injectable()
export class DeleteModalityFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findModalityByIdFeature: FindModalityByIdFeature,
  ) {}

  async execute(id: string): Promise<void> {
    await this.findModalityByIdFeature.execute(id);
    await this.prisma.modality.delete({ where: { id } });
  }
}
