import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config/app-config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResearcherModule } from './modules/researcher/researcher.module';
import { UserModule } from './modules/user/user.module';
import { InstitutionModule } from './modules/institution/institution.module';
import { DestinationModule } from './modules/destination/destination.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeederModule } from './seeder/seeder.module';
import { ResearchLineModule } from './modules/research-line/research-line.module';
import { ModalityModule } from './modules/modality/modality.module';
import { StudyDesignModule } from './modules/study-design/study-design.module';
import { AgreementModule } from './modules/agreement/agreement.module';
import { ProtocolModule } from './modules/protocol/protocol.module';
import { ProtocolReviewModule } from './modules/protocol-review/protocol-review.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    SeederModule,
    AuthModule,
    ResearcherModule,
    UserModule,
    InstitutionModule,
    DestinationModule,
    ResearchLineModule,
    ModalityModule,
    StudyDesignModule,
    AgreementModule,
    ProtocolModule,
    ProtocolReviewModule,
  ],
})
export class AppModule {}
