import { Injectable } from '@nestjs/common';
import { LineType, Prisma, ResearchLine } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';

export type ListResearchLinesResult = {
  data: ResearchLine[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListResearchLinesFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number, type?: LineType): Promise<ListResearchLinesResult> {
    const { skip, take } = resolvePagination(page, limit);
    const where: Prisma.ResearchLineWhereInput = type ? { type } : {};

    const [data, total] = await Promise.all([
      this.prisma.researchLine.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      this.prisma.researchLine.count({ where }),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
