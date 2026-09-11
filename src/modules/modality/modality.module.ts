import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ModalityController } from './modality.controller';
import { CreateModalityFeature } from './features/create-modality.feature';
import { ListModalitiesFeature } from './features/list-modalities.feature';
import { FindModalityByIdFeature } from './features/find-modality-by-id.feature';
import { UpdateModalityFeature } from './features/update-modality.feature';
import { DeleteModalityFeature } from './features/delete-modality.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ModalityController],
  providers: [
    CreateModalityFeature,
    ListModalitiesFeature,
    FindModalityByIdFeature,
    UpdateModalityFeature,
    DeleteModalityFeature,
  ],
})
export class ModalityModule {}
