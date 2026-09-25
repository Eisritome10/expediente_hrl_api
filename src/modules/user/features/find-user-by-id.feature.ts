import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Injectable()
export class FindUserByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }
}
