import { Injectable } from '@nestjs/common';
import { StudyDesign, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { StudyDesignNameAlreadyExistsException } from '../exceptions/study-design-name-already-exists.exception';

export type CreateStudyDesignInput = {
  name: string;
};

@Injectable()
export class CreateStudyDesignFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateStudyDesignInput): Promise<StudyDesign> {
    try {
      return await this.prisma.studyDesign.create({ data: input });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('name')) throw new StudyDesignNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
