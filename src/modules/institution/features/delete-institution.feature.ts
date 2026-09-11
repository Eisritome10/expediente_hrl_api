import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindInstitutionByIdFeature } from './find-institution-by-id.feature';

@Injectable()
export class DeleteInstitutionFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findInstitutionByIdFeature: FindInstitutionByIdFeature,
  ) {}

  async execute(id: string): Promise<void> {
    await this.findInstitutionByIdFeature.execute(id);
    await this.prisma.institution.delete({ where: { id } });
  }
}
