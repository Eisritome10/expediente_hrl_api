import { Injectable } from '@nestjs/common';
import { Modality } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';

export type ListModalitiesResult = {
  data: Modality[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListModalitiesFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number): Promise<ListModalitiesResult> {
    const { skip, take } = resolvePagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.modality.findMany({ skip, take, orderBy: { name: 'asc' } }),
      this.prisma.modality.count(),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
