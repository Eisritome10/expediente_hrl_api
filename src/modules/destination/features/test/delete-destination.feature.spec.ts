import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteDestinationFeature } from '../delete-destination.feature';
import { FindDestinationByIdFeature } from '../find-destination-by-id.feature';
import { DestinationNotFoundException } from '../../exceptions/destination-not-found.exception';

describe('DeleteDestinationFeature', () => {
  const prisma = { destination: { delete: jest.fn() } } as unknown as PrismaService;
  const findDestinationByIdFeature = { execute: jest.fn() } as unknown as FindDestinationByIdFeature;
  const feature = new DeleteDestinationFeature(prisma, findDestinationByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the destination after checking it exists', async () => {
    (findDestinationByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'd1' });
    (prisma.destination.delete as jest.Mock).mockResolvedValue({ id: 'd1' });

    await feature.execute('d1');

    expect(findDestinationByIdFeature.execute).toHaveBeenCalledWith('d1');
    expect(prisma.destination.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
  });

  it('propagates the not-found error without deleting', async () => {
    (findDestinationByIdFeature.execute as jest.Mock).mockRejectedValue(
      new DestinationNotFoundException('missing'),
    );

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(DestinationNotFoundException);
    expect(prisma.destination.delete).not.toHaveBeenCalled();
  });
});
