import { UserRole } from '@prisma/client';

export interface AuthCurrentUser {
  id: string;
  username: string;
  role: UserRole;
}
