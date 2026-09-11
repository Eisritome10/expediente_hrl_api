import { Injectable } from '@nestjs/common';
import { Destination, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { DestinationDescriptionAlreadyExistsException } from '../exceptions/destination-description-already-exists.exception';

export type CreateDestinationInput = {
  description: string;
};

@Injectable()
export class CreateDestinationFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateDestinationInput): Promise<Destination> {
    try {
      return await this.prisma.destination.create({ data: input });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('description')) {
          throw new DestinationDescriptionAlreadyExistsException(input.description);
        }
      }
      throw e;
    }
  }
}
