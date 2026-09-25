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
import { CreateUserFeature } from './features/create-user.feature';
import { ListUsersFeature } from './features/list-users.feature';
import { FindUserByIdFeature } from './features/find-user-by-id.feature';
import { UpdateUserFeature } from './features/update-user.feature';
import { DeleteUserFeature } from './features/delete-user.feature';
import { CreateUserRequestDto } from './dtos/request/create-user.request.dto';
import { UpdateUserRequestDto } from './dtos/request/update-user.request.dto';
import { ListUsersQueryDto } from './dtos/request/list-users.query.dto';
import { UserResponseDto } from './dtos/response/user.response.dto';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseAuth(UserRole.ADMIN)
export class UserController {
  constructor(
    private readonly createUserFeature: CreateUserFeature,
    private readonly listUsersFeature: ListUsersFeature,
    private readonly findUserByIdFeature: FindUserByIdFeature,
    private readonly updateUserFeature: UpdateUserFeature,
    private readonly deleteUserFeature: DeleteUserFeature,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiCreatedResponse({ type: UserResponseDto })
  async create(@Body() dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.createUserFeature.execute({
      username: dto.username,
      fullName: dto.fullName,
      password: dto.password,
      role: dto.role,
      status: dto.status,
    });

    return UserResponseDto.from(user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiPaginatedResponse(UserResponseDto)
  async list(@Query() query: ListUsersQueryDto): Promise<PaginatedResultResponseDto<UserResponseDto>> {
    const { data, page, limit, total } = await this.listUsersFeature.execute(query.page, query.limit);

    return PaginatedResultResponseDto.from(data.map(UserResponseDto.from), page, limit, total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por id' })
  @ApiParam({ name: 'id', description: 'Id del usuario' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'El usuario no existe' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.findUserByIdFeature.execute(id);

    return UserResponseDto.from(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'Id del usuario' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'El usuario no existe' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.updateUserFeature.execute(id, dto);

    return UserResponseDto.from(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id', description: 'Id del usuario' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'El usuario no existe' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUserFeature.execute(id);
  }
}
