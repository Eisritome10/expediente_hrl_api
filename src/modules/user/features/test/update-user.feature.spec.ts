import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateUserFeature } from '../update-user.feature';
import { FindUserByIdFeature } from '../find-user-by-id.feature';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';

describe('UpdateUserFeature', () => {
  const prisma = { user: { update: jest.fn() } } as unknown as PrismaService;
  const findUserByIdFeature = { execute: jest.fn() } as unknown as FindUserByIdFeature;
  const feature = new UpdateUserFeature(prisma, findUserByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the user after checking it exists', async () => {
    const existing = { id: 'u1' };
    const updated = { id: 'u1', fullName: 'Grace Hopper' };
    (findUserByIdFeature.execute as jest.Mock).mockResolvedValue(existing);
    (prisma.user.update as jest.Mock).mockResolvedValue(updated);

    await expect(feature.execute('u1', { fullName: 'Grace Hopper' })).resolves.toEqual(updated);
    expect(findUserByIdFeature.execute).toHaveBeenCalledWith('u1');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { fullName: 'Grace Hopper' },
    });
  });

  it('throws UserNotFoundException and does not update when the id does not exist', async () => {
    (findUserByIdFeature.execute as jest.Mock).mockRejectedValue(new UserNotFoundException('missing'));

    await expect(feature.execute('missing', { fullName: 'Grace Hopper' })).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
