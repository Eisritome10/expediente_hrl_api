import { Injectable } from '@nestjs/common';
import { Prisma, Researcher } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { ResearcherDniAlreadyExistsException } from '../exceptions/researcher-dni-already-exists.exception';
import { ResearcherEmailAlreadyExistsException } from '../exceptions/researcher-email-already-exists.exception';

export type CreateResearcherInput = {
  dni: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

@Injectable()
export class CreateResearcherFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateResearcherInput): Promise<Researcher> {
    try {
      return await this.prisma.researcher.create({ data: input });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('dni')) throw new ResearcherDniAlreadyExistsException(input.dni);
        if (target.includes('email') && input.email) {
          throw new ResearcherEmailAlreadyExistsException(input.email);
        }
      }
      throw e;
    }
  }
}
