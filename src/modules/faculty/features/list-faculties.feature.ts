import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';
import { FACULTY_INCLUDE, FacultyWithInstitution } from '../faculty.include';

export type ListFacultiesResult = {
  data: FacultyWithInstitution[];
  page: number;
  limit: number;
  total: number;
};

export type ListFacultiesFilters = {
  institutionId?: string;
};

@Injectable()
export class ListFacultiesFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number, filters: ListFacultiesFilters = {}): Promise<ListFacultiesResult> {
    const { skip, take } = resolvePagination(page, limit);
    const where: Prisma.FacultyWhereInput = filters.institutionId ? { institutionId: filters.institutionId } : {};

    const [data, total] = await Promise.all([
      this.prisma.faculty.findMany({
        where,
        skip,
        take,
        orderBy: filters.institutionId ? { name: 'asc' } : { createdAt: 'desc' },
        include: FACULTY_INCLUDE,
      }),
      this.prisma.faculty.count({ where }),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
