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
import { CreateInstitutionFeature } from './features/create-institution.feature';
import { ListInstitutionsFeature } from './features/list-institutions.feature';
import { FindInstitutionByIdFeature } from './features/find-institution-by-id.feature';
import { UpdateInstitutionFeature } from './features/update-institution.feature';
import { DeleteInstitutionFeature } from './features/delete-institution.feature';
import { CreateInstitutionRequestDto } from './dtos/request/create-institution.request.dto';
import { UpdateInstitutionRequestDto } from './dtos/request/update-institution.request.dto';
import { ListInstitutionsQueryDto } from './dtos/request/list-institutions.query.dto';
import { InstitutionResponseDto } from './dtos/response/institution.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@ApiTags('institutions')
@ApiBearerAuth()
@Controller('institutions')
@UseAuth(UserRole.ADMIN)
export class InstitutionController {
  constructor(
    private readonly createInstitutionFeature: CreateInstitutionFeature,
    private readonly listInstitutionsFeature: ListInstitutionsFeature,
    private readonly findInstitutionByIdFeature: FindInstitutionByIdFeature,
    private readonly updateInstitutionFeature: UpdateInstitutionFeature,
    private readonly deleteInstitutionFeature: DeleteInstitutionFeature,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una institución' })
  @ApiCreatedResponse({ type: InstitutionResponseDto })
  async create(@Body() dto: CreateInstitutionRequestDto): Promise<InstitutionResponseDto> {
    const institution = await this.createInstitutionFeature.execute({
      name: dto.name,
      abbreviation: dto.abbreviation ?? null,
      esUniversidad: dto.esUniversidad ?? false,
    });

    return InstitutionResponseDto.from(institution);
  }

  @Get()
  @ApiOperation({ summary: 'Listar instituciones' })
  @ApiPaginatedResponse(InstitutionResponseDto)
  async list(@Query() query: ListInstitutionsQueryDto): Promise<PaginatedResultResponseDto<InstitutionResponseDto>> {
    const { data, page, limit, total } = await this.listInstitutionsFeature.execute(query.page, query.limit);

    return PaginatedResultResponseDto.from(data.map(InstitutionResponseDto.from), page, limit, total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una institución por id' })
  @ApiParam({ name: 'id', description: 'Id de la institución' })
  @ApiOkResponse({ type: InstitutionResponseDto })
  @ApiNotFoundResponse({ description: 'La institución no existe' })
  async findById(@Param('id') id: string): Promise<InstitutionResponseDto> {
    const institution = await this.findInstitutionByIdFeature.execute(id);

    return InstitutionResponseDto.from(institution);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una institución' })
  @ApiParam({ name: 'id', description: 'Id de la institución' })
  @ApiOkResponse({ type: InstitutionResponseDto })
  @ApiNotFoundResponse({ description: 'La institución no existe' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInstitutionRequestDto,
  ): Promise<InstitutionResponseDto> {
    const institution = await this.updateInstitutionFeature.execute(id, dto);

    return InstitutionResponseDto.from(institution);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una institución' })
  @ApiParam({ name: 'id', description: 'Id de la institución' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'La institución no existe' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteInstitutionFeature.execute(id);
  }
}
