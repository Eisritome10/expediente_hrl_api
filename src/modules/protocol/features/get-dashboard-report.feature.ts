
import { BadRequestException, Injectable } from '@nestjs/common';
import { ProtocolStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export type DashboardReportResult = {
  from: string;
  to: string;
  total: number;
  byStatus: Record<ProtocolStatus, number>;
};

@Injectable()
export class GetDashboardReportFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(from?: string, to?: string): Promise<DashboardReportResult> {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3 + 3, 1);

    const start = from ? new Date(from) : quarterStart;
    const endExclusive = to
      ? new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000)
      : quarterEnd;

    if (start >= endExclusive) {
      throw new BadRequestException('La fecha inicial debe ser anterior o igual a la fecha final.');
    }

    const where = {
      fechaRecepcion: {
        gte: start,
        lt: endExclusive,
      },
    };

    const [total, grouped] = await Promise.all([
      this.prisma.protocol.count({ where }),
      this.prisma.protocol.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
    ]);

    const byStatus = Object.values(ProtocolStatus).reduce(
      (result, status) => {
        result[status] = 0;
        return result;
      },
      {} as Record<ProtocolStatus, number>,
    );

    for (const group of grouped) {
      byStatus[group.status] = group._count._all;
    }

    return {
      from: start.toISOString().slice(0, 10),
      to: new Date(endExclusive.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      total,
      byStatus,
    };
  }
}
