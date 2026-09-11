import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindFacultyByIdFeature } from './find-faculty-by-id.feature';

@Injectable()
export class DeleteFacultyFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findFacultyByIdFeature: FindFacultyByIdFeature,
  ) {}

  async execute(id: string): Promise<void> {
    await this.findFacultyByIdFeature.execute(id);
    await this.prisma.faculty.delete({ where: { id } });
  }
}
