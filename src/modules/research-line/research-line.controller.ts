import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { ListResearchLinesFeature } from './features/list-research-lines.feature';
import { FindResearchLineByIdFeature } from './features/find-research-line-by-id.feature';
import { ListResearchLinesQueryDto } from './dtos/request/list-research-lines.query.dto';
import { ResearchLineResponseDto } from './dtos/response/research-line.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';

@ApiTags('research-lines')
@ApiBearerAuth()
@Controller('research-lines')
@UseAuth(UserRole.ADMIN)
export class ResearchLineController {
  constructor(
    private readonly listResearchLinesFeature: ListResearchLinesFeature,
    private readonly findResearchLineByIdFeature: FindResearchLineByIdFeature,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar líneas de investigación' })
  @ApiPaginatedResponse(ResearchLineResponseDto)
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
  @ApiOperation({ summary: 'Obtener una línea de investigación por id' })
  @ApiParam({ name: 'id', description: 'Id de la línea de investigación' })
  @ApiOkResponse({ type: ResearchLineResponseDto })
  @ApiNotFoundResponse({ description: 'La línea de investigación no existe' })
  async findById(@Param('id') id: string): Promise<ResearchLineResponseDto> {
    const researchLine = await this.findResearchLineByIdFeature.execute(id);

    return ResearchLineResponseDto.from(researchLine);
  }
}
