import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config/app-config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResearcherModule } from './modules/researcher/researcher.module';

@Module({
  imports: [AppConfigModule, PrismaModule, ResearcherModule],
})
export class AppModule {}
