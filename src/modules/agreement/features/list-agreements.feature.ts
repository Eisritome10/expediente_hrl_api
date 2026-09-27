import { Injectable } from '@nestjs/common';
import { Agreement } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';

export type ListAgreementsResult = {
  data: Agreement[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListAgreementsFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number): Promise<ListAgreementsResult> {
    const { skip, take } = resolvePagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.agreement.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.agreement.count(),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
