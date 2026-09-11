import { LineType } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ListResearchLinesFeature } from '../list-research-lines.feature';

describe('ListResearchLinesFeature', () => {
  const prisma = {
    researchLine: { findMany: jest.fn(), count: jest.fn() },
  } as unknown as PrismaService;
  const feature = new ListResearchLinesFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves pagination and returns data with meta', async () => {
    const data = [{ id: 'l1' }, { id: 'l2' }];
    (prisma.researchLine.findMany as jest.Mock).mockResolvedValue(data);
    (prisma.researchLine.count as jest.Mock).mockResolvedValue(2);

    const result = await feature.execute(1, 10);

    expect(result).toEqual({ data, page: 1, limit: 10, total: 2 });
    expect(prisma.researchLine.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: { name: 'asc' },
    });
  });

  it('filters by type when provided', async () => {
    (prisma.researchLine.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.researchLine.count as jest.Mock).mockResolvedValue(0);

    await feature.execute(1, 10, LineType.HRL);

    expect(prisma.researchLine.findMany).toHaveBeenCalledWith({
      where: { type: LineType.HRL },
      skip: 0,
      take: 10,
      orderBy: { name: 'asc' },
    });
    expect(prisma.researchLine.count).toHaveBeenCalledWith({ where: { type: LineType.HRL } });
  });

  it('defaults to page 1 / limit 10 when nothing is provided', async () => {
    (prisma.researchLine.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.researchLine.count as jest.Mock).mockResolvedValue(0);

    const result = await feature.execute();

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});
