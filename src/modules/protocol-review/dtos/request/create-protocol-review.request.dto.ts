import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProtocolStatus } from '@prisma/client';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

export const PROTOCOL_REVIEW_STATUSES = [ProtocolStatus.OBSERVED, ProtocolStatus.FINALIZED] as const;
export type ProtocolReviewStatus = (typeof PROTOCOL_REVIEW_STATUSES)[number];

export class CreateProtocolReviewRequestDto {
  @ApiProperty({
    enum: PROTOCOL_REVIEW_STATUSES,
    description: 'Resultado de la revisión: OBSERVED (observado) o FINALIZED (finalizado)',
  })
  @IsIn(PROTOCOL_REVIEW_STATUSES, { message: 'status debe ser OBSERVED o FINALIZED' })
  status: ProtocolReviewStatus;

  @ApiPropertyOptional({ description: 'Observaciones (obligatorias si el estado es OBSERVADO)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @UpperCase()
  observations?: string;
}
