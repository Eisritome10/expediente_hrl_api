import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateResearchLineRequestDto } from './create-research-line.request.dto';

export class UpdateResearchLineRequestDto extends PartialType(
  OmitType(CreateResearchLineRequestDto, [] as const),
) {}