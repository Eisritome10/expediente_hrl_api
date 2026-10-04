import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObservationType } from '@prisma/client';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

export class ProtocolReviewObservationRequestDto {
  @ApiProperty({
    enum: ObservationType,
    description:
      'Tipo de observación: INFORMED_CONSENT (consentimiento informado), ETHICS_CONSTANCE (constancia ética), ADMINISTRATIVE (administrativa / documentos), METHODOLOGICAL (metodológica) o LEGAL_INSTITUTIONAL (legal / institucional)',
  })
  @IsEnum(ObservationType)
  type: ObservationType;

  @ApiProperty({ description: 'Texto de la observación' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @UpperCase()
  text: string;
}
