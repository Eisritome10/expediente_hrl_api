import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteModalityFeature } from '../delete-modality.feature';
import { FindModalityByIdFeature } from '../find-modality-by-id.feature';
import { ModalityNotFoundException } from '../../exceptions/modality-not-found.exception';

describe('DeleteModalityFeature', () => {
  const prisma = { modality: { delete: jest.fn() } } as unknown as PrismaService;
  const findModalityByIdFeature = { execute: jest.fn() } as unknown as FindModalityByIdFeature;
  const feature = new DeleteModalityFeature(prisma, findModalityByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the modality after checking it exists', async () => {
    (findModalityByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'm1' });
    (prisma.modality.delete as jest.Mock).mockResolvedValue({ id: 'm1' });

    await feature.execute('m1');

    expect(findModalityByIdFeature.execute).toHaveBeenCalledWith('m1');
    expect(prisma.modality.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
  });

  it('propagates the not-found error without deleting', async () => {
    (findModalityByIdFeature.execute as jest.Mock).mockRejectedValue(
      new ModalityNotFoundException('missing'),
    );

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(ModalityNotFoundException);
    expect(prisma.modality.delete).not.toHaveBeenCalled();
  });
});
