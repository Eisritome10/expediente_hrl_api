import { Injectable } from '@nestjs/common';
import { Institution, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { InstitutionNameAlreadyExistsException } from '../exceptions/institution-name-already-exists.exception';
import { FindInstitutionByIdFeature } from './find-institution-by-id.feature';

export type UpdateInstitutionInput = {
  name?: string;
  abbreviation?: string;
  esUniversidad?: boolean;
};

@Injectable()
export class UpdateInstitutionFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findInstitutionByIdFeature: FindInstitutionByIdFeature,
  ) {}

  async execute(id: string, input: UpdateInstitutionInput): Promise<Institution> {
    await this.findInstitutionByIdFeature.execute(id);

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
