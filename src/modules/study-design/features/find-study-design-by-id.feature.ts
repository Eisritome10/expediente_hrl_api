import { Injectable } from '@nestjs/common';
import { StudyDesign } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { StudyDesignNotFoundException } from '../exceptions/study-design-not-found.exception';

@Injectable()
export class FindStudyDesignByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<StudyDesign> {
    const studyDesign = await this.prisma.studyDesign.findUnique({ where: { id } });

    if (!studyDesign) {
      throw new StudyDesignNotFoundException(id);
    }

    return studyDesign;
  }
}
