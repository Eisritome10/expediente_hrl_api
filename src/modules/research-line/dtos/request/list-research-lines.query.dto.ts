import { IsEnum, IsOptional } from 'class-validator';
import { LineType } from '@prisma/client';
import { PaginateQueryDto } from '../../../../common/dtos/request/paginate-query.request.dto';

export class ListResearchLinesQueryDto extends PaginateQueryDto {
  @IsOptional()
  @IsEnum(LineType)
  type?: LineType;
}
