import { PartialType } from '@nestjs/mapped-types';
import { CreateFacultyRequestDto } from './create-faculty.request.dto';

export class UpdateFacultyRequestDto extends PartialType(CreateFacultyRequestDto) {}
