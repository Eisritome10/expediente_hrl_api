import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateResearcherRequestDto } from './create-researcher.request.dto';

export class UpdateResearcherRequestDto extends PartialType(
  OmitType(CreateResearcherRequestDto, ['dni'] as const),
) {}
