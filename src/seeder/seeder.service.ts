import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ADMIN_USERNAME = 'ADMIN';
const ADMIN_EMAIL = 'admin@admin.com';
const LEGACY_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'ADMIN';

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
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }] },
    });
    if (existing) return;

    // Bases anteriores: el admin se creaba como 'admin'; se renombra conservando su contraseña.
    const legacy = await this.prisma.user.findUnique({ where: { username: LEGACY_ADMIN_USERNAME } });
    if (legacy) {
      await this.prisma.user.update({
        where: { id: legacy.id },
        data: { username: ADMIN_USERNAME, email: ADMIN_EMAIL },
      });
      this.logger.log(`Renamed legacy admin user to ${ADMIN_USERNAME}`);
      return;
    }

    const password = this.configService.get<string>('SEED_ADMIN_PASSWORD') ?? DEFAULT_ADMIN_PASSWORD;
    const passwordHash = await argon2.hash(password);

    await this.prisma.user.create({
      data: {
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        fullName: 'Administrador',
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    this.logger.log(`Seeded initial admin user (username: ${ADMIN_USERNAME})`);
  }
}
