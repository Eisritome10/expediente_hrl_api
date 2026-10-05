import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthCurrentUser } from '../../common/interfaces/auth-current-user.interface';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';
import { CreateProtocolReviewFeature } from './features/create-protocol-review.feature';
import { ListProtocolReviewsFeature } from './features/list-protocol-reviews.feature';
import { CreateProtocolReviewRequestDto } from './dtos/request/create-protocol-review.request.dto';
import { ListProtocolReviewsQueryDto } from './dtos/request/list-protocol-reviews.query.dto';
import { ProtocolReviewResponseDto } from './dtos/response/protocol-review.response.dto';

@ApiTags('protocol-reviews')
@ApiBearerAuth()
@Controller('protocols/:protocolId/reviews')
@UseAuth(UserRole.ADMIN)
export class ProtocolReviewController {
  constructor(
    private readonly createProtocolReviewFeature: CreateProtocolReviewFeature,
    private readonly listProtocolReviewsFeature: ListProtocolReviewsFeature,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una revisión de protocolo' })
  @ApiParam({ name: 'protocolId', description: 'Id del protocolo' })
  @ApiCreatedResponse({ type: ProtocolReviewResponseDto })
  @ApiNotFoundResponse({ description: 'El protocolo no existe' })
  @ApiBadRequestResponse({
    description:
      'Outcome invalido para el comite, observaciones faltantes o sin texto, riesgo en un dictamen CIC, o finalizacion sin nivel de riesgo',
  })
  @ApiConflictResponse({
    description:
      'El protocolo ya esta finalizado, el comite CIC esta cerrado, falta la aprobacion del CIC, hay una observacion CIEI pendiente de corregir, o el protocolo cambio de estado en paralelo',
  })
  @ApiForbiddenResponse({ description: 'El revisor no existe o no está activo' })
  async create(
    @Param('protocolId') protocolId: string,
    @Body() dto: CreateProtocolReviewRequestDto,
    @CurrentUser() user: AuthCurrentUser,
  ): Promise<ProtocolReviewResponseDto> {
    const review = await this.createProtocolReviewFeature.execute({
      protocolId,
      reviewerId: user.id,
      committee: dto.committee,
      outcome: dto.outcome,
      observations: (dto.observations ?? []).map(({ type, text }) => ({ type, text })),
      catalogadoRiesgo: dto.catalogadoRiesgo,
    });

    return ProtocolReviewResponseDto.from(review);
  }

  @Get()
  @ApiOperation({ summary: 'Listar el historial de revisiones de un protocolo' })
  @ApiParam({ name: 'protocolId', description: 'Id del protocolo' })
  @ApiPaginatedResponse(ProtocolReviewResponseDto)
  @ApiNotFoundResponse({ description: 'El protocolo no existe' })
  async list(
    @Param('protocolId') protocolId: string,
    @Query() query: ListProtocolReviewsQueryDto,
  ): Promise<PaginatedResultResponseDto<ProtocolReviewResponseDto>> {
    const { data, page, limit, total } = await this.listProtocolReviewsFeature.execute(
      protocolId,
      query.page,
      query.limit,
    );

    return PaginatedResultResponseDto.from(data.map(ProtocolReviewResponseDto.from), page, limit, total);
  }
}
