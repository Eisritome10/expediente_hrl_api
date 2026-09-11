import { PartialType } from '@nestjs/mapped-types';
import { CreateInstitutionRequestDto } from './create-institution.request.dto';

export class UpdateInstitutionRequestDto extends PartialType(CreateInstitutionRequestDto) {}
