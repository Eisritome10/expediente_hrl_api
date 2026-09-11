import { PrismaService } from '../../../../prisma/prisma.service';
import { ListModalitiesFeature } from '../list-modalities.feature';

describe('ListModalitiesFeature', () => {
  const prisma = { modality: { findMany: jest.fn(), count: jest.fn() } } as unknown as PrismaService;
  const feature = new ListModalitiesFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves pagination and returns data with meta', async () => {
    const data = [{ id: 'm1' }, { id: 'm2' }];
    (prisma.modality.findMany as jest.Mock).mockResolvedValue(data);
    (prisma.modality.count as jest.Mock).mockResolvedValue(2);

    const result = await feature.execute(1, 10);

    expect(result).toEqual({ data, page: 1, limit: 10, total: 2 });
    expect(prisma.modality.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { name: 'asc' },
    });
  });

  it('defaults to page 1 / limit 10 when nothing is provided', async () => {
    (prisma.modality.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.modality.count as jest.Mock).mockResolvedValue(0);

    const result = await feature.execute();

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});
