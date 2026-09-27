import { PrismaService } from '../../../../prisma/prisma.service';
import { ListProtocolReviewsFeature } from '../list-protocol-reviews.feature';
import { ProtocolNotFoundException } from '../../../protocol/exceptions/protocol-not-found.exception';
import { PROTOCOL_REVIEW_INCLUDE } from '../../protocol-review.include';

describe('ListProtocolReviewsFeature', () => {
  const prisma = {
    protocol: { findUnique: jest.fn() },
    protocolReview: { findMany: jest.fn(), count: jest.fn() },
  } as unknown as PrismaService;

  const feature = new ListProtocolReviewsFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws ProtocolNotFoundException when the protocol does not exist', async () => {
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(ProtocolNotFoundException);
    expect(prisma.protocolReview.findMany).not.toHaveBeenCalled();
  });

  it('resolves pagination and returns data with meta', async () => {
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'p1' });
    const data = [{ id: 'rev1' }, { id: 'rev2' }];
    (prisma.protocolReview.findMany as jest.Mock).mockResolvedValue(data);
    (prisma.protocolReview.count as jest.Mock).mockResolvedValue(2);

    const result = await feature.execute('p1', 1, 10);

    expect(result).toEqual({ data, page: 1, limit: 10, total: 2 });
    expect(prisma.protocolReview.findMany).toHaveBeenCalledWith({
      where: { protocolId: 'p1' },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: PROTOCOL_REVIEW_INCLUDE,
    });
    expect(prisma.protocolReview.count).toHaveBeenCalledWith({ where: { protocolId: 'p1' } });
  });

  it('defaults to page 1 / limit 10 when nothing is provided', async () => {
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'p1' });
    (prisma.protocolReview.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.protocolReview.count as jest.Mock).mockResolvedValue(0);

    const result = await feature.execute('p1');

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});
