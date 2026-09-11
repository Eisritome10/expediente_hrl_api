import { Injectable } from '@nestjs/common';
import { Institution } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { InstitutionNotFoundException } from '../exceptions/institution-not-found.exception';

@Injectable()
export class FindInstitutionByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<Institution> {
    const institution = await this.prisma.institution.findUnique({ where: { id } });

    if (!institution) {
      throw new InstitutionNotFoundException(id);
    }

    return institution;
  }
}
