import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindDestinationByIdFeature } from './find-destination-by-id.feature';

@Injectable()
export class DeleteDestinationFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findDestinationByIdFeature: FindDestinationByIdFeature,
  ) {}

  async execute(id: string): Promise<void> {
    await this.findDestinationByIdFeature.execute(id);
    await this.prisma.destination.delete({ where: { id } });
  }
}
