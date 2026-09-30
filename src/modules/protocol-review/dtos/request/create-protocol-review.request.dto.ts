import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Committee, ReviewOutcome, RiskLevel } from '@prisma/client';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

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

  @ApiPropertyOptional({ description: 'Observaciones (obligatorias si el resultado es OBSERVED)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @UpperCase()
  observations?: string;

  @ApiPropertyOptional({ description: 'Indica si el CIEI emitió constancia ética (solo se usa en revisiones del CIEI)' })
  @IsOptional()
  @IsBoolean()
  tieneConstanciaEtica?: boolean;

  @ApiPropertyOptional({ description: 'Identificador de la constancia ética emitida (solo se usa en revisiones del CIEI)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  idConstanciaEtica?: string;

  @ApiPropertyOptional({
    description: 'Fecha de emisión de la constancia ética en formato ISO (solo se usa en revisiones del CIEI)',
  })
  @IsOptional()
  @IsDateString()
  fechaConstancia?: string;

  @ApiPropertyOptional({
    enum: RiskLevel,
    description: 'Nivel de riesgo catalogado (solo se usa en revisiones del CIEI)',
  })
  @IsOptional()
  @IsEnum(RiskLevel)
  catalogadoRiesgo?: RiskLevel;

  @ApiPropertyOptional({ description: 'Indica si cuenta con consentimiento informado (solo se usa en revisiones del CIEI)' })
  @IsOptional()
  @IsBoolean()
  consentimientoInformado?: boolean;

  @ApiPropertyOptional({ description: 'Departamento al que se dirigió el permiso (solo se usa en revisiones del CIEI)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  departamentoDirigidoPermiso?: string;
}
