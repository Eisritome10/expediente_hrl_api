import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
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
  @ApiConflictResponse({ description: 'El protocolo ya está finalizado' })
  @ApiForbiddenResponse({ description: 'El revisor no existe o no está activo' })
  async create(
    @Param('protocolId') protocolId: string,
    @Body() dto: CreateProtocolReviewRequestDto,
    @CurrentUser() user: AuthCurrentUser,
  ): Promise<ProtocolReviewResponseDto> {
    const review = await this.createProtocolReviewFeature.execute({
      protocolId,
      reviewerId: user.id,
      status: dto.status,
      observations: dto.observations ?? null,
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
