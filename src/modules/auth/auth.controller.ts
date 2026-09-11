import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { LoginRequestDto } from './dtos/request/login.request.dto';
import { LoginFeature } from './features/login.feature';
import { RefreshTokenFeature } from './features/refresh-token.feature';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthCurrentUser } from '../../common/interfaces/auth-current-user.interface';
import type { AuthenticatedSession } from './types/authenticated-session.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginFeature: LoginFeature,
    private readonly refreshTokenFeature: RefreshTokenFeature,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto): Promise<AuthenticatedSession> {
    return this.loginFeature.execute(dto.username, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(@CurrentUser() currentUser: AuthCurrentUser): Promise<AuthenticatedSession> {
    return this.refreshTokenFeature.execute(currentUser);
  }
}
