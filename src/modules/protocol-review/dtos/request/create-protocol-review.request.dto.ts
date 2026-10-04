import { ArrayMaxSize, IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Committee, ReviewOutcome, RiskLevel } from '@prisma/client';
import { ProtocolReviewObservationRequestDto } from './protocol-review-observation.request.dto';

export class CreateProtocolReviewRequestDto {
  @ApiProperty({
    enum: Committee,
    description: 'Comité que realiza la revisión: CIC (Comité de Investigación Clínica) o CIEI (Comité de Ética)',
  })
  @IsEnum(Committee)
  committee: Committee;

  @ApiProperty({
    enum: ReviewOutcome,
    description: 'Resultado de la revisión: OBSERVED (observado), APPROVED (aprobado) o FINALIZED (finalizado)',
  })
  @IsEnum(ReviewOutcome)
  outcome: ReviewOutcome;

  @ApiPropertyOptional({
    type: [ProtocolReviewObservationRequestDto],
    description: 'Observaciones con su tipo (al menos una si el resultado es OBSERVED)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProtocolReviewObservationRequestDto)
  observations?: ProtocolReviewObservationRequestDto[];

  @ApiPropertyOptional({
    enum: RiskLevel,
    description: 'Nivel de riesgo catalogado (solo CIEI; obligatorio al finalizar)',
  })
  @IsOptional()
  @IsEnum(RiskLevel)
  catalogadoRiesgo?: RiskLevel;
}
