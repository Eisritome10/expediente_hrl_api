import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateModalityFeature } from '../create-modality.feature';
import { ModalityNameAlreadyExistsException } from '../../exceptions/modality-name-already-exists.exception';

describe('CreateModalityFeature', () => {
  const prisma = { modality: { create: jest.fn() } } as unknown as PrismaService;
  const feature = new CreateModalityFeature(prisma);

  const input = { name: 'Presencial', fee: 150 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a modality', async () => {
    const created = { id: 'm1', ...input, createdAt: new Date(), updatedAt: new Date() };
    (prisma.modality.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.modality.create).toHaveBeenCalledWith({ data: input });
  });

  it('throws ModalityNameAlreadyExistsException on a duplicate name', async () => {
    (prisma.modality.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'modalities_name_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ModalityNameAlreadyExistsException);
  });
});
