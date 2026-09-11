import { Injectable } from '@nestjs/common';
import { Modality, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { ModalityNameAlreadyExistsException } from '../exceptions/modality-name-already-exists.exception';

export type CreateModalityInput = {
  name: string;
  fee: number;
};

@Injectable()
export class CreateModalityFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateModalityInput): Promise<Modality> {
    try {
      return await this.prisma.modality.create({ data: input });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('name')) throw new ModalityNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
