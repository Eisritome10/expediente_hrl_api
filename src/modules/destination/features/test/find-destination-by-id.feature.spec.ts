import { PrismaService } from '../../../../prisma/prisma.service';
import { FindDestinationByIdFeature } from '../find-destination-by-id.feature';
import { DestinationNotFoundException } from '../../exceptions/destination-not-found.exception';

describe('FindDestinationByIdFeature', () => {
  const prisma = { destination: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindDestinationByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the destination when found', async () => {
    const destination = { id: 'd1', description: 'Consulta externa' };
    (prisma.destination.findUnique as jest.Mock).mockResolvedValue(destination);

    await expect(feature.execute('d1')).resolves.toEqual(destination);
  });

  it('throws DestinationNotFoundException when missing', async () => {
    (prisma.destination.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(DestinationNotFoundException);
  });
});
