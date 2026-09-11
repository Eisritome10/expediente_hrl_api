import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { CreateFacultyFeature } from './features/create-faculty.feature';
import { ListFacultiesFeature } from './features/list-faculties.feature';
import { FindFacultyByIdFeature } from './features/find-faculty-by-id.feature';
import { UpdateFacultyFeature } from './features/update-faculty.feature';
import { DeleteFacultyFeature } from './features/delete-faculty.feature';
import { CreateFacultyRequestDto } from './dtos/request/create-faculty.request.dto';
import { UpdateFacultyRequestDto } from './dtos/request/update-faculty.request.dto';
import { ListFacultiesQueryDto } from './dtos/request/list-faculties.query.dto';
import { FacultyResponseDto } from './dtos/response/faculty.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@Controller('faculties')
@UseAuth(UserRole.ADMIN)
export class FacultyController {
  constructor(
    private readonly createFacultyFeature: CreateFacultyFeature,
    private readonly listFacultiesFeature: ListFacultiesFeature,
    private readonly findFacultyByIdFeature: FindFacultyByIdFeature,
    private readonly updateFacultyFeature: UpdateFacultyFeature,
    private readonly deleteFacultyFeature: DeleteFacultyFeature,
  ) {}

  @Post()
  async create(@Body() dto: CreateFacultyRequestDto): Promise<FacultyResponseDto> {
    const faculty = await this.createFacultyFeature.execute({ name: dto.name });

    return FacultyResponseDto.from(faculty);
  }

  @Get()
  async list(@Query() query: ListFacultiesQueryDto): Promise<PaginatedResultResponseDto<FacultyResponseDto>> {
    const { data, page, limit, total } = await this.listFacultiesFeature.execute(query.page, query.limit);

    return PaginatedResultResponseDto.from(data.map(FacultyResponseDto.from), page, limit, total);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<FacultyResponseDto> {
    const faculty = await this.findFacultyByIdFeature.execute(id);

    return FacultyResponseDto.from(faculty);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFacultyRequestDto): Promise<FacultyResponseDto> {
    const faculty = await this.updateFacultyFeature.execute(id, dto);

    return FacultyResponseDto.from(faculty);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteFacultyFeature.execute(id);
  }
}
