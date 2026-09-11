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
import { CreateDestinationFeature } from './features/create-destination.feature';
import { ListDestinationsFeature } from './features/list-destinations.feature';
import { FindDestinationByIdFeature } from './features/find-destination-by-id.feature';
import { UpdateDestinationFeature } from './features/update-destination.feature';
import { DeleteDestinationFeature } from './features/delete-destination.feature';
import { CreateDestinationRequestDto } from './dtos/request/create-destination.request.dto';
import { UpdateDestinationRequestDto } from './dtos/request/update-destination.request.dto';
import { ListDestinationsQueryDto } from './dtos/request/list-destinations.query.dto';
import { DestinationResponseDto } from './dtos/response/destination.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@ApiTags('destinations')
@ApiBearerAuth()
@Controller('destinations')
@UseAuth(UserRole.ADMIN)
export class DestinationController {
  constructor(
    private readonly createDestinationFeature: CreateDestinationFeature,
    private readonly listDestinationsFeature: ListDestinationsFeature,
    private readonly findDestinationByIdFeature: FindDestinationByIdFeature,
    private readonly updateDestinationFeature: UpdateDestinationFeature,
    private readonly deleteDestinationFeature: DeleteDestinationFeature,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un destino' })
  @ApiCreatedResponse({ type: DestinationResponseDto })
  async create(@Body() dto: CreateDestinationRequestDto): Promise<DestinationResponseDto> {
    const destination = await this.createDestinationFeature.execute({ description: dto.description });

    return DestinationResponseDto.from(destination);
  }

  @Get()
  @ApiOperation({ summary: 'Listar destinos' })
  @ApiPaginatedResponse(DestinationResponseDto)
  async list(
    @Query() query: ListDestinationsQueryDto,
  ): Promise<PaginatedResultResponseDto<DestinationResponseDto>> {
    const { data, page, limit, total } = await this.listDestinationsFeature.execute(query.page, query.limit);

    return PaginatedResultResponseDto.from(data.map(DestinationResponseDto.from), page, limit, total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un destino por id' })
  @ApiParam({ name: 'id', description: 'Id del destino' })
  @ApiOkResponse({ type: DestinationResponseDto })
  @ApiNotFoundResponse({ description: 'El destino no existe' })
  async findById(@Param('id') id: string): Promise<DestinationResponseDto> {
    const destination = await this.findDestinationByIdFeature.execute(id);

    return DestinationResponseDto.from(destination);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un destino' })
  @ApiParam({ name: 'id', description: 'Id del destino' })
  @ApiOkResponse({ type: DestinationResponseDto })
  @ApiNotFoundResponse({ description: 'El destino no existe' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDestinationRequestDto,
  ): Promise<DestinationResponseDto> {
    const destination = await this.updateDestinationFeature.execute(id, dto);

    return DestinationResponseDto.from(destination);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un destino' })
  @ApiParam({ name: 'id', description: 'Id del destino' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'El destino no existe' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteDestinationFeature.execute(id);
  }
}
