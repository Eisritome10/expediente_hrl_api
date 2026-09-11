import { Injectable } from '@nestjs/common';
import { Modality } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ModalityNotFoundException } from '../exceptions/modality-not-found.exception';

@Injectable()
export class FindModalityByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<Modality> {
    const modality = await this.prisma.modality.findUnique({ where: { id } });

    if (!modality) {
      throw new ModalityNotFoundException(id);
    }

    return modality;
  }
}
