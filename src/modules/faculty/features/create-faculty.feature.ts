import { Injectable } from '@nestjs/common';
import { InstitutionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { InstitutionNotFoundException } from '../../institution/exceptions/institution-not-found.exception';
import { FacultyNameAlreadyExistsException } from '../exceptions/faculty-name-already-exists.exception';
import { FacultyInstitutionNotUniversityException } from '../exceptions/faculty-institution-not-university.exception';
import { FACULTY_INCLUDE, FacultyWithInstitution } from '../faculty.include';

export type CreateFacultyInput = {
  name: string;
  institutionId: string;
};

@Injectable()
export class CreateFacultyFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateFacultyInput): Promise<FacultyWithInstitution> {
    // Solo las universidades tienen facultades, y cada una carga las suyas.
    const institution = await this.prisma.institution.findUnique({ where: { id: input.institutionId } });
    if (!institution) throw new InstitutionNotFoundException(input.institutionId);
    if (institution.type !== InstitutionType.UNIVERSITY) {
      throw new FacultyInstitutionNotUniversityException(input.institutionId);
    }

    try {
      return await this.prisma.faculty.create({ data: input, include: FACULTY_INCLUDE });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('name')) throw new FacultyNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
