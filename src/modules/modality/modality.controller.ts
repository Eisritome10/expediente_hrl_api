import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { ListModalitiesFeature } from './features/list-modalities.feature';
import { FindModalityByIdFeature } from './features/find-modality-by-id.feature';
import { ListModalitiesQueryDto } from './dtos/request/list-modalities.query.dto';
import { ModalityResponseDto } from './dtos/response/modality.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@Controller('modalities')
@UseAuth(UserRole.ADMIN)
export class ModalityController {
  constructor(
    private readonly listModalitiesFeature: ListModalitiesFeature,
    private readonly findModalityByIdFeature: FindModalityByIdFeature,
  ) {}

  @Get()
  async list(@Query() query: ListModalitiesQueryDto): Promise<PaginatedResultResponseDto<ModalityResponseDto>> {
    const { data, page, limit, total } = await this.listModalitiesFeature.execute(query.page, query.limit);

    return PaginatedResultResponseDto.from(data.map(ModalityResponseDto.from), page, limit, total);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ModalityResponseDto> {
    const modality = await this.findModalityByIdFeature.execute(id);

    return ModalityResponseDto.from(modality);
  }
}
