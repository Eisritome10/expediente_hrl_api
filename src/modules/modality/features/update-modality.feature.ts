import { Injectable } from '@nestjs/common';
import { Modality, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { ModalityNameAlreadyExistsException } from '../exceptions/modality-name-already-exists.exception';
import { FindModalityByIdFeature } from './find-modality-by-id.feature';

export type UpdateModalityInput = {
  name?: string;
  fee?: number;
};

@Injectable()
export class UpdateModalityFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findModalityByIdFeature: FindModalityByIdFeature,
  ) {}

  async execute(id: string, input: UpdateModalityInput): Promise<Modality> {
    await this.findModalityByIdFeature.execute(id);

    try {
      return await this.prisma.modality.update({ where: { id }, data: input });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        input.name &&
        getUniqueConstraintTarget(e).includes('name')
      ) {
        throw new ModalityNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
