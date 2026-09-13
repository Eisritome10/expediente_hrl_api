import { PrismaService } from '../../../../prisma/prisma.service';
import { FindProtocolByIdFeature } from '../find-protocol-by-id.feature';
import { ProtocolNotFoundException } from '../../exceptions/protocol-not-found.exception';

describe('FindProtocolByIdFeature', () => {
  const prisma = { protocol: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindProtocolByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the protocol when found', async () => {
    const protocol = { id: 'p1' };
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(protocol);

    await expect(feature.execute('p1')).resolves.toEqual(protocol);
  });

  it('throws ProtocolNotFoundException when missing', async () => {
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(ProtocolNotFoundException);
  });
});
