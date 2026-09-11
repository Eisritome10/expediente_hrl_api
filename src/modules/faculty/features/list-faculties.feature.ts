import { Injectable } from '@nestjs/common';
import { Faculty } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';

export type ListFacultiesResult = {
  data: Faculty[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListFacultiesFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number): Promise<ListFacultiesResult> {
    const { skip, take } = resolvePagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.faculty.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.faculty.count(),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
