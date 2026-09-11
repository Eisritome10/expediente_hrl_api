import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config/app-config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResearcherModule } from './modules/researcher/researcher.module';
import { InstitutionModule } from './modules/institution/institution.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { DestinationModule } from './modules/destination/destination.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    ResearcherModule,
    InstitutionModule,
    FacultyModule,
    DestinationModule,
  ],
})
export class AppModule {}
