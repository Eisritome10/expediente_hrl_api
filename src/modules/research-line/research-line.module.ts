import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ResearchLineController } from './research-line.controller';
import { ListResearchLinesFeature } from './features/list-research-lines.feature';
import { FindResearchLineByIdFeature } from './features/find-research-line-by-id.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ResearchLineController],
  providers: [ListResearchLinesFeature, FindResearchLineByIdFeature],
})
export class ResearchLineModule {}
