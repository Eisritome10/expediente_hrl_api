import { Injectable } from '@nestjs/common';
import { Agreement, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { AgreementNameAlreadyExistsException } from '../exceptions/agreement-name-already-exists.exception';
import { FindAgreementByIdFeature } from './find-agreement-by-id.feature';

export type UpdateAgreementInput = {
  name?: string;
};

@Injectable()
export class UpdateAgreementFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findAgreementByIdFeature: FindAgreementByIdFeature,
  ) {}

  async execute(id: string, input: UpdateAgreementInput): Promise<Agreement> {
    await this.findAgreementByIdFeature.execute(id);

    try {
      return await this.prisma.agreement.update({ where: { id }, data: input });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        input.name &&
        getUniqueConstraintTarget(e).includes('name')
      ) {
        throw new AgreementNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
