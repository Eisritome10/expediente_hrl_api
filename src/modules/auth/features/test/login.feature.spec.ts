import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LoginFeature } from '../login.feature';
import { InvalidCredentialsException } from '../../exceptions/invalid-credentials.exception';
import { UserInactiveException } from '../../exceptions/user-inactive.exception';

jest.mock('argon2');

describe('LoginFeature', () => {
  const prisma = { user: { findUnique: jest.fn() } } as unknown as PrismaService;
  const jwtService = { signAsync: jest.fn() } as unknown as JwtService;
  const configService = { getOrThrow: jest.fn((key: string) => key) } as unknown as ConfigService;
  const feature = new LoginFeature(prisma, jwtService, configService);

  const user = {
    id: 'u1',
    username: 'admin',
    fullName: 'Administrador',
    passwordHash: 'hashed',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in and returns access + refresh tokens', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    (jwtService.signAsync as jest.Mock)
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await feature.execute('admin', 'password');

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'u1', username: 'admin', role: UserRole.ADMIN },
    });
    expect(argon2.verify).toHaveBeenCalledWith('hashed', 'password');
  });

  it('throws InvalidCredentialsException when the user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing', 'password')).rejects.toBeInstanceOf(
      InvalidCredentialsException,
    );
  });

  it('throws UserInactiveException when the user is inactive', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...user, status: UserStatus.INACTIVE });

    await expect(feature.execute('admin', 'password')).rejects.toBeInstanceOf(UserInactiveException);
  });

  it('throws InvalidCredentialsException when the password is wrong', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (argon2.verify as jest.Mock).mockResolvedValue(false);

    await expect(feature.execute('admin', 'wrong')).rejects.toBeInstanceOf(InvalidCredentialsException);
  });
});
