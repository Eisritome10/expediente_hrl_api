import { PartialType } from '@nestjs/swagger';
import { CreateModalityRequestDto } from './create-modality.request.dto';

export class UpdateModalityRequestDto extends PartialType(CreateModalityRequestDto) {}
