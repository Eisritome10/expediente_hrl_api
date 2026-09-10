import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/infrastructure/app-config/app-config.module';
import { PrismaModule } from './common/infrastructure/database/prisma/prisma.module';

@Module({
  imports: [AppConfigModule, PrismaModule],
})
export class AppModule {}
