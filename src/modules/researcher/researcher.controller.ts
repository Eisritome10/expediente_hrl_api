import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
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

@Controller('researchers')
export class ResearcherController {
  constructor(
    private readonly createResearcherFeature: CreateResearcherFeature,
    private readonly listResearchersFeature: ListResearchersFeature,
    private readonly findResearcherByIdFeature: FindResearcherByIdFeature,
    private readonly updateResearcherFeature: UpdateResearcherFeature,
    private readonly deleteResearcherFeature: DeleteResearcherFeature,
  ) {}

  @Post()
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
  async list(@Query() query: ListResearchersQueryDto): Promise<PaginatedResultResponseDto<ResearcherResponseDto>> {
    const { data, page, limit, total } = await this.listResearchersFeature.execute(query.page, query.limit);

    return PaginatedResultResponseDto.from(data.map(ResearcherResponseDto.from), page, limit, total);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ResearcherResponseDto> {
    const researcher = await this.findResearcherByIdFeature.execute(id);

    return ResearcherResponseDto.from(researcher);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateResearcherRequestDto,
  ): Promise<ResearcherResponseDto> {
    const researcher = await this.updateResearcherFeature.execute(id, dto);

    return ResearcherResponseDto.from(researcher);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteResearcherFeature.execute(id);
  }
}
