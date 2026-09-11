import { Injectable } from '@nestjs/common';
import { Prisma, Researcher } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { ResearcherEmailAlreadyExistsException } from '../exceptions/researcher-email-already-exists.exception';
import { FindResearcherByIdFeature } from './find-researcher-by-id.feature';

export type UpdateResearcherInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

@Injectable()
export class UpdateResearcherFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findResearcherByIdFeature: FindResearcherByIdFeature,
  ) {}

  async execute(id: string, input: UpdateResearcherInput): Promise<Researcher> {
    await this.findResearcherByIdFeature.execute(id);

    try {
      return await this.prisma.researcher.update({ where: { id }, data: input });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        input.email &&
        getUniqueConstraintTarget(e).includes('email')
      ) {
        throw new ResearcherEmailAlreadyExistsException(input.email);
      }
      throw e;
    }
  }
}
