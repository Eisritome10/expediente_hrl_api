import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { UserInactiveException } from '../exceptions/user-inactive.exception';
import type { JwtPayload } from '../types/jwt-payload.type';
import type { AuthenticatedSession } from '../types/authenticated-session.type';

@Injectable()
export class LoginFeature {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(username: string, password: string): Promise<AuthenticatedSession> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new InvalidCredentialsException();

    if (user.status !== UserStatus.ACTIVE) throw new UserInactiveException();

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) throw new InvalidCredentialsException();

    const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('jwt.accessSecret'),
        expiresIn: this.configService.getOrThrow('jwt.accessExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('jwt.refreshSecret'),
        expiresIn: this.configService.getOrThrow('jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }
}
