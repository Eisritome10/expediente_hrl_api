import { PrismaService } from '../../../../prisma/prisma.service';
import { ListAgreementsFeature } from '../list-agreements.feature';

describe('ListAgreementsFeature', () => {
  const prisma = { agreement: { findMany: jest.fn(), count: jest.fn() } } as unknown as PrismaService;
  const feature = new ListAgreementsFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves pagination and returns data with meta', async () => {
    const data = [{ id: 'a1' }, { id: 'a2' }];
    (prisma.agreement.findMany as jest.Mock).mockResolvedValue(data);
    (prisma.agreement.count as jest.Mock).mockResolvedValue(2);

    const result = await feature.execute(1, 10);

    expect(result).toEqual({ data, page: 1, limit: 10, total: 2 });
    expect(prisma.agreement.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('defaults to page 1 / limit 10 when nothing is provided', async () => {
    (prisma.agreement.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.agreement.count as jest.Mock).mockResolvedValue(0);

    const result = await feature.execute();

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});
