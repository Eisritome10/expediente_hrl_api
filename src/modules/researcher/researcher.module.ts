import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ResearcherController } from './researcher.controller';
import { CreateResearcherFeature } from './features/create-researcher.feature';
import { ListResearchersFeature } from './features/list-researchers.feature';
import { FindResearcherByIdFeature } from './features/find-researcher-by-id.feature';
import { UpdateResearcherFeature } from './features/update-researcher.feature';
import { DeleteResearcherFeature } from './features/delete-researcher.feature';

@Module({
  imports: [PrismaModule],
  controllers: [ResearcherController],
  providers: [
    CreateResearcherFeature,
    ListResearchersFeature,
    FindResearcherByIdFeature,
    UpdateResearcherFeature,
    DeleteResearcherFeature,
  ],
})
export class ResearcherModule {}
