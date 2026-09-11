import { PrismaService } from '../../../../prisma/prisma.service';
import { ListDestinationsFeature } from '../list-destinations.feature';

describe('ListDestinationsFeature', () => {
  const prisma = { destination: { findMany: jest.fn(), count: jest.fn() } } as unknown as PrismaService;
  const feature = new ListDestinationsFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves pagination and returns data with meta', async () => {
    const data = [{ id: 'd1' }, { id: 'd2' }];
    (prisma.destination.findMany as jest.Mock).mockResolvedValue(data);
    (prisma.destination.count as jest.Mock).mockResolvedValue(2);

    const result = await feature.execute(1, 10);

    expect(result).toEqual({ data, page: 1, limit: 10, total: 2 });
    expect(prisma.destination.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('defaults to page 1 / limit 10 when nothing is provided', async () => {
    (prisma.destination.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.destination.count as jest.Mock).mockResolvedValue(0);

    const result = await feature.execute();

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});
