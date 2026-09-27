import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindUserByIdFeature } from './find-user-by-id.feature';
import { UserInUseByProtocolReviewException } from '../exceptions/user-in-use-by-protocol-review.exception';

@Injectable()
export class DeleteUserFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findUserByIdFeature: FindUserByIdFeature,
  ) {}

  async execute(id: string): Promise<void> {
    await this.findUserByIdFeature.execute(id);

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new UserInUseByProtocolReviewException();
      }
      throw e;
    }
  }
}
