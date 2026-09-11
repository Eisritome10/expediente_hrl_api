import { PartialType } from '@nestjs/swagger';
import { CreateFacultyRequestDto } from './create-faculty.request.dto';

export class UpdateFacultyRequestDto extends PartialType(CreateFacultyRequestDto) {}
