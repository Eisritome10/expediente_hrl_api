import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StudyDesignController } from './study-design.controller';
import { CreateStudyDesignFeature } from './features/create-study-design.feature';
import { ListStudyDesignsFeature } from './features/list-study-designs.feature';
import { FindStudyDesignByIdFeature } from './features/find-study-design-by-id.feature';
import { UpdateStudyDesignFeature } from './features/update-study-design.feature';
import { DeleteStudyDesignFeature } from './features/delete-study-design.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StudyDesignController],
  providers: [
    CreateStudyDesignFeature,
    ListStudyDesignsFeature,
    FindStudyDesignByIdFeature,
    UpdateStudyDesignFeature,
    DeleteStudyDesignFeature,
  ],
})
export class StudyDesignModule {}
