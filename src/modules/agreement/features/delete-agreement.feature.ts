import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindAgreementByIdFeature } from './find-agreement-by-id.feature';
import { AgreementInUseByProtocolException } from '../exceptions/agreement-in-use-by-protocol.exception';

@Injectable()
export class DeleteAgreementFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findAgreementByIdFeature: FindAgreementByIdFeature,
  ) {}

  async execute(id: string): Promise<void> {
    await this.findAgreementByIdFeature.execute(id);

    try {
      await this.prisma.agreement.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new AgreementInUseByProtocolException();
      }
      throw e;
    }
  }
}
