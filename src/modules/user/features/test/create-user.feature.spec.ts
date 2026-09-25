import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateUserFeature } from '../create-user.feature';
import { UserUsernameAlreadyExistsException } from '../../exceptions/user-username-already-exists.exception';

describe('CreateUserFeature', () => {
  const prisma = { user: { create: jest.fn() } } as unknown as PrismaService;
  const feature = new CreateUserFeature(prisma);

  const input = {
    username: 'jperez',
    fullName: 'Juan Pérez',
    password: 'ContraseñaSegura123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user hashing the password', async () => {
    const created = {
      id: 'u1',
      username: input.username,
      fullName: input.fullName,
      passwordHash: 'hashed',
      role: 'NURSE',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.user.create as jest.Mock).mockResolvedValue(created);

    const result = await feature.execute(input);

    expect(result).toEqual(created);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    const callArgs = (prisma.user.create as jest.Mock).mock.calls[0][0];
    expect(callArgs.data.username).toBe(input.username);
    expect(callArgs.data.fullName).toBe(input.fullName);
    expect(callArgs.data.passwordHash).not.toBe(input.password);
    expect(callArgs.data.password).toBeUndefined();
    await expect(argon2.verify(callArgs.data.passwordHash, input.password)).resolves.toBe(true);
  });

  it('throws UserUsernameAlreadyExistsException on a duplicate username', async () => {
    (prisma.user.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'users_username_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(UserUsernameAlreadyExistsException);
  });

  it('re-throws errors that are not a unique constraint violation', async () => {
    const error = new Error('unexpected');
    (prisma.user.create as jest.Mock).mockRejectedValue(error);

    await expect(feature.execute(input)).rejects.toThrow(error);
  });
});
