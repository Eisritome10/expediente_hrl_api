import { Injectable } from '@nestjs/common';
import { User, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindUserByIdFeature } from './find-user-by-id.feature';
import { UserManagedByResearcherException } from '../exceptions/user-managed-by-researcher.exception';

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
    const user = await this.findUserByIdFeature.execute(id);

    if (user.researcherId && input.role !== undefined && input.role !== user.role) {
      throw new UserManagedByResearcherException();
    }

    return this.prisma.user.update({ where: { id }, data: input });
  }
}
