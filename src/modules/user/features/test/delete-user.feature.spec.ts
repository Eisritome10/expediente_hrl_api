import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteUserFeature } from '../delete-user.feature';
import { FindUserByIdFeature } from '../find-user-by-id.feature';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';

describe('DeleteUserFeature', () => {
  const prisma = { user: { delete: jest.fn() } } as unknown as PrismaService;
  const findUserByIdFeature = { execute: jest.fn() } as unknown as FindUserByIdFeature;
  const feature = new DeleteUserFeature(prisma, findUserByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the user after checking it exists', async () => {
    (findUserByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'u1' });
    (prisma.user.delete as jest.Mock).mockResolvedValue({ id: 'u1' });

    await feature.execute('u1');

    expect(findUserByIdFeature.execute).toHaveBeenCalledWith('u1');
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('propagates the not-found error without deleting', async () => {
    (findUserByIdFeature.execute as jest.Mock).mockRejectedValue(new UserNotFoundException('missing'));

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(UserNotFoundException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });
});
