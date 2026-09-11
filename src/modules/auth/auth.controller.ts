import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginRequestDto } from './dtos/request/login.request.dto';
import { AuthenticatedSessionResponseDto } from './dtos/response/authenticated-session.response.dto';
import { LoginFeature } from './features/login.feature';
import { RefreshTokenFeature } from './features/refresh-token.feature';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthCurrentUser } from '../../common/interfaces/auth-current-user.interface';
import type { AuthenticatedSession } from './types/authenticated-session.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginFeature: LoginFeature,
    private readonly refreshTokenFeature: RefreshTokenFeature,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiOkResponse({ type: AuthenticatedSessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginRequestDto): Promise<AuthenticatedSession> {
    return this.loginFeature.execute(dto.username, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renovar el token de acceso usando el token de refresco' })
  @ApiOkResponse({ type: AuthenticatedSessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token de refresco inválido o expirado' })
  async refresh(@CurrentUser() currentUser: AuthCurrentUser): Promise<AuthenticatedSession> {
    return this.refreshTokenFeature.execute(currentUser);
  }
}
