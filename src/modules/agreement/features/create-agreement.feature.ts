import { Injectable } from '@nestjs/common';
import { Agreement, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { AgreementNameAlreadyExistsException } from '../exceptions/agreement-name-already-exists.exception';

export type CreateAgreementInput = {
  name: string;
};

@Injectable()
export class CreateAgreementFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateAgreementInput): Promise<Agreement> {
    try {
      return await this.prisma.agreement.create({ data: input });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('name')) throw new AgreementNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
