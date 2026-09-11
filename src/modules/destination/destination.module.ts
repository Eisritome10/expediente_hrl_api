import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DestinationController } from './destination.controller';
import { CreateDestinationFeature } from './features/create-destination.feature';
import { ListDestinationsFeature } from './features/list-destinations.feature';
import { FindDestinationByIdFeature } from './features/find-destination-by-id.feature';
import { UpdateDestinationFeature } from './features/update-destination.feature';
import { DeleteDestinationFeature } from './features/delete-destination.feature';

@Module({
  imports: [PrismaModule],
  controllers: [DestinationController],
  providers: [
    CreateDestinationFeature,
    ListDestinationsFeature,
    FindDestinationByIdFeature,
    UpdateDestinationFeature,
    DeleteDestinationFeature,
  ],
})
export class DestinationModule {}
