import { Injectable } from '@nestjs/common';
import { StudyDesign } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';

export type ListStudyDesignsResult = {
  data: StudyDesign[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListStudyDesignsFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number): Promise<ListStudyDesignsResult> {
    const { skip, take } = resolvePagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.studyDesign.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.studyDesign.count(),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
