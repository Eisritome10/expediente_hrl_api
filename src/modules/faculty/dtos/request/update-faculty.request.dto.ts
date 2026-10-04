import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFacultyRequestDto } from './create-faculty.request.dto';

// La universidad de una facultad no cambia: solo se puede renombrar.
export class UpdateFacultyRequestDto extends PartialType(OmitType(CreateFacultyRequestDto, ['institutionId'] as const)) {}
