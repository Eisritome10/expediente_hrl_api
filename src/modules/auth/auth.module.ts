import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { LoginFeature } from './features/login.feature';
import { RefreshTokenFeature } from './features/refresh-token.feature';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';

const passportModule = PassportModule.register({});

@Module({
  imports: [
    PrismaModule,
    passportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.accessSecret'),
        signOptions: { expiresIn: configService.getOrThrow('jwt.accessExpiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginFeature,
    RefreshTokenFeature,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAccessGuard,
    JwtRefreshGuard,
    RolesGuard,
  ],
  exports: [passportModule, JwtAccessGuard, JwtRefreshGuard, RolesGuard],
})
export class AuthModule {}
