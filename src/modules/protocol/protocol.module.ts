import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProtocolController } from './protocol.controller';
import { CreateProtocolFeature } from './features/create-protocol.feature';
import { ListProtocolsFeature } from './features/list-protocols.feature';
import { FindProtocolByIdFeature } from './features/find-protocol-by-id.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProtocolController],
  providers: [CreateProtocolFeature, ListProtocolsFeature, FindProtocolByIdFeature],
})
export class ProtocolModule {}
