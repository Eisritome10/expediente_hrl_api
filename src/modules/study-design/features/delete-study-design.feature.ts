import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindStudyDesignByIdFeature } from './find-study-design-by-id.feature';

@Injectable()
export class DeleteStudyDesignFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findStudyDesignByIdFeature: FindStudyDesignByIdFeature,
  ) {}

  async execute(id: string): Promise<void> {
    await this.findStudyDesignByIdFeature.execute(id);
    await this.prisma.studyDesign.delete({ where: { id } });
  }
}
