import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ModalityController } from './modality.controller';
import { ListModalitiesFeature } from './features/list-modalities.feature';
import { FindModalityByIdFeature } from './features/find-modality-by-id.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ModalityController],
  providers: [ListModalitiesFeature, FindModalityByIdFeature],
})
export class ModalityModule {}
