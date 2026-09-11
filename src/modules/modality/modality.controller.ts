import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { CreateModalityFeature } from './features/create-modality.feature';
import { ListModalitiesFeature } from './features/list-modalities.feature';
import { FindModalityByIdFeature } from './features/find-modality-by-id.feature';
import { UpdateModalityFeature } from './features/update-modality.feature';
import { DeleteModalityFeature } from './features/delete-modality.feature';
import { CreateModalityRequestDto } from './dtos/request/create-modality.request.dto';
import { UpdateModalityRequestDto } from './dtos/request/update-modality.request.dto';
import { ListModalitiesQueryDto } from './dtos/request/list-modalities.query.dto';
import { ModalityResponseDto } from './dtos/response/modality.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@Controller('modalities')
@UseAuth(UserRole.ADMIN)
export class ModalityController {
  constructor(
    private readonly createModalityFeature: CreateModalityFeature,
    private readonly listModalitiesFeature: ListModalitiesFeature,
    private readonly findModalityByIdFeature: FindModalityByIdFeature,
    private readonly updateModalityFeature: UpdateModalityFeature,
    private readonly deleteModalityFeature: DeleteModalityFeature,
  ) {}

  @Post()
  async create(@Body() dto: CreateModalityRequestDto): Promise<ModalityResponseDto> {
    const modality = await this.createModalityFeature.execute({ name: dto.name, fee: dto.fee });

    return ModalityResponseDto.from(modality);
  }

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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateModalityRequestDto): Promise<ModalityResponseDto> {
    const modality = await this.updateModalityFeature.execute(id, dto);

    return ModalityResponseDto.from(modality);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteModalityFeature.execute(id);
  }
}
