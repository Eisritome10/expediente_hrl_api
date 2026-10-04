import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { FacultyNameAlreadyExistsException } from '../exceptions/faculty-name-already-exists.exception';
import { FACULTY_INCLUDE, FacultyWithInstitution } from '../faculty.include';
import { FindFacultyByIdFeature } from './find-faculty-by-id.feature';

export type UpdateFacultyInput = {
  name?: string;
};

@Injectable()
export class UpdateFacultyFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findFacultyByIdFeature: FindFacultyByIdFeature,
  ) {}

  async execute(id: string, input: UpdateFacultyInput): Promise<FacultyWithInstitution> {
    await this.findFacultyByIdFeature.execute(id);

    try {
      return await this.prisma.faculty.update({ where: { id }, data: input, include: FACULTY_INCLUDE });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        input.name &&
        getUniqueConstraintTarget(e).includes('name')
      ) {
        throw new FacultyNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
