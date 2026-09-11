import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FacultyController } from './faculty.controller';
import { CreateFacultyFeature } from './features/create-faculty.feature';
import { ListFacultiesFeature } from './features/list-faculties.feature';
import { FindFacultyByIdFeature } from './features/find-faculty-by-id.feature';
import { UpdateFacultyFeature } from './features/update-faculty.feature';
import { DeleteFacultyFeature } from './features/delete-faculty.feature';

@Module({
  imports: [PrismaModule],
  controllers: [FacultyController],
  providers: [
    CreateFacultyFeature,
    ListFacultiesFeature,
    FindFacultyByIdFeature,
    UpdateFacultyFeature,
    DeleteFacultyFeature,
  ],
})
export class FacultyModule {}
