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
import { CreateStudyDesignFeature } from './features/create-study-design.feature';
import { ListStudyDesignsFeature } from './features/list-study-designs.feature';
import { FindStudyDesignByIdFeature } from './features/find-study-design-by-id.feature';
import { UpdateStudyDesignFeature } from './features/update-study-design.feature';
import { DeleteStudyDesignFeature } from './features/delete-study-design.feature';
import { CreateStudyDesignRequestDto } from './dtos/request/create-study-design.request.dto';
import { UpdateStudyDesignRequestDto } from './dtos/request/update-study-design.request.dto';
import { ListStudyDesignsQueryDto } from './dtos/request/list-study-designs.query.dto';
import { StudyDesignResponseDto } from './dtos/response/study-design.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@ApiTags('study-designs')
@ApiBearerAuth()
@Controller('study-designs')
@UseAuth(UserRole.ADMIN)
export class StudyDesignController {
  constructor(
    private readonly createStudyDesignFeature: CreateStudyDesignFeature,
    private readonly listStudyDesignsFeature: ListStudyDesignsFeature,
    private readonly findStudyDesignByIdFeature: FindStudyDesignByIdFeature,
    private readonly updateStudyDesignFeature: UpdateStudyDesignFeature,
    private readonly deleteStudyDesignFeature: DeleteStudyDesignFeature,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un diseño de estudio' })
  @ApiCreatedResponse({ type: StudyDesignResponseDto })
  async create(@Body() dto: CreateStudyDesignRequestDto): Promise<StudyDesignResponseDto> {
    const studyDesign = await this.createStudyDesignFeature.execute({ name: dto.name });

    return StudyDesignResponseDto.from(studyDesign);
  }

  @Get()
  @ApiOperation({ summary: 'Listar diseños de estudio' })
  @ApiPaginatedResponse(StudyDesignResponseDto)
  async list(@Query() query: ListStudyDesignsQueryDto): Promise<PaginatedResultResponseDto<StudyDesignResponseDto>> {
    const { data, page, limit, total } = await this.listStudyDesignsFeature.execute(query.page, query.limit);

    return PaginatedResultResponseDto.from(data.map(StudyDesignResponseDto.from), page, limit, total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un diseño de estudio por id' })
  @ApiParam({ name: 'id', description: 'Id del diseño de estudio' })
  @ApiOkResponse({ type: StudyDesignResponseDto })
  @ApiNotFoundResponse({ description: 'El diseño de estudio no existe' })
  async findById(@Param('id') id: string): Promise<StudyDesignResponseDto> {
    const studyDesign = await this.findStudyDesignByIdFeature.execute(id);

    return StudyDesignResponseDto.from(studyDesign);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un diseño de estudio' })
  @ApiParam({ name: 'id', description: 'Id del diseño de estudio' })
  @ApiOkResponse({ type: StudyDesignResponseDto })
  @ApiNotFoundResponse({ description: 'El diseño de estudio no existe' })
  async update(@Param('id') id: string, @Body() dto: UpdateStudyDesignRequestDto): Promise<StudyDesignResponseDto> {
    const studyDesign = await this.updateStudyDesignFeature.execute(id, dto);

    return StudyDesignResponseDto.from(studyDesign);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un diseño de estudio' })
  @ApiParam({ name: 'id', description: 'Id del diseño de estudio' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'El diseño de estudio no existe' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteStudyDesignFeature.execute(id);
  }
}
