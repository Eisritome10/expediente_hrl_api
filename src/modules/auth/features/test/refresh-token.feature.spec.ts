import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { RefreshTokenFeature } from '../refresh-token.feature';
import { InvalidCredentialsException } from '../../exceptions/invalid-credentials.exception';
import { UserInactiveException } from '../../exceptions/user-inactive.exception';
import type { AuthCurrentUser } from '../../../../common/interfaces/auth-current-user.interface';

describe('RefreshTokenFeature', () => {
  const prisma = { user: { findUnique: jest.fn() } } as unknown as PrismaService;
  const jwtService = { signAsync: jest.fn() } as unknown as JwtService;
  const configService = { getOrThrow: jest.fn((key: string) => key) } as unknown as ConfigService;
  const feature = new RefreshTokenFeature(prisma, jwtService, configService);

  const currentUser: AuthCurrentUser = { id: 'u1', username: 'admin', role: UserRole.ADMIN };

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

  it('re-issues access + refresh tokens for the current user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (jwtService.signAsync as jest.Mock)
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    const result = await feature.execute(currentUser);

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: { id: 'u1', username: 'admin', role: UserRole.ADMIN },
    });
  });

  it('throws InvalidCredentialsException when the user no longer exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute(currentUser)).rejects.toBeInstanceOf(InvalidCredentialsException);
  });

  it('throws UserInactiveException when the user became inactive', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...user, status: UserStatus.INACTIVE });

    await expect(feature.execute(currentUser)).rejects.toBeInstanceOf(UserInactiveException);
  });
});
