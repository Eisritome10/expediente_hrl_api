import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { ListResearchLinesFeature } from './features/list-research-lines.feature';
import { FindResearchLineByIdFeature } from './features/find-research-line-by-id.feature';
import { CreateResearchLineFeature } from './features/create-research-line.feature';
import { UpdateResearchLineFeature } from './features/update-research-line.feature';
import { DeleteResearchLineFeature } from './features/delete-research-line.feature';
import { CreateResearchLineRequestDto } from './dtos/request/create-research-line.request.dto';
import { UpdateResearchLineRequestDto } from './dtos/request/update-research-line.request.dto';
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
    private readonly createResearchLineFeature: CreateResearchLineFeature,
    private readonly updateResearchLineFeature: UpdateResearchLineFeature,
    private readonly deleteResearchLineFeature: DeleteResearchLineFeature,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una línea de investigación' })
  @ApiCreatedResponse({ type: ResearchLineResponseDto })
  async create(@Body() body: CreateResearchLineRequestDto): Promise<ResearchLineResponseDto> {
    const researchLine = await this.createResearchLineFeature.execute({
      name: body.name,
      type: body.type,
    });

    return ResearchLineResponseDto.from(researchLine);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una línea de investigación' })
  @ApiParam({ name: 'id', description: 'Id de la línea de investigación' })
  @ApiOkResponse({ type: ResearchLineResponseDto })
  @ApiNotFoundResponse({ description: 'La línea de investigación no existe' })
  async update(@Param('id') id: string, @Body() body: UpdateResearchLineRequestDto): Promise<ResearchLineResponseDto> {
    const researchLine = await this.updateResearchLineFeature.execute(id, body);  

    return ResearchLineResponseDto.from(researchLine);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una línea de investigación' })
  @ApiParam({ name: 'id', description: 'Id de la línea de investigación' })
  @ApiNoContentResponse({ description: 'Línea de investigación eliminada correctamente' })
  @ApiNotFoundResponse({ description: 'La línea de investigación no existe' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteResearchLineFeature.execute(id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar líneas de investigación' })
  @ApiPaginatedResponse(ResearchLineResponseDto)
  async list(@Query() query: ListResearchLinesQueryDto): Promise<PaginatedResultResponseDto<ResearchLineResponseDto>> {
    const { data, page, limit, total } = await this.listResearchLinesFeature.execute(
      query.page,
      query.limit,
      query.type,
    );

    return PaginatedResultResponseDto.from(
      data.map(ResearchLineResponseDto.from),
      page,
      limit,
      total,
    );
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