import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteUserFeature } from '../delete-user.feature';
import { FindUserByIdFeature } from '../find-user-by-id.feature';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { UserInUseByProtocolReviewException } from '../../exceptions/user-in-use-by-protocol-review.exception';
import { UserManagedByResearcherException } from '../../exceptions/user-managed-by-researcher.exception';

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

  it('throws UserManagedByResearcherException and does not delete when the user belongs to a researcher', async () => {
    (findUserByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'u1', researcherId: 'r1' });

    await expect(feature.execute('u1')).rejects.toBeInstanceOf(UserManagedByResearcherException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('throws UserInUseByProtocolReviewException when the user is referenced by a protocol review', async () => {
    (findUserByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'u1' });

    const foreignKeyError = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
      code: 'P2003',
      clientVersion: '7.10.0',
    });
    (prisma.user.delete as jest.Mock).mockRejectedValue(foreignKeyError);

    await expect(feature.execute('u1')).rejects.toBeInstanceOf(UserInUseByProtocolReviewException);
  });

  it('rethrows errors that are not a foreign key violation', async () => {
    (findUserByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'u1' });
    const error = new Error('unexpected');
    (prisma.user.delete as jest.Mock).mockRejectedValue(error);

    await expect(feature.execute('u1')).rejects.toBe(error);
  });
});
