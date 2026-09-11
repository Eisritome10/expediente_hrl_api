import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateModalityFeature } from '../update-modality.feature';
import { FindModalityByIdFeature } from '../find-modality-by-id.feature';
import { ModalityNameAlreadyExistsException } from '../../exceptions/modality-name-already-exists.exception';

describe('UpdateModalityFeature', () => {
  const prisma = { modality: { update: jest.fn() } } as unknown as PrismaService;
  const findModalityByIdFeature = { execute: jest.fn() } as unknown as FindModalityByIdFeature;
  const feature = new UpdateModalityFeature(prisma, findModalityByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the modality after checking it exists', async () => {
    const existing = { id: 'm1' };
    const updated = { id: 'm1', name: 'Virtual', fee: 100 };
    (findModalityByIdFeature.execute as jest.Mock).mockResolvedValue(existing);
    (prisma.modality.update as jest.Mock).mockResolvedValue(updated);

    await expect(feature.execute('m1', { name: 'Virtual', fee: 100 })).resolves.toEqual(updated);
    expect(findModalityByIdFeature.execute).toHaveBeenCalledWith('m1');
  });

  it('throws ModalityNameAlreadyExistsException on a duplicate name', async () => {
    (findModalityByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'm1' });
    (prisma.modality.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'modalities_name_key' } } } },
      }),
    );

    await expect(
      feature.execute('m1', { name: 'Duplicado' }),
    ).rejects.toBeInstanceOf(ModalityNameAlreadyExistsException);
  });
});
