import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateDestinationFeature } from '../update-destination.feature';
import { FindDestinationByIdFeature } from '../find-destination-by-id.feature';
import { DestinationDescriptionAlreadyExistsException } from '../../exceptions/destination-description-already-exists.exception';

describe('UpdateDestinationFeature', () => {
  const prisma = { destination: { update: jest.fn() } } as unknown as PrismaService;
  const findDestinationByIdFeature = { execute: jest.fn() } as unknown as FindDestinationByIdFeature;
  const feature = new UpdateDestinationFeature(prisma, findDestinationByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the destination after checking it exists', async () => {
    const existing = { id: 'd1' };
    const updated = { id: 'd1', description: 'Nueva descripción' };
    (findDestinationByIdFeature.execute as jest.Mock).mockResolvedValue(existing);
    (prisma.destination.update as jest.Mock).mockResolvedValue(updated);

    await expect(feature.execute('d1', { description: 'Nueva descripción' })).resolves.toEqual(updated);
    expect(findDestinationByIdFeature.execute).toHaveBeenCalledWith('d1');
  });

  it('throws DestinationDescriptionAlreadyExistsException on a duplicate description', async () => {
    (findDestinationByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'd1' });
    (prisma.destination.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'destinations_description_key' } } } },
      }),
    );

    await expect(
      feature.execute('d1', { description: 'Duplicado' }),
    ).rejects.toBeInstanceOf(DestinationDescriptionAlreadyExistsException);
  });
});
