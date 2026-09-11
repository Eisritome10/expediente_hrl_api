import { applyDecorators, UseGuards } from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export const UseAuth = (...roles: UserRole[]) =>
  applyDecorators(UseGuards(JwtAccessGuard, RolesGuard), Roles(...roles));
