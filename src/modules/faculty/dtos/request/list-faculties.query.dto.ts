import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateQueryDto } from '../../../../common/dtos/request/paginate-query.request.dto';

export class ListFacultiesQueryDto extends PaginateQueryDto {
  @ApiPropertyOptional({ description: 'Filtra las facultades de una universidad' })
  @IsOptional()
  @IsUUID()
  institutionId?: string;
}
