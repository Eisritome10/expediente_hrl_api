import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config/app-config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResearcherModule } from './modules/researcher/researcher.module';
import { InstitutionModule } from './modules/institution/institution.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { DestinationModule } from './modules/destination/destination.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeederModule } from './seeder/seeder.module';
import { ResearchLineModule } from './modules/research-line/research-line.module';
import { ModalityModule } from './modules/modality/modality.module';
import { StudyDesignModule } from './modules/study-design/study-design.module';
import { ProtocolModule } from './modules/protocol/protocol.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    SeederModule,
    AuthModule,
    ResearcherModule,
    InstitutionModule,
    FacultyModule,
    DestinationModule,
    ResearchLineModule,
    ModalityModule,
    StudyDesignModule,
    ProtocolModule,
  ],
})
export class AppModule {}
