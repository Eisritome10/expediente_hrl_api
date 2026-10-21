
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class GetDashboardReportQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha inicial del reporte',
    example: '2026-07-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Fecha final del reporte',
    example: '2026-09-30',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
