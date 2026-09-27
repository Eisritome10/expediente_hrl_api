import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AgreementController } from './agreement.controller';
import { CreateAgreementFeature } from './features/create-agreement.feature';
import { ListAgreementsFeature } from './features/list-agreements.feature';
import { FindAgreementByIdFeature } from './features/find-agreement-by-id.feature';
import { UpdateAgreementFeature } from './features/update-agreement.feature';
import { DeleteAgreementFeature } from './features/delete-agreement.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AgreementController],
  providers: [
    CreateAgreementFeature,
    ListAgreementsFeature,
    FindAgreementByIdFeature,
    UpdateAgreementFeature,
    DeleteAgreementFeature,
  ],
})
export class AgreementModule {}
