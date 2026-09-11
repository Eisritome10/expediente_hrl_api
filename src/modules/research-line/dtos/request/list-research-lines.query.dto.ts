import { IsEnum, IsOptional } from 'class-validator';
import { LineType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateQueryDto } from '../../../../common/dtos/request/paginate-query.request.dto';

export class ListResearchLinesQueryDto extends PaginateQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por tipo de línea de investigación', enum: LineType })
  @IsOptional()
  @IsEnum(LineType)
  type?: LineType;
}
