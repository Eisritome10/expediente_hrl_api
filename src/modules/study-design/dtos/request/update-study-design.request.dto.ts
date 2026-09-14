import { PartialType } from '@nestjs/swagger';
import { CreateStudyDesignRequestDto } from './create-study-design.request.dto';

export class UpdateStudyDesignRequestDto extends PartialType(CreateStudyDesignRequestDto) {}
