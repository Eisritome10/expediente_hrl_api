import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ResearchLineController } from './research-line.controller';
import { ListResearchLinesFeature } from './features/list-research-lines.feature';
import { FindResearchLineByIdFeature } from './features/find-research-line-by-id.feature';
import { CreateResearchLineFeature } from './features/create-research-line.feature';
import { UpdateResearchLineFeature } from './features/update-research-line.feature';
import { DeleteResearchLineFeature } from './features/delete-research-line.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ResearchLineController],
  providers: [
    ListResearchLinesFeature,
    FindResearchLineByIdFeature,
    CreateResearchLineFeature,
    UpdateResearchLineFeature,
    DeleteResearchLineFeature,
  ],
})
export class ResearchLineModule {}