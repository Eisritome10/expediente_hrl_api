import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma, Researcher, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { ResearcherDniAlreadyExistsException } from '../exceptions/researcher-dni-already-exists.exception';
import { ResearcherEmailAlreadyExistsException } from '../exceptions/researcher-email-already-exists.exception';
import { UserUsernameAlreadyExistsException } from '../../user/exceptions/user-username-already-exists.exception';
import { UserEmailAlreadyExistsException } from '../../user/exceptions/user-email-already-exists.exception';

export type CreateResearcherInput = {
  dni: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

@Injectable()
export class CreateResearcherFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateResearcherInput): Promise<Researcher> {
    // La cuenta de acceso nace con el investigador: username = DNI, password inicial = DNI.
    const passwordHash = await argon2.hash(input.dni);

    try {
      return await this.prisma.researcher.create({
        data: {
          ...input,
          user: {
            create: {
              username: input.dni,
              email: input.email,
              fullName: `${input.firstName} ${input.lastName}`,
              passwordHash,
              role: UserRole.RESEARCHER,
              status: UserStatus.ACTIVE,
            },
          },
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        // "email" coincide con researchers_email_key y users_email_key: chequear primero las constraints de users.
        if (target.includes('users_username')) throw new UserUsernameAlreadyExistsException(input.dni);
        if (target.includes('users_email') && input.email) throw new UserEmailAlreadyExistsException(input.email);
        if (target.includes('dni')) throw new ResearcherDniAlreadyExistsException(input.dni);
        if (target.includes('email') && input.email) {
          throw new ResearcherEmailAlreadyExistsException(input.email);
        }
      }
      throw e;
    }
  }
}
