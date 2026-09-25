import { Injectable } from '@nestjs/common';
import { LineType, Prisma, ResearchLine } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { ResearchLineNameAndTypeAlreadyExistsException } from '../exceptions/research-line-name-and-type-already-exists.exception';
import { FindResearchLineByIdFeature } from './find-research-line-by-id.feature';

export type UpdateResearchLineInput = {
  name?: string;
  type?: LineType;
};

@Injectable()
export class UpdateResearchLineFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findResearchLineByIdFeature: FindResearchLineByIdFeature,
  ) {}

  async execute(id: string, input: UpdateResearchLineInput): Promise<ResearchLine> {
    await this.findResearchLineByIdFeature.execute(id);

    try {
      return await this.prisma.researchLine.update({
        where: { id },
        data: input,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const target = getUniqueConstraintTarget(e);

        if (target.includes('name') && target.includes('type')) {
          throw new ResearchLineNameAndTypeAlreadyExistsException(
            input.name ?? '',
            input.type ?? '',
          );
        }
      }

      throw e;
    }
  }
}