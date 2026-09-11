import { PrismaService } from '../../../../prisma/prisma.service';
import { FindModalityByIdFeature } from '../find-modality-by-id.feature';
import { ModalityNotFoundException } from '../../exceptions/modality-not-found.exception';

describe('FindModalityByIdFeature', () => {
  const prisma = { modality: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindModalityByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the modality when found', async () => {
    const modality = { id: 'm1', name: 'Presencial' };
    (prisma.modality.findUnique as jest.Mock).mockResolvedValue(modality);

    await expect(feature.execute('m1')).resolves.toEqual(modality);
  });

  it('throws ModalityNotFoundException when missing', async () => {
    (prisma.modality.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(ModalityNotFoundException);
  });
});
