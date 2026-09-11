import { PrismaService } from '../../../../prisma/prisma.service';
import { ListResearchersFeature } from '../list-researchers.feature';

describe('ListResearchersFeature', () => {
  const prisma = { researcher: { findMany: jest.fn(), count: jest.fn() } } as unknown as PrismaService;
  const feature = new ListResearchersFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves pagination and returns data with meta', async () => {
    const data = [{ id: 'r1' }, { id: 'r2' }];
    (prisma.researcher.findMany as jest.Mock).mockResolvedValue(data);
    (prisma.researcher.count as jest.Mock).mockResolvedValue(2);

    const result = await feature.execute(1, 10);

    expect(result).toEqual({ data, page: 1, limit: 10, total: 2 });
    expect(prisma.researcher.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('defaults to page 1 / limit 10 when nothing is provided', async () => {
    (prisma.researcher.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.researcher.count as jest.Mock).mockResolvedValue(0);

    const result = await feature.execute();

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});
