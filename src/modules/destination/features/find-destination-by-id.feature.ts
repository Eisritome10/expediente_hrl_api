import { Injectable } from '@nestjs/common';
import { Destination } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { DestinationNotFoundException } from '../exceptions/destination-not-found.exception';

@Injectable()
export class FindDestinationByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<Destination> {
    const destination = await this.prisma.destination.findUnique({ where: { id } });

    if (!destination) {
      throw new DestinationNotFoundException(id);
    }

    return destination;
  }
}
