import { Injectable } from '@nestjs/common';
import { StudyDesign, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { StudyDesignNameAlreadyExistsException } from '../exceptions/study-design-name-already-exists.exception';
import { FindStudyDesignByIdFeature } from './find-study-design-by-id.feature';

export type UpdateStudyDesignInput = {
  name?: string;
};

@Injectable()
export class UpdateStudyDesignFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findStudyDesignByIdFeature: FindStudyDesignByIdFeature,
  ) {}

  async execute(id: string, input: UpdateStudyDesignInput): Promise<StudyDesign> {
    await this.findStudyDesignByIdFeature.execute(id);

    try {
      return await this.prisma.studyDesign.update({ where: { id }, data: input });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        input.name &&
        getUniqueConstraintTarget(e).includes('name')
      ) {
        throw new StudyDesignNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
