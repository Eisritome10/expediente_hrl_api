import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthCurrentUser } from '../../../common/interfaces/auth-current-user.interface';

export type AuthRequest = Request & { user: AuthCurrentUser };

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): AuthCurrentUser => {
  const request = context.switchToHttp().getRequest<AuthRequest>();
  return request.user;
});
