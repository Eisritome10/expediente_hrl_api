import { PrismaService } from '../../../../prisma/prisma.service';
import { FindUserByIdFeature } from '../find-user-by-id.feature';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';

describe('FindUserByIdFeature', () => {
  const prisma = { user: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindUserByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the user when found', async () => {
    const user = { id: 'u1', username: 'jperez' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

    await expect(feature.execute('u1')).resolves.toEqual(user);
  });

  it('throws UserNotFoundException when missing', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
