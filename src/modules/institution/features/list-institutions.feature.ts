import { Injectable } from '@nestjs/common';
import { Institution } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';

export type ListInstitutionsResult = {
  data: Institution[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListInstitutionsFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number): Promise<ListInstitutionsResult> {
    const { skip, take } = resolvePagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.institution.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.institution.count(),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
