import { Injectable } from '@nestjs/common';
import { User, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindUserByIdFeature } from './find-user-by-id.feature';

export type UpdateUserInput = {
  fullName?: string;
  role?: UserRole;
  status?: UserStatus;
};

@Injectable()
export class UpdateUserFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findUserByIdFeature: FindUserByIdFeature,
  ) {}

  async execute(id: string, input: UpdateUserInput): Promise<User> {
    await this.findUserByIdFeature.execute(id);

    return this.prisma.user.update({ where: { id }, data: input });
  }
}
