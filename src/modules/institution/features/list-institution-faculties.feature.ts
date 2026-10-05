import { Injectable } from '@nestjs/common';
import { Faculty } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindInstitutionByIdFeature } from './find-institution-by-id.feature';

@Injectable()
export class ListInstitutionFacultiesFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findInstitutionByIdFeature: FindInstitutionByIdFeature,
  ) {}

  async execute(institutionId: string): Promise<Faculty[]> {
    await this.findInstitutionByIdFeature.execute(institutionId);

    return this.prisma.faculty.findMany({ where: { institutionId }, orderBy: { name: 'asc' } });
  }
}
