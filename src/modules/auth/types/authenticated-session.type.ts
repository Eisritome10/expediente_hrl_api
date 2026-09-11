import type { AuthCurrentUser } from '../../../common/interfaces/auth-current-user.interface';

export type AuthenticatedSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthCurrentUser;
};
