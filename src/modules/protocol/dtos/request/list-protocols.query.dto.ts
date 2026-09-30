import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProtocolStatus } from '@prisma/client';
import { PaginateQueryDto } from '../../../../common/dtos/request/paginate-query.request.dto';

export class ListProtocolsQueryDto extends PaginateQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por número de expediente (coincidencia parcial)' })
  @IsOptional()
  @IsString()
  nroExpediente?: string;

  @ApiPropertyOptional({ description: 'Filtrar por id del investigador principal' })
  @IsOptional()
  @IsUUID()
  investigadorPrincipalId?: string;

  @ApiPropertyOptional({ description: 'Fecha de recepción desde', example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  fechaRecepcionDesde?: string;

  @ApiPropertyOptional({ description: 'Fecha de recepción hasta', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  fechaRecepcionHasta?: string;

  @ApiPropertyOptional({
    enum: ProtocolStatus,
    description: 'Filtrar por estado del protocolo: CREATED, CIC_OBSERVED, CIC_CORRECTED, CIEI_OBSERVED, CIEI_CORRECTED, FINALIZED',
  })
  @IsOptional()
  @IsEnum(ProtocolStatus)
  status?: ProtocolStatus;
}
