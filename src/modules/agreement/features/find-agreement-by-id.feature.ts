import { Injectable } from '@nestjs/common';
import { Agreement } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AgreementNotFoundException } from '../exceptions/agreement-not-found.exception';

@Injectable()
export class FindAgreementByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<Agreement> {
    const agreement = await this.prisma.agreement.findUnique({ where: { id } });

    if (!agreement) {
      throw new AgreementNotFoundException(id);
    }

    return agreement;
  }
}
