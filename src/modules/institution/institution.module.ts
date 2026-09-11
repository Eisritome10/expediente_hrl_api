import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { InstitutionController } from './institution.controller';
import { CreateInstitutionFeature } from './features/create-institution.feature';
import { ListInstitutionsFeature } from './features/list-institutions.feature';
import { FindInstitutionByIdFeature } from './features/find-institution-by-id.feature';
import { UpdateInstitutionFeature } from './features/update-institution.feature';
import { DeleteInstitutionFeature } from './features/delete-institution.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InstitutionController],
  providers: [
    CreateInstitutionFeature,
    ListInstitutionsFeature,
    FindInstitutionByIdFeature,
    UpdateInstitutionFeature,
    DeleteInstitutionFeature,
  ],
})
export class InstitutionModule {}
