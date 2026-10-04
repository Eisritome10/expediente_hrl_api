import { Injectable } from '@nestjs/common';
import { Institution, InstitutionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { InstitutionNameAlreadyExistsException } from '../exceptions/institution-name-already-exists.exception';
import { InstitutionHasFacultiesException } from '../exceptions/institution-has-faculties.exception';
import { FindInstitutionByIdFeature } from './find-institution-by-id.feature';

export type UpdateInstitutionInput = {
  name?: string;
  abbreviation?: string;
  type?: InstitutionType;
};

@Injectable()
export class UpdateInstitutionFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findInstitutionByIdFeature: FindInstitutionByIdFeature,
  ) {}

  async execute(id: string, input: UpdateInstitutionInput): Promise<Institution> {
    const current = await this.findInstitutionByIdFeature.execute(id);

    // Una universidad con facultades no puede cambiar de tipo: primero se eliminan sus facultades.
    if (input.type !== undefined && current.type === InstitutionType.UNIVERSITY && input.type !== current.type) {
      const faculties = await this.prisma.faculty.count({ where: { institutionId: id } });
      if (faculties > 0) throw new InstitutionHasFacultiesException(id);
    }

    try {
      return await this.prisma.institution.update({ where: { id }, data: input });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        input.name &&
        getUniqueConstraintTarget(e).includes('name')
      ) {
        throw new InstitutionNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
