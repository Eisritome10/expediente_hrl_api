import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
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
import { CreateAgreementFeature } from './features/create-agreement.feature';
import { ListAgreementsFeature } from './features/list-agreements.feature';
import { FindAgreementByIdFeature } from './features/find-agreement-by-id.feature';
import { UpdateAgreementFeature } from './features/update-agreement.feature';
import { DeleteAgreementFeature } from './features/delete-agreement.feature';
import { CreateAgreementRequestDto } from './dtos/request/create-agreement.request.dto';
import { UpdateAgreementRequestDto } from './dtos/request/update-agreement.request.dto';
import { ListAgreementsQueryDto } from './dtos/request/list-agreements.query.dto';
import { AgreementResponseDto } from './dtos/response/agreement.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@ApiTags('Convenios')
@ApiBearerAuth()
@Controller('agreements')
@UseAuth(UserRole.ADMIN)
export class AgreementController {
  constructor(
    private readonly createAgreementFeature: CreateAgreementFeature,
    private readonly listAgreementsFeature: ListAgreementsFeature,
    private readonly findAgreementByIdFeature: FindAgreementByIdFeature,
    private readonly updateAgreementFeature: UpdateAgreementFeature,
    private readonly deleteAgreementFeature: DeleteAgreementFeature,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un convenio' })
  @ApiCreatedResponse({ type: AgreementResponseDto })
  async create(@Body() dto: CreateAgreementRequestDto): Promise<AgreementResponseDto> {
    const agreement = await this.createAgreementFeature.execute({ name: dto.name });

    return AgreementResponseDto.from(agreement);
  }

  @Get()
  @ApiOperation({ summary: 'Listar convenios' })
  @ApiPaginatedResponse(AgreementResponseDto)
  async list(@Query() query: ListAgreementsQueryDto): Promise<PaginatedResultResponseDto<AgreementResponseDto>> {
    const { data, page, limit, total } = await this.listAgreementsFeature.execute(query.page, query.limit);

    return PaginatedResultResponseDto.from(data.map(AgreementResponseDto.from), page, limit, total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un convenio por id' })
  @ApiParam({ name: 'id', description: 'Id del convenio' })
  @ApiOkResponse({ type: AgreementResponseDto })
  @ApiNotFoundResponse({ description: 'El convenio no existe' })
  async findById(@Param('id') id: string): Promise<AgreementResponseDto> {
    const agreement = await this.findAgreementByIdFeature.execute(id);

    return AgreementResponseDto.from(agreement);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un convenio' })
  @ApiParam({ name: 'id', description: 'Id del convenio' })
  @ApiOkResponse({ type: AgreementResponseDto })
  @ApiNotFoundResponse({ description: 'El convenio no existe' })
  async update(@Param('id') id: string, @Body() dto: UpdateAgreementRequestDto): Promise<AgreementResponseDto> {
    const agreement = await this.updateAgreementFeature.execute(id, dto);

    return AgreementResponseDto.from(agreement);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un convenio' })
  @ApiParam({ name: 'id', description: 'Id del convenio' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'El convenio no existe' })
  @ApiConflictResponse({ description: 'El convenio está asociado a uno o más protocolos' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteAgreementFeature.execute(id);
  }
}
