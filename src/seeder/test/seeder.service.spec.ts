import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SeederService } from '../seeder.service';

jest.mock('argon2');

describe('SeederService', () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  } as unknown as PrismaService;
  const configService = { get: jest.fn() } as unknown as ConfigService;
  const service = new SeederService(prisma, configService);

  beforeEach(() => {
    jest.clearAllMocks();
    (argon2.hash as jest.Mock).mockResolvedValue('hashed');
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
  });

  it('creates the ADMIN user with the default password when it does not exist', async () => {
    (configService.get as jest.Mock).mockReturnValue(undefined);

    await service.onModuleInit();

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ username: 'ADMIN' }, { email: 'admin@admin.com' }] },
    });
    expect(argon2.hash).toHaveBeenCalledWith('ADMIN');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: 'ADMIN',
        email: 'admin@admin.com',
        fullName: 'Administrador',
        passwordHash: 'hashed',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
  });

  it('uses SEED_ADMIN_PASSWORD when it is provided', async () => {
    (configService.get as jest.Mock).mockReturnValue('Secret123');

    await service.onModuleInit();

    expect(argon2.hash).toHaveBeenCalledWith('Secret123');
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it('does not create a user when one already exists by username or email', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'u1' });

    await service.onModuleInit();

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('renames the legacy admin user instead of creating a new one', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'legacy-1' });

    await service.onModuleInit();

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'admin' } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'legacy-1' },
      data: { username: 'ADMIN', email: 'admin@admin.com' },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
