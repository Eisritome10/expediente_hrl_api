import { Injectable } from '@nestjs/common';
import { Destination } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';

export type ListDestinationsResult = {
  data: Destination[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListDestinationsFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number): Promise<ListDestinationsResult> {
    const { skip, take } = resolvePagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.destination.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.destination.count(),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
