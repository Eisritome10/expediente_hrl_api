import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateDestinationFeature } from '../create-destination.feature';
import { DestinationDescriptionAlreadyExistsException } from '../../exceptions/destination-description-already-exists.exception';

describe('CreateDestinationFeature', () => {
  const prisma = { destination: { create: jest.fn() } } as unknown as PrismaService;
  const feature = new CreateDestinationFeature(prisma);

  const input = { description: 'Consulta externa' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a destination', async () => {
    const created = { id: 'd1', ...input, createdAt: new Date(), updatedAt: new Date() };
    (prisma.destination.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.destination.create).toHaveBeenCalledWith({ data: input });
  });

  it('throws DestinationDescriptionAlreadyExistsException on a duplicate description', async () => {
    (prisma.destination.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'destinations_description_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(
      DestinationDescriptionAlreadyExistsException,
    );
  });
});
