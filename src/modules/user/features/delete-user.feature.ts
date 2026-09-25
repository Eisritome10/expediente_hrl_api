import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindUserByIdFeature } from './find-user-by-id.feature';

@Injectable()
export class DeleteUserFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findUserByIdFeature: FindUserByIdFeature,
  ) {}

  async execute(id: string): Promise<void> {
    await this.findUserByIdFeature.execute(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
