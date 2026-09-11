import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { ListResearchLinesFeature } from './features/list-research-lines.feature';
import { FindResearchLineByIdFeature } from './features/find-research-line-by-id.feature';
import { ListResearchLinesQueryDto } from './dtos/request/list-research-lines.query.dto';
import { ResearchLineResponseDto } from './dtos/response/research-line.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@Controller('research-lines')
@UseAuth(UserRole.ADMIN)
export class ResearchLineController {
  constructor(
    private readonly listResearchLinesFeature: ListResearchLinesFeature,
    private readonly findResearchLineByIdFeature: FindResearchLineByIdFeature,
  ) {}

  @Get()
  async list(
    @Query() query: ListResearchLinesQueryDto,
  ): Promise<PaginatedResultResponseDto<ResearchLineResponseDto>> {
    const { data, page, limit, total } = await this.listResearchLinesFeature.execute(
      query.page,
      query.limit,
      query.type,
    );

    return PaginatedResultResponseDto.from(data.map(ResearchLineResponseDto.from), page, limit, total);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ResearchLineResponseDto> {
    const researchLine = await this.findResearchLineByIdFeature.execute(id);

    return ResearchLineResponseDto.from(researchLine);
  }
}
