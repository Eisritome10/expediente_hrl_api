import { Injectable } from '@nestjs/common';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { UserUsernameAlreadyExistsException } from '../exceptions/user-username-already-exists.exception';

export type CreateUserInput = {
  username: string;
  fullName: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
};

@Injectable()
export class CreateUserFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateUserInput): Promise<User> {
    const passwordHash = await argon2.hash(input.password);

    try {
      return await this.prisma.user.create({
        data: {
          username: input.username,
          fullName: input.fullName,
          passwordHash,
          role: input.role,
          status: input.status,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('username')) throw new UserUsernameAlreadyExistsException(input.username);
      }
      throw e;
    }
  }
}
