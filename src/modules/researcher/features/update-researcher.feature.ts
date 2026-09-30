import { Injectable } from '@nestjs/common';
import { Prisma, Researcher } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { ResearcherEmailAlreadyExistsException } from '../exceptions/researcher-email-already-exists.exception';
import { UserEmailAlreadyExistsException } from '../../user/exceptions/user-email-already-exists.exception';
import { FindResearcherByIdFeature } from './find-researcher-by-id.feature';

export type UpdateResearcherInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

@Injectable()
export class UpdateResearcherFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findResearcherByIdFeature: FindResearcherByIdFeature,
  ) {}

  async execute(id: string, input: UpdateResearcherInput): Promise<Researcher> {
    const current = await this.findResearcherByIdFeature.execute(id);

    // Mantiene sincronizados los datos de la cuenta vinculada (updateMany: los investigadores sin cuenta no fallan).
    const userData: Prisma.UserUpdateManyMutationInput = {};
    if (input.email !== undefined) userData.email = input.email;
    if (input.firstName !== undefined || input.lastName !== undefined) {
      userData.fullName = `${input.firstName ?? current.firstName} ${input.lastName ?? current.lastName}`;
    }

    try {
      if (Object.keys(userData).length === 0) {
        return await this.prisma.researcher.update({ where: { id }, data: input });
      }

      const [researcher] = await this.prisma.$transaction([
        this.prisma.researcher.update({ where: { id }, data: input }),
        this.prisma.user.updateMany({ where: { researcherId: id }, data: userData }),
      ]);
      return researcher;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002' && input.email) {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('users_email')) throw new UserEmailAlreadyExistsException(input.email);
        if (target.includes('email')) throw new ResearcherEmailAlreadyExistsException(input.email);
      }
      throw e;
    }
  }
}
