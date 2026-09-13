import { Injectable } from '@nestjs/common';
import { Institution, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { InstitutionNameAlreadyExistsException } from '../exceptions/institution-name-already-exists.exception';

export type CreateInstitutionInput = {
  name: string;
  abbreviation: string | null;
  esUniversidad: boolean;
};

@Injectable()
export class CreateInstitutionFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateInstitutionInput): Promise<Institution> {
    try {
      return await this.prisma.institution.create({ data: input });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('name')) throw new InstitutionNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
