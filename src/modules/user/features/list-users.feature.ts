import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';

export type ListUsersResult = {
  data: User[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListUsersFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number): Promise<ListUsersResult> {
    const { skip, take } = resolvePagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count(),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
