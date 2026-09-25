import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { CreateUserFeature } from './features/create-user.feature';
import { ListUsersFeature } from './features/list-users.feature';
import { FindUserByIdFeature } from './features/find-user-by-id.feature';
import { UpdateUserFeature } from './features/update-user.feature';
import { DeleteUserFeature } from './features/delete-user.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
  providers: [
    CreateUserFeature,
    ListUsersFeature,
    FindUserByIdFeature,
    UpdateUserFeature,
    DeleteUserFeature,
  ],
})
export class UserModule {}
