import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolvePagination } from '../../../common/utils/pagination.util';
import { PROTOCOL_INCLUDE, ProtocolWithRelations } from '../protocol.include';

export type ListProtocolsFilters = {
  nroExpediente?: string;
  investigadorPrincipalId?: string;
  fechaRecepcionDesde?: Date;
  fechaRecepcionHasta?: Date;
};

export type ListProtocolsResult = {
  data: ProtocolWithRelations[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class ListProtocolsFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page?: number, limit?: number, filters: ListProtocolsFilters = {}): Promise<ListProtocolsResult> {
    const { skip, take } = resolvePagination(page, limit);

    const where: Prisma.ProtocolWhereInput = {
      nroExpediente: filters.nroExpediente ? { contains: filters.nroExpediente, mode: 'insensitive' } : undefined,
      investigadorPrincipalId: filters.investigadorPrincipalId,
      fechaRecepcion:
        filters.fechaRecepcionDesde || filters.fechaRecepcionHasta
          ? { gte: filters.fechaRecepcionDesde, lte: filters.fechaRecepcionHasta }
          : undefined,
    };

    const [data, total] = await Promise.all([
      this.prisma.protocol.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: PROTOCOL_INCLUDE }),
      this.prisma.protocol.count({ where }),
    ]);

    return { data, page: skip / take + 1, limit: take, total };
  }
}
