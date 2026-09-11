import { Injectable } from '@nestjs/common';
import { Researcher } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';

export type ListResearchersResult = {
  data: Researcher[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListResearchersFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number): Promise<ListResearchersResult> {
    const { skip, take } = resolvePagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.researcher.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.researcher.count(),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
