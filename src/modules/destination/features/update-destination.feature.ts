import { Injectable } from '@nestjs/common';
import { Destination, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { DestinationDescriptionAlreadyExistsException } from '../exceptions/destination-description-already-exists.exception';
import { FindDestinationByIdFeature } from './find-destination-by-id.feature';

export type UpdateDestinationInput = {
  description?: string;
};

@Injectable()
export class UpdateDestinationFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findDestinationByIdFeature: FindDestinationByIdFeature,
  ) {}

  async execute(id: string, input: UpdateDestinationInput): Promise<Destination> {
    await this.findDestinationByIdFeature.execute(id);

    try {
      return await this.prisma.destination.update({ where: { id }, data: input });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        input.description &&
        getUniqueConstraintTarget(e).includes('description')
      ) {
        throw new DestinationDescriptionAlreadyExistsException(input.description);
      }
      throw e;
    }
  }
}
