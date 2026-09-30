import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProtocolController } from './protocol.controller';
import { CreateProtocolFeature } from './features/create-protocol.feature';
import { ListProtocolsFeature } from './features/list-protocols.feature';
import { FindProtocolByIdFeature } from './features/find-protocol-by-id.feature';
import { UpdateProtocolFeature } from './features/update-protocol.feature';
import { ListResearcherProtocolsFeature } from './features/list-researcher-protocols.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProtocolController],
  providers: [
    CreateProtocolFeature,
    ListProtocolsFeature,
    ListResearcherProtocolsFeature,
    FindProtocolByIdFeature,
    UpdateProtocolFeature,
  ],
})
export class ProtocolModule {}
