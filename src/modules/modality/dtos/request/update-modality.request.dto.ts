import { PartialType } from '@nestjs/mapped-types';
import { CreateModalityRequestDto } from './create-modality.request.dto';

export class UpdateModalityRequestDto extends PartialType(CreateModalityRequestDto) {}
