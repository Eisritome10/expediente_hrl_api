
import { BadRequestException } from '@nestjs/common';
import { ProtocolStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { GetDashboardReportFeature } from '../get-dashboard-report.feature';

describe('GetDashboardReportFeature', () => {
  const prisma = {
    protocol: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  } as unknown as PrismaService;

  const feature = new GetDashboardReportFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.protocol.count as jest.Mock).mockResolvedValue(3);
    (prisma.protocol.groupBy as jest.Mock).mockResolvedValue([
      { status: ProtocolStatus.CREATED, _count: { _all: 2 } },
      { status: ProtocolStatus.FINALIZED, _count: { _all: 1 } },
    ]);
  });

  it('uses the current quarter when no dates are provided', async () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const expectedFrom = new Date(now.getFullYear(), quarter * 3, 1)
      .toISOString()
      .slice(0, 10);

    const result = await feature.execute();

    expect(result.from).toBe(expectedFrom);
    expect(result.total).toBe(3);
    expect(result.byStatus.CREATED).toBe(2);
    expect(result.byStatus.FINALIZED).toBe(1);
    expect(result.byStatus.CIC_OBSERVED).toBe(0);
  });

  it('uses the requested custom date range', async () => {
    const result = await feature.execute('2026-07-01', '2026-09-30');

    expect(result.from).toBe('2026-07-01');
    expect(result.to).toBe('2026-09-30');
    expect(prisma.protocol.count).toHaveBeenCalledWith({
      where: {
        fechaRecepcion: {
          gte: new Date('2026-07-01'),
          lt: new Date('2026-10-01'),
        },
      },
    });
  });

  it('rejects a date range where the start is after the end', async () => {
    await expect(
      feature.execute('2026-10-01', '2026-09-30'),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.protocol.count).not.toHaveBeenCalled();
    expect(prisma.protocol.groupBy).not.toHaveBeenCalled();
  });
});
