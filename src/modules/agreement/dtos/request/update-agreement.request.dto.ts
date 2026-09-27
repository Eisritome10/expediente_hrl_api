import { PartialType } from '@nestjs/swagger';
import { CreateAgreementRequestDto } from './create-agreement.request.dto';

export class UpdateAgreementRequestDto extends PartialType(CreateAgreementRequestDto) {}
