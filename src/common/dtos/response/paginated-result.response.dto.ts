import { ApiProperty } from '@nestjs/swagger';

export class PaginatedMetaDto {
  @ApiProperty({ description: 'Página actual' })
  readonly page: number;

  @ApiProperty({ description: 'Cantidad de resultados por página' })
  readonly limit: number;

  @ApiProperty({ description: 'Cantidad total de resultados' })
  readonly total: number;

  private constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
  }

  static from(page: number, limit: number, total: number): PaginatedMetaDto {
    return new PaginatedMetaDto(page, limit, total);
  }
}

export class PaginatedResultResponseDto<T> {
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: PaginatedMetaDto })
  readonly meta: PaginatedMetaDto;

  private constructor(data: T[], meta: PaginatedMetaDto) {
    this.data = data;
    this.meta = meta;
  }

  static from<T>(data: T[], page: number, limit: number, total: number): PaginatedResultResponseDto<T> {
    return new PaginatedResultResponseDto(data, PaginatedMetaDto.from(page, limit, total));
  }
}
