import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { CreateResearcherFeature } from './features/create-researcher.feature';
import { ListResearchersFeature } from './features/list-researchers.feature';
import { FindResearcherByIdFeature } from './features/find-researcher-by-id.feature';
import { UpdateResearcherFeature } from './features/update-researcher.feature';
import { DeleteResearcherFeature } from './features/delete-researcher.feature';
import { CreateResearcherRequestDto } from './dtos/request/create-researcher.request.dto';
import { UpdateResearcherRequestDto } from './dtos/request/update-researcher.request.dto';
import { ListResearchersQueryDto } from './dtos/request/list-researchers.query.dto';
import { ResearcherResponseDto } from './dtos/response/researcher.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@ApiTags('researchers')
@ApiBearerAuth()
@Controller('researchers')
@UseAuth(UserRole.ADMIN)
export class ResearcherController {
  constructor(
    private readonly createResearcherFeature: CreateResearcherFeature,
    private readonly listResearchersFeature: ListResearchersFeature,
    private readonly findResearcherByIdFeature: FindResearcherByIdFeature,
    private readonly updateResearcherFeature: UpdateResearcherFeature,
    private readonly deleteResearcherFeature: DeleteResearcherFeature,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un investigador' })
  @ApiCreatedResponse({ type: ResearcherResponseDto })
  async create(@Body() dto: CreateResearcherRequestDto): Promise<ResearcherResponseDto> {
    const researcher = await this.createResearcherFeature.execute({
      dni: dto.dni,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
    });

    return ResearcherResponseDto.from(researcher);
  }

  @Get()
  @ApiOperation({ summary: 'Listar investigadores' })
  @ApiPaginatedResponse(ResearcherResponseDto)
  async list(@Query() query: ListResearchersQueryDto): Promise<PaginatedResultResponseDto<ResearcherResponseDto>> {
    const { data, page, limit, total } = await this.listResearchersFeature.execute(query.page, query.limit);

    return PaginatedResultResponseDto.from(data.map(ResearcherResponseDto.from), page, limit, total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un investigador por id' })
  @ApiParam({ name: 'id', description: 'Id del investigador' })
  @ApiOkResponse({ type: ResearcherResponseDto })
  @ApiNotFoundResponse({ description: 'El investigador no existe' })
  async findById(@Param('id') id: string): Promise<ResearcherResponseDto> {
    const researcher = await this.findResearcherByIdFeature.execute(id);

    return ResearcherResponseDto.from(researcher);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un investigador' })
  @ApiParam({ name: 'id', description: 'Id del investigador' })
  @ApiOkResponse({ type: ResearcherResponseDto })
  @ApiNotFoundResponse({ description: 'El investigador no existe' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateResearcherRequestDto,
  ): Promise<ResearcherResponseDto> {
    const researcher = await this.updateResearcherFeature.execute(id, dto);

    return ResearcherResponseDto.from(researcher);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un investigador' })
  @ApiParam({ name: 'id', description: 'Id del investigador' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'El investigador no existe' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteResearcherFeature.execute(id);
  }
}
