import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();
  }

  private async seedAdminUser(): Promise<void> {
    const username = 'admin';
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) return;

    const password = this.configService.get<string>('SEED_ADMIN_PASSWORD');
    if (!password) {
      this.logger.warn('SEED_ADMIN_PASSWORD is not set — skipping initial admin user seed');
      return;
    }

    const passwordHash = await argon2.hash(password);

    await this.prisma.user.create({
      data: {
        username,
        fullName: 'Administrador',
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    this.logger.log(`Seeded initial admin user (username: ${username})`);
  }
}
